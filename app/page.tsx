"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"
import type { Chat } from "@ai-sdk/react"
import type { UIMessage } from "ai"

const SANDBOX_KEY = "agent_sandbox_id"
const THREAD_KEY = "agent_thread_id"

type InitState =
  | { kind: "loading" }
  | { kind: "ready"; sandboxId: string; threadId: string }
  | { kind: "error"; message: string }

export default function Page() {
  const [state, setState] = useState<InitState>({ kind: "loading" })
  const initRef = useRef(false)

  const init = useCallback(async (forceFresh = false) => {
    try {
      setState({ kind: "loading" })

      if (forceFresh) {
        localStorage.removeItem(SANDBOX_KEY)
        localStorage.removeItem(THREAD_KEY)
      }

      let sandboxId = localStorage.getItem(SANDBOX_KEY)
      if (!sandboxId) {
        const r = await fetch("/api/agent/sandbox", { method: "POST" })
        if (!r.ok) throw new Error(`sandbox ${r.status}`)
        const j = await r.json()
        sandboxId = j.sandboxId as string
        localStorage.setItem(SANDBOX_KEY, sandboxId)
      }

      let threadId = forceFresh ? null : localStorage.getItem(THREAD_KEY)
      if (!threadId) {
        const r = await fetch("/api/agent/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId, name: "Chat" }),
        })
        if (!r.ok) throw new Error(`thread ${r.status}`)
        const j = await r.json()
        threadId = j.id as string
        localStorage.setItem(THREAD_KEY, threadId)
      }

      setState({ kind: "ready", sandboxId, threadId })
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Init failed",
      })
    }
  }, [])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    init(false)
  }, [init])

  const handleNewChat = useCallback(() => init(true), [init])

  return (
    <div className="flex flex-col h-dvh">
      <Header onNewChat={handleNewChat} disabled={state.kind !== "ready"} />
      <main className="flex-1 min-h-0">
        {state.kind === "loading" && <Loading />}
        {state.kind === "error" && (
          <ErrorView message={state.message} onRetry={() => init(false)} />
        )}
        {state.kind === "ready" && (
          <ChatPanel
            key={`${state.sandboxId}:${state.threadId}`}
            sandboxId={state.sandboxId}
            threadId={state.threadId}
          />
        )}
      </main>
    </div>
  )
}

function Header({
  onNewChat,
  disabled,
}: {
  onNewChat: () => void
  disabled: boolean
}) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-[11px] font-semibold tracking-tight">
          ma
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-zinc-100">my-agent</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            21st Agents · v1
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onNewChat}
        disabled={disabled}
        className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        New chat
      </button>
    </header>
  )
}

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
        </span>
        Spinning up sandbox…
      </div>
    </div>
  )
}

function ErrorView({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-sm text-zinc-400">
          Couldn&apos;t reach the agent.
        </p>
        <p className="font-mono text-xs text-rose-300/90 bg-rose-500/5 border border-rose-500/20 rounded-md px-3 py-2">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function ChatPanel({
  sandboxId,
  threadId,
}: {
  sandboxId: string
  threadId: string
}) {
  const chat = useMemo(
    () =>
      createAgentChat({
        agent: "my-agent",
        tokenUrl: "/api/agent/token",
        sandboxId,
        threadId,
      }),
    [sandboxId, threadId],
  )

  const { messages, status, stop, error, sendMessage } = useChat({
    chat: chat as Chat<UIMessage>,
  })

  return (
    <div className="h-full">
      <AgentChat
        messages={messages}
        onSend={(msg) => sendMessage({ text: msg.content })}
        status={status}
        onStop={stop}
        error={error ?? undefined}
        colorMode="dark"
      />
    </div>
  )
}
