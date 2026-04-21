// Chat.jsx — Roots African Art & Culture
// Customer ↔ Merchant direct messaging screen
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./chat.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

// ─── Sample conversation seed ────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "merchant",
    text: "Akwaaba! Welcome to Roots. How can I help you today?",
    time: "09:14",
    status: "read",
  },
  {
    id: 2,
    from: "customer",
    text: "Hello! I'm interested in the Yoruba Gelede Mask. Is it still available?",
    time: "09:16",
    status: "read",
  },
  {
    id: 3,
    from: "merchant",
    text: "Yes, it is! This is a beautiful piece — hand-carved by Master Adewale in Abeokuta. It comes with a full provenance certificate and is wrapped in authentic kente cloth for shipping.",
    time: "09:17",
    status: "read",
  },
  {
    id: 4,
    from: "customer",
    text: "That sounds wonderful. Does it ship to the UK?",
    time: "09:19",
    status: "read",
  },
  {
    id: 5,
    from: "merchant",
    text: "Absolutely — we ship worldwide. UK delivery takes 5–8 business days and is fully insured. Shall I reserve it for you?",
    time: "09:20",
    status: "read",
  },
];

// ─── Default merchant profile ────────────────────────────────────────────────────────
const DEFAULT_MERCHANT = {
  name: "Roots Atelier",
  subtitle: "African Art & Artifacts",
  initials: "RA",
  online: true,
  responseTime: "Replies within minutes",
};

// ─── Quick reply suggestions ─────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Is this item still available?",
  "Do you offer custom sizing?",
  "What's the return policy?",
  "Can I see more photos?",
];

