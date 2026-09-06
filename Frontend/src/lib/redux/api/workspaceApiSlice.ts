import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuthHandling } from "./baseQuery";
import {
  addWorkspace,
  updateWorkspaceInState,
  deleteWorkspaceFromState,
  addTeam,
  updateTeam,
  deleteTeamFromState,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from "../dataSlice";

/* ---------- Types ---------- */

export interface UserTeamMembership {
  teamId: string;
  teamName: string;
  teamKey: string;
  teamIcon?: string | null;
  role: string;
}

export interface TeamMemberUser {
  id: number;
  uuid: string;
  name: string | null;
  username: string | null;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  memberships?: UserTeamMembership[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId?: number | null;
  name: string;
  email: string;
  avatar?: string | null;
  role: "OWNER" | "LEAD" | "MEMBER";
  createdAt?: string;
  user?: TeamMemberUser | null;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  slug?: string;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  members: TeamMember[];
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
  teams: Team[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WorkspacesResponse {
  success: boolean;
  message: string;
  data: WorkspaceItem[];
  meta: PaginationMeta;
}

export interface AllWorkspacesResponse {
  success: boolean;
  message: string;
  data: WorkspaceItem[];
}

export interface SingleWorkspaceResponse {
  success: boolean;
  message: string;
  data: WorkspaceItem;
}

export interface GetWorkspacesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateWorkspaceRequest {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export interface CreateTeamRequest {
  workspaceId: string;
  name: string;
  key: string;
  icon?: string;
  slug?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  key?: string;
  icon?: string;
  slug?: string;
}

export interface SingleTeamResponse {
  success: boolean;
  message: string;
  data: Team;
}

export interface TeamsResponse {
  success: boolean;
  message: string;
  data: Team[];
}

export interface TeamMembersResponse {
  success: boolean;
  message: string;
  data: TeamMember[];
}

export interface SingleTeamMemberResponse {
  success: boolean;
  message: string;
  data: TeamMember;
}

export interface BulkTeamMembersResponse {
  success: boolean;
  message: string;
  data: {
    addedCount: number;
    members: TeamMember[];
  };
}

export interface AvailableUsersResponse {
  success: boolean;
  message: string;
  data: TeamMemberUser[];
}

export interface AddTeamMemberRequest {
  userId?: number;
  name: string;
  email: string;
  role?: "OWNER" | "LEAD" | "MEMBER";
  avatar?: string;
}

export interface AddTeamMembersBulkRequest {
  members: AddTeamMemberRequest[];
}

export interface UpdateTeamMemberRequest {
  name?: string;
  email?: string;
  role?: "OWNER" | "LEAD" | "MEMBER";
  avatar?: string;
}

/* ---------- API Slice ---------- */

export const workspaceApi = createApi({
  reducerPath: "workspaceApi",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ["Workspaces", "Workspace", "Teams", "TeamMembers"],
  endpoints: (builder) => ({
    getWorkspaces: builder.query<
      WorkspacesResponse,
      GetWorkspacesParams | void
    >({
      query: (params) => {
        if (!params) return "/workspaces";
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.search) searchParams.set("search", params.search);
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        return `/workspaces?${searchParams.toString()}`;
      },
      providesTags: ["Workspaces"],
    }),
    getAllWorkspaces: builder.query<AllWorkspacesResponse, void>({
      query: () => "/workspaces/all",
      providesTags: ["Workspaces"],
    }),
    getWorkspaceById: builder.query<SingleWorkspaceResponse, string>({
      query: (idOrSlug) => `/workspaces/${idOrSlug}`,
      providesTags: (_result, _error, idOrSlug) => [
        { type: "Workspace", id: idOrSlug },
      ],
    }),
    createWorkspace: builder.mutation<
      SingleWorkspaceResponse,
      CreateWorkspaceRequest
    >({
      query: (body) => ({
        url: "/workspaces",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Workspaces"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const ws = data.data;
            dispatch(addWorkspace(ws as any));
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    const exists = draft.data.some((w) => w.id === ws.id);
                    if (!exists) {
                      draft.data.unshift(ws as any);
                    }
                  }
                },
              ),
            );
          }
        } catch {}
      },
    }),
    updateWorkspace: builder.mutation<
      SingleWorkspaceResponse,
      { id: string; data: UpdateWorkspaceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/workspaces/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Workspaces",
        { type: "Workspace", id },
      ],
      async onQueryStarted(
        { id, data: patchData },
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;
          const updated = data?.data;
          if (updated) {
            dispatch(updateWorkspaceInState(updated as any));
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    const idx = draft.data.findIndex((w) => w.id === id);
                    if (idx >= 0) {
                      draft.data[idx] = { ...draft.data[idx], ...updated };
                    }
                  }
                },
              ),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getWorkspaceById",
                id,
                (draft) => {
                  if (draft?.data) {
                    draft.data = { ...draft.data, ...updated };
                  }
                },
              ),
            );
          } else {
            dispatch(updateWorkspaceInState({ id, ...patchData }));
          }
        } catch {}
      },
    }),
    deleteWorkspace: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspaces"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(deleteWorkspaceFromState(id));
          dispatch(
            workspaceApi.util.updateQueryData(
              "getAllWorkspaces",
              undefined,
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter((w) => w.id !== id);
                }
              },
            ),
          );
        } catch {}
      },
    }),

    // Team Endpoints
    getTeamsByWorkspace: builder.query<TeamsResponse, string>({
      query: (workspaceId) => `/teams?workspaceId=${workspaceId}`,
      providesTags: ["Workspaces", "Teams"],
    }),
    createTeam: builder.mutation<SingleTeamResponse, CreateTeamRequest>({
      query: (body) => ({
        url: "/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Workspaces", "Teams"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const team = data.data;
            dispatch(addTeam(team as any));
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    const ws = draft.data.find(
                      (w) => w.id === team.workspaceId,
                    );
                    if (ws) {
                      if (!ws.teams) ws.teams = [];
                      if (!ws.teams.some((t) => t.id === team.id)) {
                        ws.teams.push(team as any);
                      }
                    }
                  }
                },
              ),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getTeamsByWorkspace",
                team.workspaceId,
                (draft) => {
                  if (draft?.data) {
                    if (!draft.data.some((t) => t.id === team.id)) {
                      draft.data.push(team as any);
                    }
                  }
                },
              ),
            );
          }
        } catch {}
      },
    }),
    updateTeam: builder.mutation<
      SingleTeamResponse,
      { id: string; data: UpdateTeamRequest }
    >({
      query: ({ id, data }) => ({
        url: `/teams/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Workspaces", "Teams"],
      async onQueryStarted(
        { id, data: patchData },
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;
          const updated = data?.data;
          if (updated) {
            dispatch(
              updateTeam({
                teamId: id,
                name: updated.name,
                key: updated.key,
                icon: updated.icon || undefined,
              }),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    for (const ws of draft.data) {
                      if (ws.teams) {
                        const tIdx = ws.teams.findIndex((t) => t.id === id);
                        if (tIdx >= 0) {
                          ws.teams[tIdx] = { ...ws.teams[tIdx], ...updated };
                          break;
                        }
                      }
                    }
                  }
                },
              ),
            );
            if (updated.workspaceId) {
              dispatch(
                workspaceApi.util.updateQueryData(
                  "getTeamsByWorkspace",
                  updated.workspaceId,
                  (draft) => {
                    if (draft?.data) {
                      const idx = draft.data.findIndex((t) => t.id === id);
                      if (idx >= 0) {
                        draft.data[idx] = { ...draft.data[idx], ...updated };
                      }
                    }
                  },
                ),
              );
            }
          } else {
            dispatch(
              updateTeam({
                teamId: id,
                name: patchData.name,
                key: patchData.key,
                icon: patchData.icon,
              }),
            );
          }
        } catch {}
      },
    }),
    deleteTeam: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/teams/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Workspaces", "Teams"],
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(deleteTeamFromState(id));
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    for (const ws of draft.data) {
                      if (ws.teams) {
                        ws.teams = ws.teams.filter((t) => t.id !== id);
                      }
                    }
                  }
                },
              ),
            );
          } catch {}
        },
      },
    ),

    // Team Members Endpoints
    getTeamMembers: builder.query<TeamMembersResponse, string>({
      query: (teamId) => `/teams/${teamId}/members`,
      providesTags: (_result, _error, teamId) => [
        { type: "TeamMembers", id: teamId },
      ],
    }),
    addTeamMember: builder.mutation<
      SingleTeamMemberResponse,
      { teamId: string; data: AddTeamMemberRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "TeamMembers", id: teamId },
        "Workspaces",
        "Teams",
      ],
      async onQueryStarted({ teamId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const member = data.data;
            dispatch(addTeamMember({ teamId, member: member as any }));
            dispatch(
              workspaceApi.util.updateQueryData(
                "getTeamMembers",
                teamId,
                (draft) => {
                  if (draft?.data) {
                    const exists = draft.data.some((m) => m.id === member.id);
                    if (!exists) {
                      draft.data.push(member as any);
                    }
                  }
                },
              ),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    for (const ws of draft.data) {
                      if (ws.teams) {
                        const t = ws.teams.find((team) => team.id === teamId);
                        if (t) {
                          if (!t.members) t.members = [];
                          if (!t.members.some((m) => m.id === member.id)) {
                            t.members.push(member as any);
                          }
                          break;
                        }
                      }
                    }
                  }
                },
              ),
            );
          }
        } catch {}
      },
    }),
    addTeamMembersBulk: builder.mutation<
      BulkTeamMembersResponse,
      { teamId: string; data: AddTeamMembersBulkRequest }
    >({
      query: ({ teamId, data }) => ({
        url: `/teams/${teamId}/members/bulk`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "TeamMembers", id: teamId },
        "Workspaces",
        "Teams",
      ],
      async onQueryStarted({ teamId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.members) {
            for (const member of data.data.members) {
              dispatch(addTeamMember({ teamId, member: member as any }));
            }
            dispatch(
              workspaceApi.util.updateQueryData(
                "getTeamMembers",
                teamId,
                (draft) => {
                  if (draft?.data) {
                    for (const member of data.data.members) {
                      const exists = draft.data.some((m) => m.id === member.id);
                      if (!exists) {
                        draft.data.push(member as any);
                      }
                    }
                  }
                },
              ),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    for (const ws of draft.data) {
                      if (ws.teams) {
                        const t = ws.teams.find((team) => team.id === teamId);
                        if (t) {
                          if (!t.members) t.members = [];
                          for (const member of data.data.members) {
                            if (!t.members.some((m) => m.id === member.id)) {
                              t.members.push(member as any);
                            }
                          }
                          break;
                        }
                      }
                    }
                  }
                },
              ),
            );
          }
        } catch {}
      },
    }),
    updateTeamMember: builder.mutation<
      SingleTeamMemberResponse,
      { teamId: string; memberId: string; data: UpdateTeamMemberRequest }
    >({
      query: ({ teamId, memberId, data }) => ({
        url: `/teams/${teamId}/members/${memberId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "TeamMembers", id: teamId },
        "Workspaces",
        "Teams",
      ],
      async onQueryStarted(
        { teamId, memberId, data: patchData },
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const updated = data.data;
            dispatch(
              updateTeamMember({
                teamId,
                memberId,
                name: updated.name,
                email: updated.email,
                role: updated.role,
              }),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getTeamMembers",
                teamId,
                (draft) => {
                  if (draft?.data) {
                    const idx = draft.data.findIndex((m) => m.id === memberId);
                    if (idx >= 0) {
                      draft.data[idx] = { ...draft.data[idx], ...updated };
                    }
                  }
                },
              ),
            );
            dispatch(
              workspaceApi.util.updateQueryData(
                "getAllWorkspaces",
                undefined,
                (draft) => {
                  if (draft?.data) {
                    for (const ws of draft.data) {
                      if (ws.teams) {
                        const t = ws.teams.find((team) => team.id === teamId);
                        if (t && t.members) {
                          const mIdx = t.members.findIndex(
                            (m) => m.id === memberId,
                          );
                          if (mIdx >= 0) {
                            t.members[mIdx] = {
                              ...t.members[mIdx],
                              ...updated,
                            };
                          }
                          break;
                        }
                      }
                    }
                  }
                },
              ),
            );
          } else {
            dispatch(
              updateTeamMember({
                teamId,
                memberId,
                name: patchData.name,
                email: patchData.email,
                role: patchData.role,
              }),
            );
          }
        } catch {}
      },
    }),
    removeTeamMember: builder.mutation<
      { success: boolean; message: string },
      { teamId: string; memberId: string }
    >({
      query: ({ teamId, memberId }) => ({
        url: `/teams/${teamId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: "TeamMembers", id: teamId },
        "Workspaces",
        "Teams",
      ],
      async onQueryStarted({ teamId, memberId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeTeamMember({ teamId, memberId }));
          dispatch(
            workspaceApi.util.updateQueryData(
              "getTeamMembers",
              teamId,
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter((m) => m.id !== memberId);
                }
              },
            ),
          );
          dispatch(
            workspaceApi.util.updateQueryData(
              "getAllWorkspaces",
              undefined,
              (draft) => {
                if (draft?.data) {
                  for (const ws of draft.data) {
                    if (ws.teams) {
                      const t = ws.teams.find((team) => team.id === teamId);
                      if (t && t.members) {
                        t.members = t.members.filter((m) => m.id !== memberId);
                        break;
                      }
                    }
                  }
                }
              },
            ),
          );
        } catch {}
      },
    }),
    getAvailableUsersForTeam: builder.query<
      AvailableUsersResponse,
      { teamId: string; search?: string }
    >({
      query: ({ teamId, search }) => {
        const queryParam = search
          ? `?search=${encodeURIComponent(search)}`
          : "";
        return `/teams/${teamId}/available-users${queryParam}`;
      },
      providesTags: (_result, _error, { teamId }) => [
        { type: "TeamMembers", id: teamId },
      ],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetAllWorkspacesQuery,
  useGetWorkspaceByIdQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetTeamsByWorkspaceQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useAddTeamMembersBulkMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetAvailableUsersForTeamQuery,
} = workspaceApi;
