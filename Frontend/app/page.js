"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Settings,
  X,
  ShieldCheck,
  Heart,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* ---------------- Custom Hooks ---------------- */

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.style.setProperty("--bg-primary", "#F4F6F5");
      root.style.setProperty("--bg-secondary", "#FFFFFF");
      root.style.setProperty("--text-primary", "#1A1E1C");
      root.style.setProperty("--text-secondary", "#4A524E");
      root.style.setProperty("--border-light", "#E2E5E3");
    } else {
      root.classList.add("dark");
      root.style.setProperty("--bg-primary", "#0F1110");
      root.style.setProperty("--bg-secondary", "#161817");
      root.style.setProperty("--text-primary", "#E6E8E7");
      root.style.setProperty("--text-secondary", "#9CA39F");
      root.style.setProperty("--border-light", "#2A2F2C");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggleTheme };
};

/* ---------------- Typing Indicator ---------------- */

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-6 py-4 rounded-[2rem] bg-[var(--bg-secondary)] w-fit items-center border border-[var(--border-light)]">
    <div
      className="typing-dot bg-emerald-500"
      style={{ animationDelay: "0s" }}
    />
    <div
      className="typing-dot bg-emerald-500"
      style={{ animationDelay: "0.2s" }}
    />
    <div
      className="typing-dot bg-emerald-500"
      style={{ animationDelay: "0.4s" }}
    />
  </div>
);

/* ---------------- Message Character Counter ---------------- */

const MessageCounter = ({ current, max = 2000 }) => {
  const percentage = (current / max) * 100;
  const isNearLimit = current > max * 0.8;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-16 h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full ${
            current > max
              ? "bg-red-500"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
        />
      </div>
      <span
        className={`${
          current > max ? "text-red-500" : "text-[var(--text-secondary)]"
        }`}
      >
        {current}/{max}
      </span>
    </div>
  );
};

/* ---------------- Rate Limit Warning ---------------- */

const RateLimitWarning = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
    >
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
        <Clock size={18} />
        <span className="text-sm">
          You're moving a bit fast. Take a breath — we have time.
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-amber-500/20 rounded-full"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* ---------------- Settings Drawer ---------------- */

const SettingsDrawer = ({ isOpen, onClose, onClear, theme, onThemeToggle }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-[var(--bg-secondary)] z-50 p-6 border-l border-[var(--border-light)] shadow-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--border-light)] rounded-full transition-colors"
              >
                <X size={20} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  APPEARANCE
                </h3>
                <button
                  onClick={onThemeToggle}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--border-light)] transition-colors"
                >
                  <span className="flex items-center gap-3 text-[var(--text-primary)]">
                    <span className="text-sm font-medium">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </span>
                  <div className="w-10 h-6 bg-[var(--border-light)] rounded-full p-1">
                    <motion.div
                      animate={{ x: theme === "dark" ? 0 : 16 }}
                      className="w-4 h-4 bg-emerald-500 rounded-full"
                    />
                  </div>
                </button>
              </div>

              {/* Privacy Info */}
              <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  PRIVACY
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[var(--text-primary)]">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-sm">End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--text-primary)]">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-sm">No data stored permanently</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    Your conversations are anonymous. Messages are processed in
                    real-time and not saved after your session.
                  </p>
                </div>
              </div>

              {/* Clear Conversation */}
              <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  DATA
                </h3>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Clear Conversation</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onClear();
                          setShowClearConfirm(false);
                          onClose();
                        }}
                        className="flex-1 p-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Yes, clear
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 p-2 rounded-xl bg-[var(--border-light)] text-[var(--text-primary)] text-sm font-medium hover:opacity-80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* About */}
              <div className="text-center pt-4">
                <p className="text-xs text-[var(--text-secondary)]">
                  Hugabot v1.0 • A safe space for your thoughts
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ---------------- Main Chat Application ---------------- */

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showRateWarning, setShowRateWarning] = useState(false);
  const [error, setError] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const textareaRef = useRef(null);
  const endRef = useRef(null);
  const mainRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  // Auto-scroll to bottom with offset for fixed footer
  useEffect(() => {
    if (endRef.current) {
      setTimeout(() => {
        endRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [messages, isLoading]);

  // Scroll to bottom function for manual button
  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || input.length > 2000) return;

    const userMsg = { role: "user", content: input.trim() };
    const historyForAPI = [...messages, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/msg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForAPI.slice(-10) }),
      });

      if (res.status === 429) {
        setShowRateWarning(true);
        setTimeout(() => setShowRateWarning(false), 5000);
        throw new Error("rate_limit");
      }

      const data = await res.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      }
    } catch (err) {
      if (err.message !== "rate_limit") {
        setError("Unable to connect. Please try again.");
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] relative">
      {/* Header - full width with centered content */}
      <header className="sticky top-0 z-30 h-20 flex items-center px-4 sm:px-6 justify-between border-b border-[var(--border-light)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">
              Hugabot
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 hover:bg-[var(--border-light)] rounded-2xl transition-colors"
          >
            <Settings size={22} className="text-[var(--text-secondary)]" />
          </motion.button>
        </div>
      </header>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClear={() => setMessages([])}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Rate Limit Warning */}
      <RateLimitWarning
        isVisible={showRateWarning}
        onClose={() => setShowRateWarning(false)}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-36">
        <div className="max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                  className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <MessageCircle className="text-emerald-500" size={36} />
                </motion.div>
                <h3 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
                  I'm listening.
                </h3>
                <p className="text-[var(--text-secondary)] max-w-[280px] mx-auto leading-relaxed">
                  Whenever you're ready, tell me what's on your mind.
                </p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[85%] sm:max-w-[70%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words
                      ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-light)]"
                      }
                    `}
                  >
                    {msg.content}
                    <div className="mt-1 text-[10px] opacity-50 text-right">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
            <div className="h-12" />
            <div ref={endRef} />
          </div>
        </div>
      </main>

      {/* Input Footer - fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-6 z-20">
        <div className="max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 pb-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-2xl p-2 shadow-2xl"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Share your thoughts..."
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3.5 text-[15px] resize-none max-h-40 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none"
                  style={{ minHeight: "52px" }}
                />

                {input.length > 0 && (
                  <div className="absolute bottom-2 right-3">
                    <MessageCounter current={input.length} />
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading || input.length > 2000}
                className="mb-1 p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-20 disabled:scale-100 transition-all shadow-lg disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="flex justify-center mt-2"
            >
              <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                <ShieldCheck size={10} />
                Always anonymous • Your space, your pace
              </span>
            </motion.div>
          </motion.div>
        </div>
      </footer>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {messages.length > 3 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
