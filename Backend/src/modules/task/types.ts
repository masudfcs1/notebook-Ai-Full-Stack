export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface CreateTaskData {
  teamId: string;
  title: string;
  description?: string;
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  noteId?: string;
  userId?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  teamId?: string;
  noteId?: string;
}

export interface TaskFilterQuery {
  teamId?: string;
  workspaceId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStatsResponse {
  total: number;
  backlog: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  completionRate: number;
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface TaskResponseDto {
  id: string;
  identifier: string;
  teamId: string | null;
  teamName?: string;
  teamKey?: string;
  teamIcon?: string | null;
  workspaceId?: string;
  noteId?: string | null;
  title: string;
  description: string | null;
  assignee: string | null;
  assigneeAvatar: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
