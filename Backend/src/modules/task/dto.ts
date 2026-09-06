import { TaskPriority, TaskResponseDto, TaskStatus } from './types';

export function toTaskResponse(task: any): TaskResponseDto {
  const teamKey = task.team?.key || 'TASK';
  const shortId = (task.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '101';
  const identifier = `${teamKey}-${shortId}`;

  return {
    id: task.id,
    identifier,
    teamId: task.teamId || null,
    teamName: task.team?.name,
    teamKey: task.team?.key,
    teamIcon: task.team?.icon,
    workspaceId: task.team?.workspaceId,
    noteId: task.noteId || null,
    title: task.title,
    description: task.description || null,
    assignee: task.assignee || null,
    assigneeAvatar: task.assigneeAvatar || null,
    dueDate: task.dueDate || null,
    priority: (task.priority?.toLowerCase() || 'medium') as TaskPriority,
    status: (task.status?.toLowerCase() || 'todo') as TaskStatus,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
  };
}

export function toTaskListResponse(tasks: any[]): TaskResponseDto[] {
  return tasks.map(toTaskResponse);
}
