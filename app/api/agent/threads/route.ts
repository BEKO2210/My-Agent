import { AgentClient } from "@21st-sdk/node"
import { NextRequest, NextResponse } from "next/server"

const client = new AgentClient({ apiKey: process.env.API_KEY_21ST! })

export async function POST(req: NextRequest) {
  const { sandboxId, name } = await req.json()
  if (!sandboxId) {
    return NextResponse.json({ error: "sandboxId required" }, { status: 400 })
  }
  try {
    const thread = await client.threads.create({ sandboxId, name })
    return NextResponse.json(thread)
  } catch (err) {
    console.error("[threads] create failed:", err)
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 },
    )
  }
}
