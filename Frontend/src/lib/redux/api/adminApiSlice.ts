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

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
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
