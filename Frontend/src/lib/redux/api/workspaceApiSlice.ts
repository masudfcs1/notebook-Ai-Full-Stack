import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

/* ---------- Types ---------- */

export interface TeamMember {
  id: string;
  teamId: string;
  userId?: number | null;
  name: string;
  email: string;
  avatar?: string | null;
  role: "OWNER" | "LEAD" | "MEMBER";
  createdAt?: string;
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

/* ---------- API Slice ---------- */

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5015/api/v1";
};

export const workspaceApi = createApi({
  reducerPath: "workspaceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token =
        state.auth?.token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Workspaces", "Workspace"],
  endpoints: (builder) => ({
    getWorkspaces: builder.query<WorkspacesResponse, GetWorkspacesParams | void>({
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
      providesTags: (_result, _error, idOrSlug) => [{ type: "Workspace", id: idOrSlug }],
    }),
    createWorkspace: builder.mutation<SingleWorkspaceResponse, CreateWorkspaceRequest>({
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
      invalidatesTags: (_result, _error, { id }) => ["Workspaces", { type: "Workspace", id }],
    }),
    deleteWorkspace: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspaces"],
    }),
    // Team Endpoints
    getTeamsByWorkspace: builder.query<TeamsResponse, string>({
      query: (workspaceId) => `/teams?workspaceId=${workspaceId}`,
      providesTags: ["Workspaces"],
    }),
    createTeam: builder.mutation<SingleTeamResponse, CreateTeamRequest>({
      query: (body) => ({
        url: "/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Workspaces"],
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
      invalidatesTags: ["Workspaces"],
    }),
    deleteTeam: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspaces"],
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
} = workspaceApi;
