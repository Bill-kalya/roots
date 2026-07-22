// Chat.jsx — Roots African Art & Culture
// Customer ↔ Merchant direct messaging screen
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "../hooks/useChat";

import "./chat.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

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
        <div
          className={`message-avatar ${showAvatar ? "" : "message-avatar-hidden"}`}
          aria-hidden="true"
        >
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
        <button className="chat-action-btn" aria-label="View merchant profile" type="button" title="Profile">
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
        <div className="pinned-price">{product.price ? `KSh ${product.price}` : ""}</div>
      </div>
      <button
        className="pinned-btn"
        type="button"
        aria-label="View product"
        onClick={() => {
          if (product?.id) window.location.href = `/product/${product.id}`;
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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
        <button className="input-icon-btn" aria-label="Attach file" type="button">⊕</button>

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

  const merchantId = chatState.merchantId;
  const roomId = chatState.roomId;

  // Determine if roomId is a merchant UUID (needs resolve-room) or a pre-resolved room ID.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let merchantIdResolved;
  let roomIdResolved;

  if (merchantId) {
    merchantIdResolved = merchantId;
  } else if (roomId && UUID_RE.test(roomId)) {
    // roomId is actually a merchant UUID (from MerchantProfile)
    merchantIdResolved = roomId;
  } else if (roomId) {
    // roomId is a pre-resolved room ID (from Checkout)
    roomIdResolved = roomId;
  }

  const { messages, conversation, sendMessage, status } = useChat({
    merchantId: merchantIdResolved,
    roomId: roomIdResolved,
  });

  // NOTE: merchantIdResolved is for socket init. Conversation sidebar/unread UI is not implemented yet.

  const [merchant, setMerchant] = useState(null);
  const [pinnedProduct, setPinnedProduct] = useState(null);
  const [typing] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!conversation) return;

    const conv = conversation;

    const merchantData = conv.merchant || conv.artisan || conv.partner || null;
    if (merchantData) {
      const initials =
        merchantData.initials ||
        (merchantData.name ? merchantData.name.slice(0, 2).toUpperCase() : "RA");

      // Avoid cascades flagged by react-hooks/set-state-in-effect rule:
      // schedule state updates for the next tick.
      queueMicrotask(() => {
        setMerchant({
          name: merchantData.name || "Merchant",
          initials,
          subtitle: merchantData.subtitle || "",
          online: Boolean(merchantData.online ?? true),
          responseTime: merchantData.responseTime || "",
        });
      });
    }

    const pinned = conv.pinned_product || conv.pinnedProduct || conv.product || null;
    if (pinned && (pinned.id || pinned.product_id)) {
      queueMicrotask(() => {
        setPinnedProduct({
          id: pinned.id ?? pinned.product_id,
          name: pinned.name || pinned.title || "Product",
          price: pinned.price ?? null,
        });
      });
    } else {
      queueMicrotask(() => setPinnedProduct(null));
    }
  }, [conversation]);

  const handleSend = useCallback(
    (text) => {
      setShowQuickReplies(false);
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleQuickReply = useCallback(
    (text) => handleSend(text),
    [handleSend]
  );

  return (
    <div className="roots-chat">
      <Nav />

      <main className="chat-shell">
        <aside className="chat-sidebar" aria-label="Conversations">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Messages</h2>
            <button className="sidebar-compose" aria-label="New conversation" type="button">✦</button>
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
            {/* Production: conversation list should be provided by backend. */}
          </div>
        </aside>

        <section className="chat-pane" aria-label="Conversation">
          <ChatHeader onBack={() => window.history.back()} merchant={merchant} />

          {status === "error" && (
            <div className="chat-error-banner" role="alert" style={{ color: "#7A5C3A", padding: "12px 16px" }}>
              Unable to start chat. Check room resolution / websocket connection.
            </div>
          )}

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
            quickReplies={quickReplies}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

