"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"
import theme from "./theme.json"

const chat = createAgentChat({
  agent: "my-agent",
  tokenUrl: "/api/an-token",
})

export default function Page() {
  const { messages, status, stop, error, sendMessage } = useChat({ chat })

  return (
    <main className="flex flex-col flex-1 mx-auto w-full max-w-4xl px-6 py-10 sm:py-16">
      <header className="mb-10 sm:mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_12px_#3b82f6]"
          />
          <span className="text-xs uppercase tracking-[0.25em] text-[#94a3b8]">
            Live · v1
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
          my-agent
        </h1>
        <p className="mt-5 max-w-xl text-base sm:text-lg text-[#94a3b8] leading-relaxed">
          A coding assistant deployed on 21st Agents. Ask anything, or try the
          built-in <code className="px-1.5 py-0.5 rounded bg-white/5 text-[#f1f5f9]">add</code> tool.
        </p>
      </header>

      <section
        aria-label="Chat with my-agent"
        className="flex-1 flex flex-col min-h-[560px] rounded-2xl border border-white/10 bg-[#1e293b]/40 backdrop-blur overflow-hidden focus-within:border-[#3b82f6]/40 transition-colors duration-200"
      >
        <AgentChat
          messages={messages}
          onSend={(msg) => sendMessage({ text: msg.content })}
          status={status}
          onStop={stop}
          error={error ?? undefined}
          theme={theme}
        />
      </section>

      <footer className="mt-8 flex items-center justify-between text-xs text-[#64748b]">
        <a
          href="https://21st.dev/agents"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:text-[#f1f5f9] focus-visible:text-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] rounded-sm transition-colors duration-200"
        >
          Powered by 21st Agents →
        </a>
        <span className="font-mono">claude-sonnet-4-6</span>
      </footer>
    </main>
  )
}
