import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"

export const runtime = "nodejs"
export const maxDuration = 60

interface ChatBody {
  message: string
  context?: string
}

const SYSTEM_PROMPT = `You are NoteFlow AI, an in-app assistant for a meeting notes summarizer SaaS.
You help users with:
- advice on writing clearer meeting notes
- explaining features (upload, AI summaries, action items, history, exports)
- productivity tips for running meetings
- light editing suggestions

Keep replies concise (max ~120 words), friendly, and actionable. Use short paragraphs or bullet points.
If asked something outside this product's scope, gently steer back to meeting productivity.`

export async function POST(req: NextRequest) {
  try {
    const { message, context } = (await req.json()) as ChatBody
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message required." }, { status: 400 })
    }

    const zai = await ZAI.create()
    const userContent = context
      ? `${message}\n\n[App context: ${context}]`
      : message

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      thinking: { type: "disabled" },
    })

    const reply = completion.choices[0]?.message?.content ?? ""
    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("[ai-assistant] error", err)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
