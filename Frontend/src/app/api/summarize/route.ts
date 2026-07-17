import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const maxDuration = 60

interface SummarizeBody {
  noteId?: string
  title?: string
  content: string
  persist?: boolean
}

function buildSummaryPrompt(title: string, content: string) {
  return `You are an expert meeting analyst. Analyze the following meeting notes and produce a structured summary.

Meeting title: ${title || "Untitled meeting"}

Meeting notes:
"""
${content}
"""

Return ONLY valid JSON (no markdown fences, no extra commentary) with exactly this shape:
{
  "content": "A cohesive 2-4 sentence executive summary.",
  "keyPoints": ["3-6 bullet key points, each concise"],
  "decisions": ["2-4 explicit decisions made, or empty array if none"],
  "participants": ["list of distinct participant names mentioned, or empty array"],
  "sentiment": "positive | neutral | negative",
  "actionItems": [
    { "title": "task description", "assignee": "name or null", "dueDate": "textual due date or null", "priority": "low | medium | high" }
  ]
}

Rules:
- Keep key points under 12 words each.
- If no participants are clearly named, return an empty array.
- Extract 0-6 action items only when a clear commitment or next step exists.
- Sentiment must be one of: positive, neutral, negative.`
}

function safeParseJson(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummarizeBody
    if (!body?.content || body.content.trim().length < 20) {
      return NextResponse.json(
        { error: "Content too short to summarize." },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a meticulous meeting analyst. You always reply with valid JSON only.",
        },
        {
          role: "user",
          content: buildSummaryPrompt(body.title || "Untitled meeting", body.content),
        },
      ],
      thinking: { type: "disabled" },
    })

    const raw = completion.choices[0]?.message?.content ?? ""
    const parsed = safeParseJson(raw)

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse AI response.", raw },
        { status: 502 }
      )
    }

    const summaryContent: string = parsed.content ?? ""
    const keyPoints: string[] = Array.isArray(parsed.keyPoints) ? parsed.keyPoints : []
    const decisions: string[] = Array.isArray(parsed.decisions) ? parsed.decisions : []
    const participants: string[] = Array.isArray(parsed.participants) ? parsed.participants : []
    const sentiment: "positive" | "neutral" | "negative" =
      parsed.sentiment === "positive" || parsed.sentiment === "negative"
        ? parsed.sentiment
        : "neutral"
    const actionItemsRaw = Array.isArray(parsed.actionItems) ? parsed.actionItems : []

    const actionItems = actionItemsRaw
      .filter((a: any) => a && typeof a.title === "string" && a.title.trim().length > 0)
      .slice(0, 8)
      .map((a: any, idx: number) => ({
        title: String(a.title).slice(0, 200),
        assignee: a.assignee ? String(a.assignee) : null,
        dueDate: a.dueDate ? String(a.dueDate) : null,
        priority:
          a.priority === "high" || a.priority === "low" ? a.priority : "medium",
        _tempId: `tmp-${Date.now()}-${idx}`,
      }))

    const wordCount = summaryContent.split(/\s+/).filter(Boolean).length

    let noteId = body.noteId
    if (body.persist) {
      if (!noteId) {
        const note = await db.meetingNote.create({
          data: {
            title: body.title || "Untitled meeting",
            content: body.content,
            source: "manual",
            status: "summarized",
          },
        })
        noteId = note.id
      } else {
        await db.meetingNote.update({
          where: { id: noteId },
          data: { status: "summarized" },
        })
      }

      await db.summary.upsert({
        where: { noteId },
        create: {
          noteId,
          content: summaryContent,
          keyPoints: JSON.stringify(keyPoints),
          decisions: JSON.stringify(decisions),
          participants: JSON.stringify(participants),
          sentiment,
          wordCount,
        },
        update: {
          content: summaryContent,
          keyPoints: JSON.stringify(keyPoints),
          decisions: JSON.stringify(decisions),
          participants: JSON.stringify(participants),
          sentiment,
          wordCount,
        },
      })

      for (const a of actionItems) {
        await db.actionItem.create({
          data: {
            noteId,
            title: a.title,
            assignee: a.assignee,
            dueDate: a.dueDate,
            priority: a.priority,
            status: "pending",
          },
        })
      }
    }

    return NextResponse.json({
      noteId,
      summary: {
        content: summaryContent,
        keyPoints,
        decisions,
        participants,
        sentiment,
        wordCount,
      },
      actionItems: actionItems.map(({ _tempId, ...rest }) => ({ id: _tempId, ...rest })),
    })
  } catch (err: any) {
    console.error("[summarize] error", err)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
