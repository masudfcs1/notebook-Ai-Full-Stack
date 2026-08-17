import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { User } from "../authSlice";

/* ---------- Types ---------- */

export interface AdminUser {
  id: number;
  uuid: string;
  name: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  provider: string;
  isVerified: boolean;
  lastLogin: string | null;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  workspaceCount?: number;
  teamCount?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  recentUsers: AdminUser[];
}

export interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStatsData;
}

export interface TeamMemberInfo {
  id: string;
  userId?: number | null;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  createdAt?: string;
}

export interface TeamInfo {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  members: TeamMemberInfo[];
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  userId?: number | null;
  isOwner?: boolean;
  createdAt?: string;
  updatedAt?: string;
  teams: TeamInfo[];
}

export interface AdminUserDetail extends AdminUser {
  workspaces?: WorkspaceInfo[];
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: AdminUserDetail;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserRequest {
  name?: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserStatusRequest {
  userId: number;
  status: string;
}

export interface UpdateUserRoleRequest {
  userId: number;
  role: string;
}

export interface RoleInfo {
  name: string;
  label: string;
  description: string;
  level: number;
}

export interface RolesResponse {
  success: boolean;
  message: string;
  data: RoleInfo[];
}

/* ---------- API ---------- */

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5015/api/v1";
};

export const adminApi = createApi({
  reducerPath: "adminApi",
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
  tagTypes: ["AdminUsers", "AdminStats"],
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsResponse, void>({
      query: () => "/users/stats",
      providesTags: ["AdminStats"],
    }),
    getUsers: builder.query<AdminUsersResponse, GetUsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.search) searchParams.set("search", params.search);
        if (params.role) searchParams.set("role", params.role);
        if (params.status) searchParams.set("status", params.status);
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        return `/users?${searchParams.toString()}`;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.limit}-${queryArgs.search || ''}-${queryArgs.role || ''}-${queryArgs.status || ''}-${queryArgs.sortBy || ''}-${queryArgs.sortOrder || ''}`;
      },
      merge: (currentCache, newResponse, { arg }) => {
        if ((arg.page || 1) === 1) {
          Object.assign(currentCache, newResponse);
          return;
        }

        const existingIds = new Set(currentCache.data.map((user) => user.id));
        currentCache.data.push(
          ...newResponse.data.filter((user) => !existingIds.has(user.id)),
        );
        currentCache.success = newResponse.success;
        currentCache.message = newResponse.message;
        currentCache.meta = newResponse.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.limit !== previousArg?.limit ||
        currentArg?.search !== previousArg?.search ||
        currentArg?.role !== previousArg?.role ||
        currentArg?.status !== previousArg?.status ||
        currentArg?.sortBy !== previousArg?.sortBy ||
        currentArg?.sortOrder !== previousArg?.sortOrder,
      providesTags: ["AdminUsers"],
    }),
    getUserById: builder.query<SingleUserResponse, number>({
      query: (id) => `/users/${id}`,
    }),
    createUser: builder.mutation<SingleUserResponse, CreateUserRequest>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    updateUser: builder.mutation<SingleUserResponse, { id: number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    updateUserStatus: builder.mutation<SingleUserResponse, UpdateUserStatusRequest>({
      query: (body) => ({
        url: "/users/status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    updateUserRole: builder.mutation<SingleUserResponse, UpdateUserRoleRequest>({
      query: (body) => ({
        url: "/users/role",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    getRoles: builder.query<RolesResponse, void>({
      query: () => "/roles",
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetRolesQuery,
} = adminApi;
