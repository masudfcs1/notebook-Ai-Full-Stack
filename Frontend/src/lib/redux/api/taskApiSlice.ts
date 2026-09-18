import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuthHandling } from "./baseQuery";
import {
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../dataSlice";
import type { PriorityLevel, TaskStatus } from "@/types";
import type { RootState } from "../store";

/* ---------- Types ---------- */

export interface TaskItem {
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
  priority: PriorityLevel;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatsData {
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

export interface TasksResponse {
  success: boolean;
  message: string;
  data: TaskItem[];
}

export interface SingleTaskResponse {
  success: boolean;
  message: string;
  data: TaskItem;
}

export interface TaskStatsResponse {
  success: boolean;
  message: string;
  data: TaskStatsData;
}

export interface GetTasksParams {
  teamId?: string;
  workspaceId?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  assignee?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateTaskRequest {
  teamId: string;
  title: string;
  description?: string;
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  priority?: PriorityLevel;
  status?: TaskStatus;
  noteId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  assignee?: string | null;
  assigneeAvatar?: string | null;
  dueDate?: string | null;
  priority?: PriorityLevel;
  status?: TaskStatus;
  teamId?: string;
  noteId?: string | null;
}

export interface UpdateTaskStatusRequest {
  id: string;
  status: TaskStatus;
  teamId?: string;
}

// Save rapid moves in order per task without blocking other cards or stores.
const statusQueues = new WeakMap<object, Map<string, Promise<unknown>>>();
const statusEdits = new WeakMap<
  object,
  Map<string, {
    pending: number;
    latestRequestId: string;
    confirmedStatus?: TaskStatus;
  }>
>();

/* ---------- API Slice ---------- */

function statusDependentTags(params?: GetTasksParams) {
  return params?.status || params?.sortBy === "status" || params?.sortBy === "updatedAt"
    ? [{ type: "Tasks" as const, id: "STATUS_DEPENDENT" }]
    : [];
}

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ["Tasks", "TaskStats"],
  endpoints: (builder) => ({
    getTasksByTeam: builder.query<
      TasksResponse,
      { teamId: string; params?: GetTasksParams }
    >({
      query: ({ teamId, params }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.priority) searchParams.set("priority", params.priority);
        if (params?.assignee) searchParams.set("assignee", params.assignee);
        if (params?.search) searchParams.set("search", params.search);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        const queryStr = searchParams.toString();
        return `/tasks/team/${teamId}${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (_result, _error, { teamId, params }) => [
        { type: "Tasks", id: teamId },
        "Tasks",
        ...statusDependentTags(params),
      ],
    }),

    getTasksByWorkspace: builder.query<
      TasksResponse,
      { workspaceId: string; params?: GetTasksParams }
    >({
      query: ({ workspaceId, params }) => {
        const searchParams = new URLSearchParams();
        searchParams.set("workspaceId", workspaceId);
        if (params?.teamId) searchParams.set("teamId", params.teamId);
        if (params?.status) searchParams.set("status", params.status);
        if (params?.priority) searchParams.set("priority", params.priority);
        if (params?.assignee) searchParams.set("assignee", params.assignee);
        if (params?.search) searchParams.set("search", params.search);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        return `/tasks?${searchParams.toString()}`;
      },
      providesTags: (_result, _error, { params }) => [
        "Tasks",
        ...statusDependentTags(params),
      ],
    }),

    getTaskStats: builder.query<
      TaskStatsResponse,
      { teamId?: string; workspaceId?: string }
    >({
      query: ({ teamId, workspaceId }) => {
        const searchParams = new URLSearchParams();
        if (teamId) searchParams.set("teamId", teamId);
        if (workspaceId) searchParams.set("workspaceId", workspaceId);
        return `/tasks/stats?${searchParams.toString()}`;
      },
      providesTags: ["TaskStats", "Tasks"],
    }),

    createTask: builder.mutation<SingleTaskResponse, CreateTaskRequest>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks", "TaskStats"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const task = data.data;
            // Sync to local dataSlice
            dispatch(
              addTask({
                id: task.id,
                identifier: task.identifier,
                teamId: task.teamId || undefined,
                teamName: task.teamName,
                workspaceId: task.workspaceId,
                noteId: task.noteId || undefined,
                title: task.title,
                description: task.description || undefined,
                assignee: task.assignee || undefined,
                assigneeAvatar: task.assigneeAvatar || undefined,
                dueDate: task.dueDate || undefined,
                priority: task.priority,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
              })
            );

            // Optimistically update getTasksByTeam cache
            if (arg.teamId) {
              dispatch(
                taskApi.util.updateQueryData(
                  "getTasksByTeam",
                  { teamId: arg.teamId },
                  (draft) => {
                    if (draft?.data) {
                      const exists = draft.data.some((t) => t.id === task.id);
                      if (!exists) {
                        draft.data.unshift(task);
                      }
                    }
                  }
                )
              );
            }
          }
        } catch {}
      },
    }),

    updateTask: builder.mutation<
      SingleTaskResponse,
      { id: string; data: UpdateTaskRequest; teamId?: string }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tasks", "TaskStats"],
      async onQueryStarted({ id, data: patchData, teamId }, { dispatch, queryFulfilled }) {
        // Optimistic UI updates
        const patchResultTeam = teamId
          ? dispatch(
              taskApi.util.updateQueryData(
                "getTasksByTeam",
                { teamId },
                (draft) => {
                  if (draft?.data) {
                    const idx = draft.data.findIndex((t) => t.id === id);
                    if (idx >= 0) {
                      draft.data[idx] = {
                        ...draft.data[idx],
                        ...patchData,
                        updatedAt: new Date().toISOString(),
                      } as TaskItem;
                    }
                  }
                }
              )
            )
          : null;

        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const task = data.data;
            dispatch(
              updateTask({
                id: task.id,
                title: task.title,
                description: task.description || undefined,
                assignee: task.assignee || undefined,
                assigneeAvatar: task.assigneeAvatar || undefined,
                dueDate: task.dueDate || undefined,
                priority: task.priority,
                status: task.status,
                teamId: task.teamId || undefined,
                updatedAt: task.updatedAt,
              })
            );
          }
        } catch {
          patchResultTeam?.undo();
        }
      },
    }),

    updateTaskStatus: builder.mutation<
      SingleTaskResponse,
      UpdateTaskStatusRequest
    >({
      async queryFn({ id, status }, api, _extraOptions, baseQuery) {
        const token = (api.getState() as RootState).auth.token;
        let queues = statusQueues.get(api.getState);
        if (!queues) {
          queues = new Map();
          statusQueues.set(api.getState, queues);
        }
        const previous = queues.get(id);
        const request = (async () => {
          if (previous) await previous.catch(() => undefined);
          if (
            api.signal.aborted ||
            (api.getState() as RootState).auth.token !== token
          ) {
            return {
              error: { status: "FETCH_ERROR" as const, error: "Status update cancelled" },
            };
          }
          const result = await baseQuery({
            url: `/tasks/${id}/status`,
            method: "PATCH",
            body: { status },
          });
          if (result.error) return { error: result.error };
          return { data: result.data as SingleTaskResponse };
        })();
        queues.set(id, request);
        try {
          return await request;
        } finally {
          if (queues.get(id) === request) queues.delete(id);
        }
      },
      // The mutation response confirms normal board caches directly. Only
      // status-dependent lists and server statistics need a fresh query.
      invalidatesTags: (_result, error) => error
        ? ["Tasks", "TaskStats"]
        : ["TaskStats", { type: "Tasks", id: "STATUS_DEPENDENT" }],
      async onQueryStarted(
        { id, status },
        { dispatch, getState, queryFulfilled, requestId },
      ) {
        let edits = statusEdits.get(getState);
        if (!edits) {
          edits = new Map();
          statusEdits.set(getState, edits);
        }
        const state = getState() as RootState;
        let previousStatus: TaskStatus | undefined;
        for (const args of taskApi.util.selectCachedArgsForQuery(state, "getTasksByWorkspace")) {
          previousStatus ??= taskApi.endpoints.getTasksByWorkspace.select(args)(state)
            .data?.data.find((task) => task.id === id)?.status;
        }
        for (const args of taskApi.util.selectCachedArgsForQuery(state, "getTasksByTeam")) {
          previousStatus ??= taskApi.endpoints.getTasksByTeam.select(args)(state)
            .data?.data.find((task) => task.id === id)?.status;
        }
        previousStatus ??= state.data.tasks.find((task) => task.id === id)?.status;
        const edit = edits.get(id) || {
          pending: 0,
          latestRequestId: requestId,
          confirmedStatus: previousStatus,
        };
        edit.pending++;
        edit.latestRequestId = requestId;
        edits.set(id, edit);

        const applyStatus = (nextStatus: TaskStatus, updatedAt?: string) => {
          if ((getState() as RootState).auth.token !== state.auth.token) return;
          const localTask = (getState() as RootState).data.tasks.find((task) => task.id === id);
          if (localTask && localTask.status !== nextStatus) {
            dispatch(updateTaskStatus({ id, status: nextStatus }));
          }
          // Patch exact cache arguments, including workspace and team filters.
          for (const args of taskApi.util.selectCachedArgsForQuery(getState(), "getTasksByWorkspace")) {
            dispatch(taskApi.util.updateQueryData("getTasksByWorkspace", args, (draft) => {
              const task = draft.data.find((item) => item.id === id);
              if (task) {
                task.status = nextStatus;
                if (updatedAt) task.updatedAt = updatedAt;
              }
            }));
          }
          for (const args of taskApi.util.selectCachedArgsForQuery(getState(), "getTasksByTeam")) {
            dispatch(taskApi.util.updateQueryData("getTasksByTeam", args, (draft) => {
              const task = draft.data.find((item) => item.id === id);
              if (task) {
                task.status = nextStatus;
                if (updatedAt) task.updatedAt = updatedAt;
              }
            }));
          }
        };

        applyStatus(status);
        try {
          const { data } = await queryFulfilled;
          edit.confirmedStatus = data.data.status;
          if (edit.latestRequestId === requestId) {
            applyStatus(data.data.status, data.data.updatedAt);
          }
        } catch {
          // Never let an older failed save undo a newer drag.
          if (edit.latestRequestId === requestId && edit.confirmedStatus) {
            applyStatus(edit.confirmedStatus);
          }
        } finally {
          edit.pending--;
          if (edit.pending === 0) edits.delete(id);
        }
      },
    }),

    deleteTask: builder.mutation<
      { success: boolean; message: string },
      { id: string; teamId?: string }
    >({
      query: ({ id }) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks", "TaskStats"],
      async onQueryStarted({ id, teamId }, { dispatch, queryFulfilled }) {
        // Instant optimistic removal from Redux dataSlice
        dispatch(deleteTask(id));

        // Instant optimistic removal from RTK Query cache
        const patchResultTeam = teamId
          ? dispatch(
              taskApi.util.updateQueryData(
                "getTasksByTeam",
                { teamId },
                (draft) => {
                  if (draft?.data) {
                    draft.data = draft.data.filter((t) => t.id !== id);
                  }
                }
              )
            )
          : null;

        try {
          await queryFulfilled;
        } catch {
          patchResultTeam?.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTasksByTeamQuery,
  useGetTasksByWorkspaceQuery,
  useGetTaskStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = taskApi;
