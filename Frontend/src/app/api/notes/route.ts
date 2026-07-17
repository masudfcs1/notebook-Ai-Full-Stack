import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const notes = await db.meetingNote.findMany({
      orderBy: { createdAt: "desc" },
      include: { summary: true },
    })
    return NextResponse.json({ notes })
  } catch (err: any) {
    console.error("[notes GET]", err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, source, fileName, fileSize } = body || {}
    if (!content || content.trim().length < 1) {
      return NextResponse.json({ error: "content required" }, { status: 400 })
    }
    const note = await db.meetingNote.create({
      data: {
        title: title?.trim() || "Untitled meeting",
        content,
        source: source || "manual",
        fileName: fileName || null,
        fileSize: fileSize ?? null,
        status: "draft",
      },
    })
    return NextResponse.json({ note })
  } catch (err: any) {
    console.error("[notes POST]", err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body || {}
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const note = await db.meetingNote.update({ where: { id }, data: rest })
    return NextResponse.json({ note })
  } catch (err: any) {
    console.error("[notes PATCH]", err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await db.meetingNote.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[notes DELETE]", err)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
