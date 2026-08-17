"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
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
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div 
          className="h-full w-full cursor-context-menu"
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        sideOffset={8}
        className="w-64 p-1 rounded-xl shadow-lg"
      >
        {/* Status */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <CircleDashed className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Status</span>
            <DropdownMenuShortcut>S</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Todo</DropdownMenuItem>
            <DropdownMenuItem>In Progress</DropdownMenuItem>
            <DropdownMenuItem>Done</DropdownMenuItem>
            <DropdownMenuItem>Canceled</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Priority */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Priority</span>
            <DropdownMenuShortcut>P</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>No Priority</DropdownMenuItem>
            <DropdownMenuItem>Low</DropdownMenuItem>
            <DropdownMenuItem>Medium</DropdownMenuItem>
            <DropdownMenuItem>High</DropdownMenuItem>
            <DropdownMenuItem>Urgent</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Assignee */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Assignee</span>
            <DropdownMenuShortcut>A</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Unassigned</DropdownMenuItem>
            <DropdownMenuItem>Assign to me</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Due date */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Due date</span>
            <DropdownMenuShortcut>⇧ D</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Today</DropdownMenuItem>
            <DropdownMenuItem>Tomorrow</DropdownMenuItem>
            <DropdownMenuItem>Next Week</DropdownMenuItem>
            <DropdownMenuItem>Custom...</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Labels */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Labels</span>
            <DropdownMenuShortcut>L</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Bug</DropdownMenuItem>
            <DropdownMenuItem>Feature</DropdownMenuItem>
            <DropdownMenuItem>Improvement</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Project */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Project</span>
            <DropdownMenuShortcut>⇧ P</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Move to Project...</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* More properties */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">More properties</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Estimate</DropdownMenuItem>
            <DropdownMenuItem>Cycle</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1" />

        {/* Create related */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <PlusSquare className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Create related</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Sub-issue</DropdownMenuItem>
            <DropdownMenuItem>Blocker</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Mark as */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Mark as</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Spam</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Remove */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <XSquare className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Remove</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>From Project</DropdownMenuItem>
            <DropdownMenuItem>From Cycle</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1" />

        {/* Copy */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Copy className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Copy</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Issue ID</DropdownMenuItem>
            <DropdownMenuItem>Issue Link</DropdownMenuItem>
            <DropdownMenuItem>Git Branch Name</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Convert to */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Convert to</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Project</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Move */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Move</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>To another Team...</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Open in */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Open in</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>New Tab</DropdownMenuItem>
            <DropdownMenuItem>Desktop App</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Infinity className="h-4 w-4 text-muted-foreground" />
          <span>Run loop on E-25...</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Star className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Favorite</span>
          <DropdownMenuShortcut>Alt F</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2 rounded-md px-2 py-1.5">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Subscribe</span>
          <DropdownMenuShortcut>⇧ S</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 rounded-md px-2 py-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Remind me</span>
            <DropdownMenuShortcut>⇧ H</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Tomorrow</DropdownMenuItem>
            <DropdownMenuItem>Next Week</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="gap-2 rounded-md px-2 py-1.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash className="h-4 w-4" />
          <span className="flex-1">Delete</span>
          <DropdownMenuShortcut>Ctrl Delete</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
