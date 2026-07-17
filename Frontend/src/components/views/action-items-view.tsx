'use client'

import { useState } from "react"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDroppable, useDraggable,
} from "@dnd-kit/core"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckSquare, Clock, Loader2, Plus, User, Calendar, Flag, MoreHorizontal,
  GripVertical,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addTask, moveTask, deleteTask, updateTask, type ActionItem, type TaskStatus, type TaskPriority } from "@/lib/redux/dataSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/app/empty-state"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const COLUMNS: { id: TaskStatus; label: string; icon: typeof Clock; gradient: string; accent: string }[] = [
  { id: "pending", label: "Pending", icon: Clock, gradient: "from-amber-500 to-orange-500", accent: "text-amber-500" },
  { id: "in_progress", label: "In Progress", icon: Loader2, gradient: "from-sky-500 to-indigo-500", accent: "text-sky-500" },
  { id: "completed", label: "Completed", icon: CheckSquare, gradient: "from-emerald-500 to-teal-500", accent: "text-emerald-500" },
]

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
}

export function ActionItemsView() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((s) => s.data.tasks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const activeTask = tasks.find((t) => t.id === activeId) ?? null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const over = e.over
    if (!over) return
    const targetStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === e.active.id)
    if (task && task.status !== targetStatus) {
      dispatch(moveTask({ id: task.id, status: targetStatus }))
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === targetStatus)?.label}`)
    }
  }

  function handleAdd(status: TaskStatus) {
    if (!newTitle.trim()) {
      setAddingTo(null)
      return
    }
    dispatch(addTask({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      status,
      priority: "medium",
      createdAt: new Date().toISOString(),
    }))
    setNewTitle("")
    setAddingTo(null)
    toast.success("Task added")
  }

  if (tasks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={CheckSquare}
          title="No action items yet"
          description="Action items are extracted automatically when you summarize meeting notes. They'll appear here on your board."
          action={{ label: "Summarize a meeting", onClick: () => dispatch(setView("summary")) }}
          gradient="from-emerald-500 to-teal-500"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length
          return (
            <Card key={col.id} className="border-border/50 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white", col.gradient)}>
                  <col.icon className={cn("h-3.5 w-3.5", col.id === "in_progress" && "animate-spin")} />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{count}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{col.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.status === col.id)}
              onAdd={() => setAddingTo(col.id)}
              adding={addingTo === col.id}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              onAddConfirm={() => handleAdd(col.id)}
              onCancelAdd={() => { setAddingTo(null); setNewTitle("") }}
              onDelete={(id) => { dispatch(deleteTask(id)); toast.success("Task deleted") }}
              onCyclePriority={(id) => {
                const t = tasks.find((x) => x.id === id)
                if (!t) return
                const order: TaskPriority[] = ["low", "medium", "high"]
                const next = order[(order.indexOf(t.priority) + 1) % order.length]
                dispatch(updateTask({ id, priority: next }))
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function Column({
  column, tasks, onAdd, adding, newTitle, setNewTitle, onAddConfirm, onCancelAdd, onDelete, onCyclePriority,
}: {
  column: typeof COLUMNS[number]
  tasks: ActionItem[]
  onAdd: () => void
  adding: boolean
  newTitle: string
  setNewTitle: (v: string) => void
  onAddConfirm: () => void
  onCancelAdd: () => void
  onDelete: (id: string) => void
  onCyclePriority: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", column.gradient)}>
            <column.icon className={cn("h-3.5 w-3.5", column.id === "in_progress" && "animate-spin")} />
          </div>
          <h3 className="text-sm font-semibold">{column.label}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{tasks.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] space-y-2.5 rounded-2xl border border-dashed p-2.5 transition-colors",
          isOver ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/40 bg-muted/20"
        )}
      >
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAddConfirm()
                  if (e.key === "Escape") onCancelAdd()
                }}
                placeholder="Task title…"
                className="h-9 rounded-lg border-border/60 bg-background/60 text-sm"
              />
              <div className="mt-1.5 flex gap-1.5">
                <Button size="sm" className="h-7 flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-xs" onClick={onAddConfirm}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="h-7 rounded-lg text-xs" onClick={onCancelAdd}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tasks.length === 0 && !adding && (
          <div className="flex h-32 items-center justify-center text-center text-xs text-muted-foreground/60">
            Drop tasks here
          </div>
        )}

        <AnimatePresence>
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onCyclePriority={onCyclePriority}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DraggableTaskCard({
  task, onDelete, onCyclePriority,
}: {
  task: ActionItem
  onDelete: (id: string) => void
  onCyclePriority: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <TaskCard
        task={task}
        ref={setNodeRef}
        dragHandleProps={{ ...attributes, ...listeners }}
        onDelete={onDelete}
        onCyclePriority={onCyclePriority}
      />
    </motion.div>
  )
}

const TaskCard = (() => {
  const Comp = (
    {
      task, dragging, dragHandleProps, onDelete, onCyclePriority,
      ref,
    }: {
      task: ActionItem
      dragging?: boolean
      dragHandleProps?: any
      onDelete?: (id: string) => void
      onCyclePriority?: (id: string) => void
      ref?: React.Ref<HTMLDivElement>
    }
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative cursor-grab border-border/50 bg-card/80 p-3 backdrop-blur-sm transition-shadow hover:shadow-md active:cursor-grabbing",
          dragging && "shadow-xl shadow-indigo-500/20"
        )}
      >
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground"
              aria-label="Drag"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn(
              "text-sm font-medium leading-snug",
              task.status === "completed" && "text-muted-foreground line-through"
            )}>
              {task.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <button onClick={() => onCyclePriority?.(task.id)}>
                <Badge variant="outline" className={cn("gap-1 text-[9px]", PRIORITY_STYLES[task.priority])}>
                  <Flag className="h-2.5 w-2.5" /> {task.priority}
                </Badge>
              </button>
              {task.assignee && (
                <Badge variant="secondary" className="gap-1 bg-muted/60 text-[10px]">
                  <User className="h-2.5 w-2.5" /> {task.assignee}
                </Badge>
              )}
              {task.dueDate && (
                <Badge variant="secondary" className="gap-1 bg-muted/60 text-[10px]">
                  <Calendar className="h-2.5 w-2.5" /> {task.dueDate}
                </Badge>
              )}
            </div>
          </div>
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCyclePriority?.(task.id)}>
                  <Flag className="mr-2 h-3.5 w-3.5" /> Change priority
                </DropdownMenuItem>
                <DropdownMenuItem className="text-rose-500" onClick={() => onDelete(task.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
    )
  }
  Comp.displayName = "TaskCard"
  return Comp
})()
