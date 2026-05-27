// Chat.jsx — Roots African Art & Culture
// Customer ↔ Merchant direct messaging screen
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./chat.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

// ─── Timestamp helper ────────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}


// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, prevFrom, merchant }) {
  const isCustomer = message.from === "customer";
  const safeMerchant = merchant || { name: "Merchant", initials: "RA" };
  const showAvatar = !isCustomer && prevFrom !== "merchant";


  return (
    <div
      className={`message-row ${isCustomer ? "message-row-customer" : "message-row-merchant"}`}
      aria-label={`${isCustomer ? "You" : safeMerchant.name}: ${message.text}`}
    >

      {!isCustomer && (
        <div className={`message-avatar ${showAvatar ? "" : "message-avatar-hidden"}`} aria-hidden="true">
          {showAvatar ? safeMerchant.initials : ""}
        </div>
      )}

      <div className={`bubble-wrapper ${isCustomer ? "bubble-wrapper-customer" : ""}`}>
        <div className={`bubble ${isCustomer ? "bubble-customer" : "bubble-merchant"}`}>
          <p className="bubble-text">{message.text}</p>
        </div>
        <div className={`bubble-meta ${isCustomer ? "bubble-meta-right" : ""}`}>
          <span className="bubble-time">{message.time}</span>
          {isCustomer && (
            <span className="bubble-status" aria-label={message.status}>
              {message.status === "read" ? "✦✦" : message.status === "delivered" ? "✦✦" : "✦"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ merchant }) {
  const safeMerchant = merchant || { name: "Merchant", initials: "RA" };
  return (
    <div className="message-row message-row-merchant" aria-label={`${safeMerchant.name} is typing`}>
      <div className="message-avatar">{safeMerchant.initials}</div>

      <div className="bubble bubble-merchant bubble-typing">
        <span className="typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot" style={{ animationDelay: "160ms" }} />
        <span className="typing-dot" style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  );
}

// ─── Chat Header ─────────────────────────────────────────────────────────────
function ChatHeader({ onBack, merchant }) {
  // Guard: don't render until merchant data arrives from WebSocket
  if (!merchant) return null;

  return (
    <div className="chat-header" role="banner">
      <button className="chat-back-btn" onClick={onBack} aria-label="Go back" type="button">
        ←
      </button>

      <div className="chat-header-identity">
        <div className="chat-header-avatar" aria-hidden="true">
          {merchant.initials}
          {merchant.online && <div className="online-ring" />}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{merchant.name}</div>
          <div className="chat-header-sub">
            {merchant.online ? (
              <>
                <span className="online-dot" aria-hidden="true" />
                Online now
              </>
            ) : (
              merchant.responseTime
            )}
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          className="chat-action-btn"
          aria-label="View merchant profile"
          type="button"
          title="Profile"
        >
          ◎
        </button>
        <button className="chat-action-btn" aria-label="More options" type="button" title="More">
          ⋯
        </button>
      </div>
    </div>
  );
}

// ─── Pinned Product Card ──────────────────────────────────────────────────────
function PinnedProduct({ product }) {
  if (!product) return null;

  return (
    <div className="pinned-product" role="region" aria-label="Pinned product">
      <div className="pinned-visual" aria-hidden="true">🎭</div>
      <div className="pinned-info">
        <div className="pinned-label">DISCUSSING</div>
        <div className="pinned-name">{product.name || "Product"}</div>
        <div className="pinned-price">
          {product.price ? `KSh ${product.price}` : ""}
        </div>
      </div>
      <button
        className="pinned-btn"
        type="button"
        aria-label="View product"
        onClick={() => {
          if (product?.id) {
            window.location.href = `/product/${product.id}`;
          }
        }}
        disabled={!product?.id}
      >
        VIEW →
      </button>
    </div>
  );
}


// ─── Message Input Bar ────────────────────────────────────────────────────────
function InputBar({ onSend, onQuickReply, showQuickReplies, quickReplies }) {
  const safeQuickReplies = Array.isArray(quickReplies) ? quickReplies : [];

  const [text, setText] = useState("");

  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="input-area">
      {showQuickReplies && safeQuickReplies.length > 0 && (
        <div className="quick-replies" role="list" aria-label="Quick reply suggestions">
          {safeQuickReplies.map((q) => (

            <button
              key={q}
              className="quick-reply-chip"
              onClick={() => onQuickReply(q)}
              type="button"
              role="listitem"
            >
              {q}
            </button>
          ))}
        </div>
      )}


      <div className="input-bar">
        <button className="input-icon-btn" aria-label="Attach file" type="button">
          ⊕
        </button>

        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Message Roots Atelier…"
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          aria-label="Type a message"
        />

        <button
          className={`send-btn ${text.trim() ? "send-btn-active" : ""}`}
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Send message"
          type="button"
        >
          ↑
        </button>
      </div>

      <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}

// ─── Date Divider ─────────────────────────────────────────────────────────────
function DateDivider({ label }) {
  return (
    <div className="date-divider" aria-label={label} role="separator">
      <div className="date-divider-line" />
      <span>{label}</span>
      <div className="date-divider-line" />
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Chat() {
  const location = useLocation();
  const chatState = location.state || {};

  const [merchant, setMerchant] = useState(null);
  const [pinnedProduct, setPinnedProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  // Quick replies are expected to be provided by backend.
  // Keep as state-ready; UI currently hides quick replies unless backend provides them.
  // quickReplies intentionally unused for now
  const [quickReplies] = useState([]);

  // Keep quickReplies unused for now (no backend quick-reply frame wired yet).
  void quickReplies;









  const bottomRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
  const roomId = chatState.roomId ?? null;


  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const MAX_RECONNECTS = 5;

  const wsStatusRef = useRef("disconnected");
  // Production UI may show connection status later; keep state minimal for now.
  // const [wsStatus, setWsStatus] = useState("disconnected");


  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  const connectRef = useRef(null);

  const connect = useCallback(() => {
    if (!roomId) {






      // Missing room context; UI will stay in an empty state.
      return;
    }

    const token = localStorage.getItem("access_token");


    const url = `${WS_BASE}/ws/chat/${roomId}${token ? `?token=${token}` : ""}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;


      ws.onopen = () => {
        reconnectCountRef.current = 0;
        wsStatusRef.current = "connected";


        // Handshake: request conversation context + message history.
        // Backend is expected to respond with frames: `conversation` and `history`.
        const handshake = {
          type: "handshake",
          room_id: roomId,
        };
        try {
          ws.send(JSON.stringify(handshake));
        } catch {
          // ignore
        }
      };


      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.type === "typing") {
            setTyping(true);
            return;
          }

          if (data.type === "conversation") {
            setTyping(false);
            const conv = data.conversation || data;
            const merchantData = conv.merchant || conv.artisan || conv.partner || null;
            if (merchantData) {
              const initials =
                merchantData.initials ||
                (merchantData.name ? merchantData.name.slice(0, 2).toUpperCase() : "RA");
              setMerchant({
                name: merchantData.name || "Merchant",
                initials,
                subtitle: merchantData.subtitle || "",
                online: Boolean(merchantData.online ?? true),
                responseTime: merchantData.responseTime || "",
              });
            }

            const pinned = conv.pinned_product || conv.pinnedProduct || conv.product || null;
            if (pinned && (pinned.id || pinned.product_id)) {
              setPinnedProduct({
                id: pinned.id ?? pinned.product_id,
                name: pinned.name || pinned.title || "Product",
                price: pinned.price ?? null,
              });
            } else {
              setPinnedProduct(null);
            }
            return;
          }

          if (data.type === "history") {
            setTyping(false);
            const items = data.messages || data.history || [];
            const normalized = (Array.isArray(items) ? items : []).map((m) => ({
              id: m.id ?? Date.now(),
              from: m.from ?? (m.sender === "customer" ? "customer" : "merchant"),
              text: m.text ?? m.body ?? "",
              time: m.time ?? getTime(),
              status: m.status ?? "delivered",
            }));
            setMessages(normalized);
            return;
          }

          if (data.type === "message") {
            setTyping(false);

            // Backend echoes a delivery receipt back to the sender.
            // If the message id already exists locally, update its status.
            const incomingId = data.id ?? null;
            setMessages((prev) => {
              if (incomingId != null) {
                const idx = prev.findIndex((m) => m.id === incomingId);
                if (idx !== -1) {
                  const next = [...prev];
                  next[idx] = {
                    ...next[idx],
                    status: data.status ?? next[idx].status,
                    time: data.time ?? next[idx].time,
                    text: data.text ?? next[idx].text,
                    from: data.from ?? next[idx].from,
                  };
                  return next;
                }
              }

              return [
                ...prev,
                {
                  id: data.id ?? Date.now(),
                  from: data.from ?? "merchant",
                  text: data.text ?? "",
                  time: data.time ?? getTime(),
                  status: data.status ?? "delivered",
                },
              ];
            });

            return;
          }


          if (data.type === "read") {
            setTyping(false);
            setMessages((prev) =>
              prev.map((m) => (m.from === "customer" ? { ...m, status: "read" } : m))
            );
          }

        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (event) => {
        wsStatusRef.current = "disconnected";

        if (event.code !== 1000 && reconnectCountRef.current < MAX_RECONNECTS) {

          const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30000);
          reconnectCountRef.current += 1;
          // Avoid capturing stale/undeclared `connect` in callbacks.
          reconnectTimerRef.current = setTimeout(() => {
            if (wsRef.current) {
              // no-op; just ensure we schedule reconnection.
            }
            connectRef.current();
          }, delay);
        }
      };


      ws.onerror = () => {
        wsStatusRef.current = "error";
        try {
          ws.close();
        } catch {
          // ignore
        }
      };
    } catch {
      // Failed to create websocket
    }



  }, [roomId, WS_BASE]);

  useEffect(() => {

    // connect is stable across renders (useCallback)
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      try {
        wsRef.current?.close(1000, "component unmount");
      } catch {
        // ignore
      }
    };
  }, [connect]);


  const sendWs = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);


  const handleSend = useCallback(
    (text) => {
      if (!roomId) return;

      const id = Date.now();
      const msg = {
        id,
        from: "customer",
        text,
        time: getTime(),
        status: "sent",
      };

      setMessages((prev) => [...prev, msg]);
      setShowQuickReplies(false);

      sendWs({
        type: "message",
        room_id: roomId,
        text,
        time: msg.time,
        id,
        from: "customer",
      });
    },
    [roomId, sendWs]
  );




  const handleQuickReply = useCallback(
    (text) => handleSend(text),
    [handleSend]
  );

  return (
    <div className="roots-chat">
      <Nav />

      <main className="chat-shell">
        {/* ── Sidebar: conversation list ── */}
        <aside className="chat-sidebar" aria-label="Conversations">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Messages</h2>
            <button className="sidebar-compose" aria-label="New conversation" type="button">
              ✦
            </button>
          </div>

          <div className="sidebar-search">
            <input
              type="search"
              placeholder="Search messages…"
              className="sidebar-search-input"
              aria-label="Search conversations"
              disabled
            />
          </div>

          <div className="sidebar-convos" role="list">
            {/* Production: conversation list should be provided by backend.
                Until supported, keep it empty to avoid static placeholders. */}
          </div>
        </aside>

        {/* ── Main chat pane ── */}
<section className="chat-pane" aria-label={`Conversation`}>
          <ChatHeader onBack={() => window.history.back()} merchant={merchant} />


          <PinnedProduct product={pinnedProduct} />

          <div className="messages-area" role="log" aria-live="polite" aria-label="Messages">
            <DateDivider label="Today" />

            {messages.length === 0 ? (
              <div style={{ color: "#7A5C3A", padding: "10px 0" }}>No messages yet.</div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  prevFrom={i > 0 ? messages[i - 1].from : null}
                  merchant={merchant}
                />
              ))
            )}

            {typing && merchant && <TypingIndicator merchant={merchant} />}
            <div ref={bottomRef} />
          </div>


          <InputBar
            onSend={handleSend}
            onQuickReply={handleQuickReply}
            showQuickReplies={showQuickReplies}
          />
        </section>
      </main>
    </div>
  );
}


