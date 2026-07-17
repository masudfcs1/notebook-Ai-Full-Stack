'use client'

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Search, Filter, FileText, Sparkles, CheckSquare, Eye, Trash2,
  Calendar, ArrowUpDown, ChevronLeft, ChevronRight, Inbox,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { deleteNote } from "@/lib/redux/dataSlice"
import { setView, setActiveNote } from "@/lib/redux/appSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/app/empty-state"

const PAGE_SIZE = 6

export function HistoryView() {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((s) => s.data.notes)
  const summaries = useAppSelector((s) => s.data.summaries)
  const tasks = useAppSelector((s) => s.data.tasks)
  const globalSearch = useAppSelector((s) => s.app.searchQuery)

  const [search, setSearch] = useState(globalSearch)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = [...notes]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") list = list.filter((n) => n.status === statusFilter)
    if (sourceFilter !== "all") list = list.filter((n) => n.source === sourceFilter)
    list.sort((a, b) => {
      if (sortBy === "title") {
        const r = a.title.localeCompare(b.title)
        return sortDir === "asc" ? r : -r
      }
      const r = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortDir === "asc" ? r : -r
    })
    return list
  }, [notes, search, statusFilter, sourceFilter, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function toggleSort(field: "date" | "title") {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
  }

  function viewDetails(id: string) {
    dispatch(setActiveNote(id))
    const note = notes.find((n) => n.id === id)
    dispatch(setView(note?.status === "summarized" ? "summary" : "upload"))
  }

  function handleDelete(id: string) {
    dispatch(deleteNote(id))
    toast.success("Meeting deleted")
  }

  if (notes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Inbox}
          title="No meeting history yet"
          description="Your past meetings and their summaries will be listed here for easy searching and review."
          action={{ label: "Upload your first note", onClick: () => dispatch(setView("upload")) }}
          gradient="from-amber-500 to-orange-500"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Filters */}
      <Card className="flex flex-col gap-3 border-border/50 p-4 backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by title or content…"
            className="h-10 rounded-xl border-border/60 bg-muted/30 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-border/60 bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="summarized">Summarized</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1) }}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-border/60 bg-muted/30">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="upload">Upload</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-border/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[28%]">
                <button
                  onClick={() => toggleSort("title")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Meeting Title <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-[16%]">
                <button
                  onClick={() => toggleSort("date")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-[12%]">Source</TableHead>
              <TableHead className="w-[14%]">Summary</TableHead>
              <TableHead className="w-[14%]">Actions</TableHead>
              <TableHead className="w-[8%] text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No meetings match your filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((note, i) => {
                const hasSummary = summaries.some((s) => s.noteId === note.id)
                const taskCount = tasks.filter((t) => t.noteId === note.id).length
                return (
                  <motion.tr
                    key={note.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                          hasSummary ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-amber-500 to-orange-500"
                        )}>
                          {hasSummary ? <Sparkles className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{note.title}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {note.content.slice(0, 60)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="text-[10px] uppercase">{note.source}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="secondary" className={cn(
                        "gap-1 text-[10px]",
                        note.status === "summarized" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {note.status === "summarized" ? <><CheckSquare className="h-2.5 w-2.5" /> Ready</> : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="secondary" className="gap-1 bg-muted/60 text-[10px]">
                        <CheckSquare className="h-2.5 w-2.5" /> {taskCount} task{taskCount !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => viewDetails(note.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 opacity-0 transition-opacity hover:bg-rose-500/10 group-hover:opacity-100"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</span>–
          <span className="font-medium text-foreground">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of{" "}
          <span className="font-medium text-foreground">{filtered.length}</span> meetings
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={cn(
                  "h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors",
                  currentPage === idx + 1
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 rounded-lg"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
