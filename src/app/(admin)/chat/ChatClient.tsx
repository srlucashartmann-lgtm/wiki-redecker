"use client";

import React, { useState } from "react";
import ChatInterface from "@/components/chat/ChatInterface";

const MOCK_HISTORY = {
  Hoje: [
    { id: "1", title: "Análise de Votos em Montenegro" },
    { id: "2", title: "Resumo de Emendas e PLs" },
  ],
  Ontem: [
    { id: "3", title: "Temas dos discursos 2023" },
    { id: "4", title: "Principais perdas eleitorais" },
  ],
};

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export default function ChatClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setChatKey((k) => k + 1)}
        className="mx-3 mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        <span className="text-lg">+</span>
        Novo Chat
      </button>
      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        {Object.entries(MOCK_HISTORY).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              {group}
            </p>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mb-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-200/80"
              >
                <span className="line-clamp-1">{item.title}...</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block flex-shrink-0">{sidebarContent}</aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Chat */}
      <main className="flex flex-1 min-w-0 flex-col bg-white">
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-slate-800">Chat</span>
        </div>

        <div className="flex flex-1 min-h-0 flex-col">
          <ChatInterface key={chatKey} />
        </div>
      </main>
    </div>
  );
}