// ─── Timestamp helper ────────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, prevFrom }) {
  const isCustomer = message.from === "customer";
  const showAvatar = !isCustomer && prevFrom !== "merchant";

  return (
    <div
      className={`message-row ${isCustomer ? "message-row-customer" : "message-row-merchant"}`}
      aria-label={`${isCustomer ? "You" : merchant.name}: ${message.text}`}
    >
      {!isCustomer && (
        <div className={`message-avatar ${showAvatar ? "" : "message-avatar-hidden"}`} aria-hidden="true">
          {showAvatar ? merchant.initials : ""}
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
  return (
    <div className="message-row message-row-merchant" aria-label={`${merchant.name} is typing`}>
      <div className="message-avatar">{merchant.initials}</div>
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
  return (
    <div className="chat-header" role="banner">
      <button className="chat-back-btn" onClick={onBack} aria-label="Go back" type="button">
        ←
      </button>

      <div className="chat-header-identity">
        <div className="chat-header-avatar" aria-hidden="true">
          {merchant.initials}
          {MERCHANT.online && <div className="online-ring" />}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{MERCHANT.name}</div>
          <div className="chat-header-sub">
            {MERCHANT.online ? (
              <>
                <span className="online-dot" aria-hidden="true" />
                Online now
              </>
            ) : (
              MERCHANT.responseTime
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
function PinnedProduct() {
  return (
    <div className="pinned-product" role="region" aria-label="Pinned product">
      <div className="pinned-visual" aria-hidden="true">🎭</div>
      <div className="pinned-info">
        <div className="pinned-label">DISCUSSING</div>
        <div className="pinned-name">Yoruba Gelede Mask</div>
        <div className="pinned-price">KSh 24,500</div>
      </div>
      <button className="pinned-btn" type="button" aria-label="View product">
        VIEW →
      </button>
    </div>
  );
}

// ─── Message Input Bar ────────────────────────────────────────────────────────
function InputBar({ onSend, onQuickReply, showQuickReplies }) {
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
      {showQuickReplies && (
        <div className="quick-replies" role="list" aria-label="Quick reply suggestions">
          {QUICK_REPLIES.map((q) => (
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
  const merchant = chatState.artisanName ? {
    name: `${chatState.artisanName} (Artisan)`,
    subtitle: `Piece from ${chatState.pieceOrigin}`,
    initials: chatState.artisanName ? chatState.artisanName.slice(0,2).toUpperCase() : "RA",
    online: true,
    responseTime: "Replies within minutes",
  } : DEFAULT_MERCHANT;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = useCallback((text) => {
    const newMsg = {
      id: Date.now(),
      from: "customer",
      text,
      time: getTime(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setShowQuickReplies(false);

    // Simulate merchant typing + reply
    setTimeout(() => setTyping(true), 800);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "merchant",
          text: getMerchantReply(text),
          time: getTime(),
          status: "delivered",
        },
      ]);
    }, 2800);
  }, []);

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
            />
          </div>

          <div className="sidebar-convos" role="list">
            {/* Active conversation */}
            <div className="convo-item convo-item-active" role="listitem">
              <div className="convo-avatar" aria-hidden="true">RA</div>
              <div className="convo-body">
                <div className="convo-top">
                  <span className="convo-name">Roots Atelier</span>
                  <span className="convo-time">09:20</span>
                </div>
                <div className="convo-preview">Absolutely — we ship worldwide…</div>
              </div>
              <div className="convo-online" aria-label="Online" />
            </div>

            {/* Past conversation placeholders */}
            {[
              { name: "Kente Studio",    preview: "Your order has been dispatched", time: "Yesterday", init: "KS" },
              { name: "Adire House",     preview: "Thank you for your purchase!",   time: "Mon",       init: "AH" },
              { name: "Bronze & Clay",   preview: "We'll have more stock by…",      time: "Sun",       init: "BC" },
            ].map((c) => (
              <div key={c.name} className="convo-item" role="listitem">
                <div className="convo-avatar convo-avatar-muted" aria-hidden="true">{c.init}</div>
                <div className="convo-body">
                  <div className="convo-top">
                    <span className="convo-name">{c.name}</span>
                    <span className="convo-time">{c.time}</span>
                  </div>
                  <div className="convo-preview">{c.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main chat pane ── */}
<section className="chat-pane" aria-label={`Conversation with ${merchant.name}`}>
          <ChatHeader onBack={() => window.history.back()} merchant={merchant} />

          <PinnedProduct />

          <div className="messages-area" role="log" aria-live="polite" aria-label="Messages">
            <DateDivider label="Today" />

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                prevFrom={i > 0 ? messages[i - 1].from : null}
                merchant={merchant}
              />
            ))}

            {typing && <TypingIndicator merchant={merchant} />}
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

// ─── Simulated merchant replies ───────────────────────────────────────────────
function getMerchantReply(customerText) {
  const t = customerText.toLowerCase();
  if (t.includes("available") || t.includes("stock"))
    return "Yes, this piece is available and ready to ship! It's one of our most sought-after works.";
  if (t.includes("price") || t.includes("cost") || t.includes("discount"))
    return "The price is KSh 24,500. For returning customers we occasionally offer exclusive member discounts — shall I check for you?";
  if (t.includes("ship") || t.includes("deliver") || t.includes("uk") || t.includes("us"))
    return "We ship worldwide with full insurance. Delivery is typically 5–8 business days. All pieces are wrapped in traditional cloth for protection.";
  if (t.includes("photo") || t.includes("image") || t.includes("picture"))
    return "Of course! I'll send additional photos shortly. We can also arrange a short video call if you'd like to see the piece up close.";
  if (t.includes("return") || t.includes("refund"))
    return "We offer a 14-day return policy. If you're not fully satisfied with your piece, we'll arrange collection at no cost to you.";
  if (t.includes("custom") || t.includes("size"))
    return "Some of our artisans do accept custom commissions. Could you share more about what you have in mind?";
  if (t.includes("provenance") || t.includes("authentic") || t.includes("certificate"))
    return "Every Roots piece comes with a signed provenance document including the artisan's name, origin community, and cultural context. Authenticity is at the heart of what we do.";
  return "Thank you for reaching out! I'd be happy to help. Could you share a little more so I can assist you best?";
}