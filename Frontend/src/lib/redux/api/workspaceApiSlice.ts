import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuthHandling } from "./baseQuery";

/* ---------- Types ---------- */

export interface TeamMemberUser {
  id: number;
  uuid: string;
  name: string | null;
  username: string | null;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
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
  hasNext: boolean;
  hasPrev: boolean;
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
    }),
    deleteTeam: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/teams/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Workspaces", "Teams"],
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
