/**
 * useChat
 * Customer ↔ Merchant WebSocket chat hook.
 *
 * Responsibilities:
 *  - Resolve deterministic room_id from backend (merchantId -> {room_id,...})
 *  - Open WebSocket using the resolved room_id + auth token
 *  - Load history and stream new messages
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { safeDecryptMessage, isEncryptionReady } from "../utils/encryption.js";

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

import { tokenStore } from "../lib/tokenStore.js";

function getToken() {
  // tokenStore respects remember-me (localStorage vs sessionStorage)
  return tokenStore.getAccess();
}

function normalizeMessage(m, fallback) {
  return {
    id: m.id ?? fallback.id,
    from: m.from ?? fallback.from,
    text: m.text ?? m.body ?? fallback.text,
    time: m.time ?? fallback.time,
    status: m.status ?? fallback.status,
  };
}

export function useChat({ merchantId }) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [status, setStatus] = useState("idle");

  const wsRef = useRef(null);
  const roomRef = useRef(null);
  const reconnectDelay = useRef(1000);
  const reconnectTimerRef = useRef(null);

  const resolveRoom = useCallback(async () => {
    if (!merchantId) throw new Error("merchantId missing");

    const res = await fetch(`${API_BASE}/conversations/resolve-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ merchant_id: merchantId }),
    });

    if (!res.ok) {
      throw new Error("Could not resolve room");
    }

    return res.json();
    // { room_id, customer_id, merchant_id }
  }, [merchantId]);

  const openSocket = useCallback(
    (roomInfo) => {
      roomRef.current = roomInfo;
      setStatus("connecting");

      const token = getToken();
      const roomId = roomInfo?.room_id;
      if (!roomId) {
        setStatus("error");
        return;
      }

      const url = `${WS_BASE}/ws/chat/${roomId}${token ? `?token=${token}` : ""}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = 1000;
        setStatus("connecting");

        // Handshake to trigger backend: conversation + history
        ws.send(
          JSON.stringify({
            type: "handshake",
            merchant_id: roomInfo.merchant_id,
          })
        );
      };

      ws.onmessage = ({ data }) => {
        let frame;
        try {
          frame = JSON.parse(data);
        } catch {
          return;
        }

        if (!frame?.type) return;

        if (frame.type === "conversation") {
          setConversation(frame.conversation || frame);
          setStatus("open");
          return;
        }

        if (frame.type === "history") {
          const items = frame.messages ?? frame.history ?? [];

          // Decrypt in-place before normalizing.
          const maybeDecrypt = async () => {
            const normalized = await Promise.all(
              (Array.isArray(items) ? items : []).map(async (m) => {
                const decryptedText =
                  m?.encrypted && isEncryptionReady()
                    ? await safeDecryptMessage(m.content ?? m.text)
                    : (m.text ?? m.body ?? "");

                return normalizeMessage(m, {
                  from: m.from ?? (m.sender === "customer" ? "customer" : "merchant"),
                  text: decryptedText,
                  time: m.time,
                  status: m.status ?? "delivered",
                });
              })
            );

            setMessages(normalized);
            setStatus("open");
          };

          maybeDecrypt();
          return;
        }

        if (frame.type === "message") {
          const fallback = {
            id: Date.now(),
            from: frame.from ?? "merchant",
            text: frame.text ?? "",
            time: getTime(),
            status: frame.status ?? "delivered",
          };

          const applyMessage = async () => {
            const decryptedText =
              frame?.encrypted && isEncryptionReady()
                ? await safeDecryptMessage(frame.content ?? frame.text)
                : frame.text ?? "";

            const normalizedFrame = normalizeMessage(
              { ...frame, text: decryptedText },
              fallback
            );

            setMessages((prev) => {
              const incomingId = frame.id ?? null;
              if (incomingId != null) {
                const idx = prev.findIndex((m) => m.id === incomingId);
                if (idx !== -1) {
                  const next = [...prev];
                  next[idx] = {
                    ...next[idx],
                    ...normalizedFrame,
                  };
                  return next;
                }
              }

              return [...prev, normalizedFrame];
            });
          };

          applyMessage();
          return;
        }


        if (frame.type === "read") {
          setMessages((prev) =>
            prev.map((m) => (m.from === "customer" ? { ...m, status: "read" } : m))
          );
          return;
        }

        if (frame.type === "typing") {
          // UI typing is currently handled in Chat.jsx via its own local state; ignore here.
          return;
        }
      };

      ws.onclose = (evt) => {
        if (evt.code === 4001 || evt.code === 4003) {
          setStatus("error");
          return;
        }

        setStatus("reconnecting");
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(
          () => openSocket(roomRef.current),
          reconnectDelay.current
        );
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      };

      ws.onerror = () => {
        setStatus("error");
        try {
          ws.close();
        } catch {
          // ignore
        }
      };
    },
    [setMessages]
  );

  useEffect(() => {
    if (!merchantId) return;

    let cancelled = false;

    setConversation(null);
    setMessages([]);
    setStatus("idle");

    resolveRoom()
      .then((roomInfo) => {
        if (cancelled) return;
        openSocket(roomInfo);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      try {
        wsRef.current?.close(1000, "component unmount");
      } catch {
        // ignore
      }
    };
  }, [merchantId, openSocket, resolveRoom]);

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );
      return true;
    }
    return false;
  }, []);

  return { messages, conversation, status, sendMessage };
}

function getTime() {
  return new Date().toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

