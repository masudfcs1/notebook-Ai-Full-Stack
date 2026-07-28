/**
 * NoteFlow AI - Enterprise API Client Service
 * @file apiService.ts
 */

import type { ApiResponse } from "@/types"

class ApiService {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  /**
   * Generic HTTP fetch wrapper with error handling and response formatting
   */
  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred"
      return {
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Health check / system status
   */
  async checkHealth(): Promise<ApiResponse<{ status: string; uptime: number }>> {
    return this.request<{ status: string; uptime: number }>("/stats")
  }
}

export const apiService = new ApiService()
