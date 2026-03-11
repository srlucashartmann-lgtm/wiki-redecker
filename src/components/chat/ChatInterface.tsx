"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AttachedFile {
  id: string;
  file: File;
  type: "pdf" | "xlsx" | "csv" | "png" | "jpg" | "other";
}

export interface ChatInterfaceProps {
  suggestions?: string[];
  emptyTitle?: string;
  emptySubtitle?: string;
  placeholder?: string;
  className?: string;
}

function SparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function PaperclipIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function getFileType(name: string): AttachedFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "csv") return "csv";
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return ext === "png" ? "png" : "jpg";
  return "other";
}

function FileTypeIcon({ type }: { type: AttachedFile["type"] }) {
  const cls = "h-4 w-4 flex-shrink-0";
  if (type === "pdf") return <span className={`${cls} text-xs font-bold text-red-600`}>PDF</span>;
  if (type === "xlsx") return <span className={`${cls} text-xs font-bold text-emerald-600`}>XLS</span>;
  if (type === "csv") return <span className={`${cls} text-xs font-bold text-slate-600`}>CSV</span>;
  if (type === "png" || type === "jpg") return <span className={`${cls} text-xs font-bold text-indigo-600`}>IMG</span>;
  return <span className={`${cls} text-xs text-slate-400`}>FILE</span>;
}

const STORAGE_KEY = "warRoomChatHistory";

const DEFAULT_SUGGESTIONS = [
  "Qual a relação de emendas e votos em Montenegro?",
  "Resuma os projetos de lei sobre o Agro.",
  "Quais os principais temas dos discursos em 2023?",
  "Onde perdemos mais votos na última eleição?",
];

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

export default function ChatInterface({
  suggestions = DEFAULT_SUGGESTIONS,
  emptyTitle = "Olá. O que vamos analisar hoje?",
  emptySubtitle = "Faça perguntas sobre emendas, votos, discursos e proposições do mandato.",
  placeholder = "Digite sua pergunta...",
  className = "",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
          (m): m is Message =>
            m && typeof m === "object" && "role" in m && "content" in m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof (m as Message).content === "string"
        );
      }
    } catch {
      // ignore parse errors
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota exceeded etc
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    const hasFiles = attachedFiles.length > 0;
    if (!text && !hasFiles) return;

    const userContent = text || `[${attachedFiles.length} arquivo(s) anexado(s)]`;
    const messagesToSend: Message[] = [...messages, { role: "user", content: userContent }];
    setMessages([...messagesToSend, { role: "assistant", content: "" }]);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Erro ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Resposta sem corpo");

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const current = acc;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: current };
          return next;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao obter resposta.";
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") next[next.length - 1] = { ...last, content: `**Erro:** ${msg}` };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedFiles, messages]);

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newFiles: AttachedFile[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      type: getFileType(f.name),
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognitionAPI) {
      alert("Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.resultIndex;
      const result = e.results[last];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        setInput((prev) => prev + (prev ? " " : "") + transcript);
      }
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const canSend = (input.trim() || attachedFiles.length > 0) && !isLoading;

  return (
    <div className={`flex flex-1 min-h-0 flex-col bg-white ${className}`}>
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">{emptyTitle}</h2>
          <p className="mt-1 text-center text-sm text-slate-500">{emptySubtitle}</p>
          <div className="mt-6 grid w-full grid-cols-1 gap-2">
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/30 hover:text-slate-900"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex flex-shrink-0 items-center justify-end gap-2 px-4 py-2 border-b border-slate-100">
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Limpar histórico"
            >
              <TrashIcon className="h-4 w-4" />
              Limpar histórico
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    m.content ? (
                      <div
                        className="max-w-none leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
                      />
                    ) : (
                      <span className="inline-flex gap-1 text-slate-500">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                      </span>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 p-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-md">
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-2">
              {attachedFiles.map((af) => (
                <span
                  key={af.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  <FileTypeIcon type={af.type} />
                  <span className="max-w-[100px] truncate">{af.file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(af.id)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <span className="sr-only">Remover</span>
                    <span>×</span>
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="min-h-[36px] max-h-28 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition ${
                isRecording ? "bg-red-100 text-red-600 animate-pulse" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <MicIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}
