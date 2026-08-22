"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Settings,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowDown,
  Moon,
  Sun,
} from "lucide-react";

const useTheme = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

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

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] w-fit items-center border border-[var(--border-light)] shadow-sm">
    <span
      className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
      style={{ animationDelay: "0ms" }}
    />
    <span
      className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
      style={{ animationDelay: "150ms" }}
    />
    <span
      className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
      style={{ animationDelay: "300ms" }}
    />
  </div>
);

const MessageCounter = ({ current, max = 2000 }) => {
  const percentage = (current / max) * 100;
  const isNearLimit = current > max * 0.8;

  return (
    <div className="flex items-center gap-2 text-xs select-none">
      <div className="w-12 h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full transition-colors ${
            current > max
              ? "bg-red-500"
              : isNearLimit
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
        />
      </div>
      <span
        className={`text-[10px] font-medium ${
          current > max ? "text-red-500" : "text-[var(--text-secondary)]"
        }`}
      >
        {current}/{max}
      </span>
    </div>
  );
};

const RateLimitWarning = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto"
    >
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Clock size={18} className="shrink-0" />
          <span className="text-xs font-medium">
            You&apos;re moving a bit fast. Take a breath — we have time.
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-amber-500/20 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-80 bg-[var(--bg-secondary)] z-50 p-6 border-l border-[var(--border-light)] shadow-2xl overflow-y-auto flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--border-light)] rounded-xl transition-colors"
                >
                  <X size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                  <h3 className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase mb-3">
                    Appearance
                  </h3>
                  <button
                    onClick={onThemeToggle}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--border-light)] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-primary)]">
                      {theme === "dark" ? (
                        <Moon size={16} />
                      ) : (
                        <Sun size={16} />
                      )}
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                    <div className="w-9 h-5 bg-[var(--border-light)] rounded-full p-0.5 flex items-center">
                      <motion.div
                        animate={{ x: theme === "dark" ? 16 : 0 }}
                        className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"
                      />
                    </div>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                  <h3 className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase mb-3">
                    Privacy
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
                      <ShieldCheck
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                      <span className="text-xs font-medium">
                        End-to-end encrypted
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                      <span className="text-xs font-medium">
                        No data stored permanently
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Your conversations are anonymous. Messages are processed
                      in real-time and not saved after your session.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)]">
                  <h3 className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase mb-3">
                    Data
                  </h3>
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors text-xs font-semibold border border-red-500/20"
                    >
                      <Trash2 size={16} />
                      <span>Clear Conversation</span>
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[var(--text-secondary)]">
                        Are you sure? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onClear();
                            setShowClearConfirm(false);
                            onClose();
                          }}
                          className="flex-1 p-2 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="flex-1 p-2 rounded-xl bg-[var(--border-light)] text-[var(--text-primary)] text-xs font-medium hover:opacity-80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showRateWarning, setShowRateWarning] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [error, setError] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const textareaRef = useRef(null);
  const endRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!mainRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollButton(isFarFromBottom);
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || input.length > 2000) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMsg = { role: "user", content: input.trim(), timestamp };
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
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Error ${res.status}: ${res.statusText}`,
        );
      }

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (err) {
      setError(err.message || "Unable to connect. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden relative">
      <header className="shrink-0 h-16 flex items-center px-4 sm:px-6 border-b border-[var(--border-light)] bg-[var(--bg-primary)]/80 backdrop-blur-xl z-30">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              Hugabot
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[var(--border-light)] rounded-xl transition-colors"
          >
            <Settings size={20} className="text-[var(--text-secondary)]" />
          </motion.button>
        </div>
      </header>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClear={() => setMessages([])}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <RateLimitWarning
        isVisible={showRateWarning}
        onClose={() => setShowRateWarning(false)}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto"
          >
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-medium truncate">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-28">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 flex flex-col items-center justify-center"
            >
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1.5">
                I&apos;m listening.
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                Whenever you&apos;re ready, tell me what&apos;s on your mind.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-light)]"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <pre className="p-3 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-mono overflow-x-auto my-2">
                            <code>{children}</code>
                          </pre>
                        ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-emerald-500 pl-3 italic my-2 opacity-90">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <div
                    className={`mt-1 text-[10px] text-right font-medium opacity-60 ${
                      msg.role === "user"
                        ? "text-white"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="fixed bottom-28 right-6 z-30 p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-full shadow-lg backdrop-blur-md"
          >
            <ArrowDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent pt-4 pb-4 px-4 sm:px-6 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
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
                  className="w-full bg-transparent border-none focus:ring-0 px-3.5 py-2.5 text-sm resize-none max-h-40 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none"
                  style={{ minHeight: "44px" }}
                />

                {input.length > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <MessageCounter current={input.length} />
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading || input.length > 2000}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-30 transition-all shadow-md shrink-0 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </motion.button>
            </div>

            <div className="flex justify-center mt-1.5 pb-0.5">
              <span className="text-[10px] text-[var(--text-secondary)]/70 flex items-center gap-1 font-medium select-none">
                Hugabot can make mistakes.{" "}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
