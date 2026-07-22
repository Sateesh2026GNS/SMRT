import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, ChevronDown, History, Loader2, Send, Sparkles, X,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";
import {
  getAiConversation,
  getAiConversations,
  getAiSuggestions,
  sendAiChat,
} from "../../api/aiAssistantApi";
import AiMessageContent from "./AiMessageContent";

const DEFAULT_SUGGESTIONS = [
  "Today's Work Orders",
  "Machine Status",
  "Today's Production",
  "My Attendance",
];

const OPERATION_CARDS = [
  { title: "Work Orders", prompt: "show today's work orders", description: "Live work orders" },
  { title: "Machine Status", prompt: "machine status", description: "Machine health" },
  { title: "Today's Production", prompt: "show today's production", description: "Today's output" },
  { title: "Attendance", prompt: "my attendance", description: "Shift attendance" },
];

export default function AiChatWidget() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      getAiSuggestions()
        .then((res) => {
          if (res.data?.suggestions?.length) setSuggestions(res.data.suggestions);
        })
        .catch(() => {});
    }
  }, [open]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await getAiConversations();
      setConversations(res.data || []);
    } catch {
      setConversations([]);
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await sendAiChat(msg, conversationId);
      const data = res.data;
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, navigation: data.navigation },
      ]);
      if (data.navigation) {
        addToast(`Opening ${data.navigation}`, "info");
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "I couldn't retrieve the requested data. Please try again later.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: typeof detail === "string" ? detail : "Request failed. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, conversationId, addToast]);

  const openConversation = async (id) => {
    try {
      const res = await getAiConversation(id);
      setConversationId(id);
      setMessages(res.data?.messages || []);
      setShowHistory(false);
    } catch {
      addToast("Failed to load conversation", "error");
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleNav = (path) => {
    if (path) {
      navigate(path);
      setOpen(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[min(640px,calc(100vh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">GNS Insights Assistant</p>
                <p className="text-[10px] opacity-80">Production · Inventory · Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
                className="rounded-lg p-1.5 hover:bg-white/20"
                title="History"
              >
                <History className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="max-h-40 overflow-y-auto border-b border-slate-100 bg-slate-50 p-2">
              <button type="button" onClick={startNewChat} className="mb-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                + New Chat
              </button>
              {conversations.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-slate-400">No conversation history</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className="mb-1 w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white"
                >
                  <p className="truncate font-medium text-slate-700">{c.title || "Chat"}</p>
                  <p className="text-[10px] text-slate-400">{c.message_count} messages</p>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center">
                <Bot className="mx-auto mb-2 h-10 w-10 text-blue-200" />
                <p className="text-sm font-medium text-slate-700">Operations Assistant</p>
                <p className="mt-1 text-xs text-slate-400">Tap a card or ask a production or attendance question.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {OPERATION_CARDS.map((card) => (
                    <button
                      key={card.prompt}
                      type="button"
                      onClick={() => sendMessage(card.prompt)}
                      disabled={loading}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-left hover:bg-blue-100 disabled:opacity-50"
                    >
                      <p className="text-xs font-semibold text-blue-700">{card.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{card.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-100 bg-slate-50 text-slate-800"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="text-sm">{m.content}</p>
                  ) : (
                    <>
                      <AiMessageContent content={m.content} />
                      {m.navigation && (
                        <button
                          type="button"
                          onClick={() => handleNav(m.navigation)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Open Page <ChevronDown className="h-3 w-3 -rotate-90" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span>Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions strip */}
          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask about job cards, work orders, machines…"
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield]"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
