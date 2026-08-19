import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { User } from "../authSlice";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  username?: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5015/api/v1";
};

export interface UpdateProfileRequest {
  name?: string;
  username?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth?.token || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<ApiResponse<User>, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
    }),
    updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileRequest>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
    }),
    changePassword: builder.mutation<ApiResponse<void>, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    updateProfileImage: builder.mutation<ApiResponse<User>, FormData>({
      query: (formData) => ({
        url: "/auth/profile-image",
        method: "PATCH",
        body: formData,
      }),
    }),
    deleteProfileImage: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/auth/profile-image",
        method: "DELETE",
      }),
    }),
    logoutUser: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateProfileImageMutation,
  useDeleteProfileImageMutation,
  useLogoutUserMutation,
} = authApi;

