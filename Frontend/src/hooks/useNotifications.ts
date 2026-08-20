"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setNotifications,
  pushNotification,
  markAllNotificationsRead as reduxMarkAllRead,
  markNotificationRead as reduxMarkRead,
  type NotificationItem,
} from "@/lib/redux/appSlice";
import { getSocket, joinAdminRoom, joinUserRoom } from "@/services/socketService";
import { apiService } from "@/services/apiService";

export function useNotifications() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const notifications = useAppSelector((s) => s.app.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // Fetch initial notifications from Backend API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await apiService.getNotifications({ limit: 20 });
      if (res.success && res.data && Array.isArray(res.data)) {
        const formatted: NotificationItem[] = res.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.message,
          time: formatTimeAgo(item.createdAt),
          read: item.read,
          type: getNotificationCategory(item.type),
        }));
        dispatch(setNotifications(formatted));
      }
    } catch (err) {
      console.warn("Failed to fetch initial notifications:", err);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Connect Socket.io and listen for live events
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    if (isAdmin) {
      joinAdminRoom();
    }

    if (user?.id) {
      joinUserRoom(user.id);
    }

    const handleNewNotification = (data: any) => {
      const notifItem: NotificationItem = {
        id: data.id || `n${Date.now()}`,
        title: data.title || "New Notification",
        description: data.message || data.description || "",
        time: "just now",
        read: data.read ?? false,
        type: getNotificationCategory(data.type),
      };

      dispatch(pushNotification(notifItem));

      // Show toast popup for live event
      toast(notifItem.title, {
        description: notifItem.description,
        duration: 5000,
      });
    };

    socket.on("notification", handleNewNotification);
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("new_notification", handleNewNotification);
    };
  }, [isAuthenticated, isAdmin, user?.id, dispatch]);

  // Mark all as read handler
  const markAllAsRead = async () => {
    dispatch(reduxMarkAllRead());
    try {
      await apiService.markAllNotificationsRead();
    } catch (err) {
      console.warn("Failed to sync mark all read with backend:", err);
    }
  };

  // Mark single notification as read handler
  const markAsRead = async (id: string) => {
    dispatch(reduxMarkRead(id));
    try {
      await apiService.markNotificationRead(id);
    } catch (err) {
      console.warn("Failed to sync mark read with backend:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    refreshNotifications: fetchNotifications,
  };
}

function getNotificationCategory(type?: string): "info" | "success" | "warning" {
  switch (type) {
    case "USER_CREATED":
    case "WORKSPACE_CREATED":
    case "TEAM_CREATED":
      return "success";
    case "WARNING":
      return "warning";
    default:
      return "info";
  }
}

function formatTimeAgo(dateString?: string | Date): string {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}
