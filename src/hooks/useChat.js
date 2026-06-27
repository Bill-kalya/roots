/**
 * useChat — Roots WebSocket chat hook
 *
 * Init sequence (order matters for encryption)
 * ─────────────────────────────────────────────
 *   1. resolveRoom()  → POST /conversations/resolve-room  → { room_id, … }
 *   2. fetchRoomKey() → GET  /conversations/room-key      → { key }
 *   3. initEncryption(key)   (WebCrypto key import, ~1 ms)
 *   4. openSocket()          WebSocket connects; first message is already encrypted
 *
 * Steps 2–3 happen before the socket opens so that every outbound message,
 * including any queued before the socket is ready, is encrypted.
 * If key fetch fails the hook degrades gracefully to plaintext.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearEncryption,
  encryptMessage,
  initEncryption,
  isEncryptionReady,
  safeDecryptMessage,
} from "../utils/encryption.js";

import { tokenStore } from "../lib/tokenStore.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const WS_BASE = import.meta.env.VITE_WS_URL || getDefaultWebSocketBase();
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MAX_BACKOFF_MS = 30_000;

function getDefaultWebSocketBase() {
  if (typeof window === "undefined") return "ws://localhost:8000";
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return tokenStore.getAccess();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function localTime() {
  return new Date().toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeMessage(m, fallback = {}) {
  return {
    id: m.id ?? fallback.id,
    from: m.from ?? fallback.from ?? "merchant",
    text: m.text ?? m.body ?? fallback.text ?? "",
    time: m.time ?? fallback.time ?? localTime(),
    status: m.status ?? fallback.status ?? "delivered",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {{ merchantId: string }} params
 */
