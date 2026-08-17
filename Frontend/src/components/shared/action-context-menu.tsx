"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu"
import {
  CircleDashed,
  BarChart2,
  UserPlus,
  Calendar,
  Tag,
  Box,
  MoreHorizontal,
  PlusSquare,
  Flag,
  Copy,
  RefreshCw,
  Move,
  ExternalLink,
  Infinity,
  Star,
  Bell,
  Clock,
  Trash,
  XSquare
} from "lucide-react"

interface ActionItemContextMenuProps {
  children: React.ReactNode;
}

export function ActionItemContextMenu({ children }: ActionItemContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="h-full w-full cursor-context-menu">
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 p-1 rounded-xl shadow-lg">
        {/* Status */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <CircleDashed className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Status</span>
            <ContextMenuShortcut>S</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Todo</ContextMenuItem>
            <ContextMenuItem>In Progress</ContextMenuItem>
            <ContextMenuItem>Done</ContextMenuItem>
            <ContextMenuItem>Canceled</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Priority */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Priority</span>
            <ContextMenuShortcut>P</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>No Priority</ContextMenuItem>
            <ContextMenuItem>Low</ContextMenuItem>
            <ContextMenuItem>Medium</ContextMenuItem>
            <ContextMenuItem>High</ContextMenuItem>
            <ContextMenuItem>Urgent</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Assignee */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Assignee</span>
            <ContextMenuShortcut>A</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Unassigned</ContextMenuItem>
            <ContextMenuItem>Assign to me</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Due date */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Due date</span>
            <ContextMenuShortcut>⇧ D</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Today</ContextMenuItem>
            <ContextMenuItem>Tomorrow</ContextMenuItem>
            <ContextMenuItem>Next Week</ContextMenuItem>
            <ContextMenuItem>Custom...</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Labels */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Labels</span>
            <ContextMenuShortcut>L</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Bug</ContextMenuItem>
            <ContextMenuItem>Feature</ContextMenuItem>
            <ContextMenuItem>Improvement</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Project */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Project</span>
            <ContextMenuShortcut>⇧ P</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Move to Project...</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* More properties */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">More properties</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Estimate</ContextMenuItem>
            <ContextMenuItem>Cycle</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="my-1" />

        {/* Create related */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <PlusSquare className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Create related</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Sub-issue</ContextMenuItem>
            <ContextMenuItem>Blocker</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Mark as */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Mark as</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuItem>Spam</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Remove */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <XSquare className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Remove</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>From Project</ContextMenuItem>
            <ContextMenuItem>From Cycle</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="my-1" />

        {/* Copy */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Copy className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Copy</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Issue ID</ContextMenuItem>
            <ContextMenuItem>Issue Link</ContextMenuItem>
            <ContextMenuItem>Git Branch Name</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Convert to */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Convert to</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Project</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Move */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Move</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>To another Team...</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Open in */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Open in</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>New Tab</ContextMenuItem>
            <ContextMenuItem>Desktop App</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="my-1" />

        <ContextMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Infinity className="h-4 w-4 text-muted-foreground" />
          <span>Run loop on E-25...</span>
        </ContextMenuItem>

        <ContextMenuSeparator className="my-1" />

        <ContextMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Star className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Favorite</span>
          <ContextMenuShortcut>Alt F</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Subscribe</span>
          <ContextMenuShortcut>⇧ S</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Remind me</span>
            <ContextMenuShortcut>⇧ H</ContextMenuShortcut>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Tomorrow</ContextMenuItem>
            <ContextMenuItem>Next Week</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="my-1" />

        <ContextMenuItem className="gap-2 rounded-md px-2 py-1.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash className="h-4 w-4" />
          <span className="flex-1">Delete</span>
          <ContextMenuShortcut>Ctrl Delete</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
