import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const [totalNotes, summarized, actionItems] = await Promise.all([
      db.meetingNote.count(),
      db.meetingNote.count({ where: { status: "summarized" } }),
      db.actionItem.count(),
    ])
    const completed = await db.actionItem.count({ where: { status: "completed" } })
    const productivity = totalNotes > 0
      ? Math.round((completed / Math.max(actionItems, 1)) * 100)
      : 0
    return NextResponse.json({
      totalNotes,
      summariesGenerated: summarized,
      actionItemsExtracted: actionItems,
      teamProductivityScore: Math.min(100, productivity),
    })
  } catch (err: any) {
    console.error("[stats]", err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