export function useChat({ merchantId }) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [status, setStatus] = useState("idle");

  // Encryption status is tracked for debugging/UI in the future.
  // Current Chat.jsx does not consume it, so we only keep the setter.
  const [, setEncryptionStatus] = useState("off");


  const wsRef = useRef(null);
  const roomInfoRef = useRef(null); // { room_id, customer_id, merchant_id }
  const backoffRef = useRef(1_000);
  const reconnectTimer = useRef(null);
  const pendingQueue = useRef([]); // frames buffered while reconnecting
  const isMounted = useRef(true);

  const handleFrameRef = useRef(null);
  const scheduleReconnectRef = useRef(null);


  // ─── Safe state setter ────────────────────────────────────────────────────

  const safe = useCallback((setter, value) => {
    if (isMounted.current) setter(value);
  }, []);

  // ─── Upsert message ───────────────────────────────────────────────────────

  const upsertMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (msg.id == null) return [...prev, msg];
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx === -1) return [...prev, msg];
      const next = [...prev];
      next[idx] = { ...next[idx], ...msg };
      return next;
    });
  }, []);

  // ─── Decrypt helper ───────────────────────────────────────────────────────

  const tryDecrypt = useCallback(async (rawText, encrypted) => {
    if (!encrypted || !isEncryptionReady()) return rawText ?? "";
    return safeDecryptMessage(rawText ?? "");
  }, []);

  // ─── Step 1: Resolve room ─────────────────────────────────────────────────

  const resolveRoom = useCallback(async () => {
    if (!merchantId) throw new Error("merchantId is required");

    safe(setStatus, "resolving");

    const res = await fetch(`${API_BASE}/conversations/resolve-room`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ merchant_id: merchantId }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => String(res.status));
      throw new Error(`resolve-room ${res.status}: ${body}`);
    }

    const data = await res.json();
    roomInfoRef.current = data;
    return data; // { room_id, customer_id, merchant_id }
  }, [merchantId, safe]);

  // ─── Step 2 & 3: Fetch room key and init encryption ─────────────────────

  const fetchAndInitKey = useCallback(async (roomId) => {

    try {
      const res = await fetch(
        `${API_BASE}/conversations/room-key?room_id=${encodeURIComponent(roomId)}`,
        { headers: authHeaders() }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => String(res.status));
        throw new Error(`room-key ${res.status}: ${body}`);
      }

      const { key } = await res.json();
      await initEncryption(key);

      safe(setEncryptionStatus, "active");
      console.info("[useChat] E2EE active for room", roomId);
    } catch (err) {
      // Key fetch failed — degrade gracefully, don't block chat
      console.warn("[useChat] Key fetch failed, falling back to plaintext:", err.message);
      safe(setEncryptionStatus, "degraded");
    }
  }, [safe]);

  // ─── Step 4: Open WebSocket ───────────────────────────────────────────────

  const openSocket = useCallback((roomInfo) => {
    if (!isMounted.current) return;

    const token = getToken();
    const roomId = roomInfo?.room_id;
    if (!roomId) {
      safe(setStatus, "error");
      return;
    }

    safe(setStatus, "connecting");

    const url = `${WS_BASE}/ws/chat/${roomId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) {
        ws.close();
        return;
      }
      backoffRef.current = 1_000;

      // Flush messages buffered during reconnect
      while (pendingQueue.current.length) {
        ws.send(JSON.stringify(pendingQueue.current.shift()));
      }
    };

    ws.onmessage = ({ data }) => {
      if (!isMounted.current) return;
      let frame;
      try {
        frame = JSON.parse(data);
      } catch {
        return;
      }
      if (!frame?.type) return;
      handleFrameRef.current?.(frame);
    };

    ws.onclose = (evt) => {
      if (!isMounted.current) return;
      if (evt.code === 4001 || evt.code === 4003) {
        safe(setStatus, "error");
        return;
      }
      safe(setStatus, "reconnecting");
      scheduleReconnectRef.current?.();
    };


    ws.onerror = () => {
      // onclose fires after onerror and handles reconnect — just log here
      console.warn("[useChat] WebSocket error; reconnecting via onclose.");
    };
  }, [safe]);

  // ─── Frame dispatcher ────────────────────────────────────────────────────

  // kept as a stable callback and dispatched via handleFrameRef
  // keep as stable callback; dispatched via handleFrameRef
  // (reference wiring below ensures the callback is actually used)
  useEffect(() => {
    // keep handleFrameRef in sync with the latest callback implementation
    handleFrameRef.current = (frame) => {
      switch (frame.type) {

        case "conversation": {
          safe(setConversation, frame.conversation ?? frame);
          safe(setStatus, "open");
          break;
        }

        case "history": {
          const items = Array.isArray(frame.messages ?? frame.history)
            ? frame.messages ?? frame.history
            : [];

          const customerId = roomInfoRef.current?.customer_id;

          Promise.all(
            items.map(async (m) => {
              const text = await tryDecrypt(m.text ?? m.content ?? m.body, m.encrypted);
              return normalizeMessage(
                { ...m, text },
                {
                  from: m.from ?? (m.sender_id === customerId ? "customer" : "merchant"),
                  time: m.time ?? "",
                  status: m.status ?? "delivered",
                }
              );
            })
          ).then((normalized) => {
            safe(setMessages, normalized);
            safe(setStatus, "open");
          });
          break;
        }

        case "message": {
          const customerId = roomInfoRef.current?.customer_id;

          Promise.resolve().then(async () => {
            const rawText = frame.text ?? frame.content ?? "";
            const text = await tryDecrypt(rawText, frame.encrypted);

            upsertMessage(
              normalizeMessage(
                { ...frame, text },
                {
                  id: frame.id ?? Date.now(),
                  from: frame.from ?? (frame.sender_id === customerId ? "customer" : "merchant"),
                  time: localTime(),
                  status: "delivered",
                }
              )
            );
          });
          break;
        }

        case "read": {
          const mid = frame.message_id;
          if (mid != null) {
            setMessages((prev) =>
              prev.map((m) => (m.id === mid ? { ...m, status: "read" } : m))
            );
          }
          break;
        }

        case "typing":
          break;

        default:
          break;
      }
    };
  }, [safe, tryDecrypt, upsertMessage, setMessages, setConversation, setStatus]);



  // ─── Reconnect with exponential back-off ────────────────────────────────

  const scheduleReconnect = useCallback(() => {
    if (!isMounted.current) return;
    const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
    backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
    reconnectTimer.current = setTimeout(() => {
      if (isMounted.current) openSocket(roomInfoRef.current);
    }, delay);
  }, [openSocket]);

  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);


  // ─── sendMessage — encrypts when key is loaded ─────────────────────────

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return;

      let payload = content.trim();
      let encrypted = false;

      if (isEncryptionReady()) {
        try {
          payload = await encryptMessage(content.trim());
          encrypted = true;
        } catch (err) {
          // Encryption failed — send plaintext rather than drop the message
          console.error("[useChat] encryptMessage failed, sending plaintext:", err);
        }
      }

      const frame = { type: "message", content: payload, encrypted };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(frame));
      } else {
        // Buffer; flushed on next ws.onopen
        pendingQueue.current.push(frame);
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          openSocket(roomInfoRef.current);
        }
      }
    },
    [openSocket]
  );

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    if (!merchantId) return;

    // Reset state for new merchant
    setConversation(null);
    setMessages([]);
    setStatus("idle");
    setEncryptionStatus("off");
    pendingQueue.current = [];
    backoffRef.current = 1_000;

    // Full init sequence: resolve → key → socket
    (async () => {
      try {
        const roomInfo = await resolveRoom();
        if (!isMounted.current) return;

        // Fetch and init the key BEFORE opening the socket so that
        // even the very first queued message is encrypted.
        await fetchAndInitKey(roomInfo.room_id);
        if (!isMounted.current) return;

        openSocket(roomInfo);
      } catch (err) {
        console.error("[useChat] init failed:", err);
        if (isMounted.current) setStatus("error");
      }
    })();

    return () => {
      isMounted.current = false;
      clearTimeout(reconnectTimer.current);
      clearEncryption();
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null; // prevent reconnect loop on intentional unmount
        ws.close(1000, "component unmounted");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  // ─── Exposed API ────────────────────────────────────────────────────────

  return {
    /** Array of {id, from, text, time, status} */
    messages,

    /** {room_id, merchant: {name, initials, online, responseTime}, pinned_product} */
    conversation,

    /** Connection lifecycle status */
    status,

    /** Send a message. Encrypts automatically when key is loaded. */
    sendMessage,
  };
}


