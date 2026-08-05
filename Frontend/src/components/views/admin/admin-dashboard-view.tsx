"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setView } from "@/lib/redux/appSlice";
import { useGetAdminStatsQuery } from "@/lib/redux/api/adminApiSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleConfig, getStatusConfig } from "@/constants/admin";

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    gradient: "from-rose-500 to-amber-500",
    glow: "shadow-rose-500/25",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: UserCheck,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/25",
  },
  {
    key: "pendingUsers",
    label: "Pending Approval",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
  },
  {
    key: "suspendedUsers",
    label: "Suspended",
    icon: UserX,
    gradient: "from-rose-600 to-red-600",
    glow: "shadow-rose-600/25",
  },
] as const;

export function AdminDashboardView() {
  const dispatch = useAppDispatch();
  const { data: statsResponse, isLoading } = useGetAdminStatsQuery();
  const stats = statsResponse?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            System overview and user analytics
          </p>
        </div>
        <Button
          onClick={() => dispatch(setView("admin-users"))}
          className="gap-2 rounded-xl  from-rose-500 to-amber-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Manage Users
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key] : 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="relative overflow-hidden border-border/60 bg-card/70 p-5 backdrop-blur-sm transition-all hover:bg-muted/60 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.glow}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-[10px] font-bold">+12%</span>
                  </div>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-muted" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">
                      {value}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {card.label}
                  </p>
                </div>
                {/* Decorative glow */}
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.06] blur-2xl`}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Users by Role
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => dispatch(setView("admin-roles"))}
              >
                View roles <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-muted" />
                  ))
                : ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"].map(
                    (role) => {
                      const config = getRoleConfig(role);
                      const count = stats?.usersByRole[role] || 0;
                      const total = stats?.totalUsers || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={role} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${config.dot}`}
                              />
                              <span className="text-xs font-medium text-foreground/80">
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {count}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                ({pct}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                delay: 0.5,
                                duration: 0.8,
                                ease: "easeOut",
                              }}
                              className={`h-full rounded-full  ${config.color}`}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-3"
        >
          <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Registrations
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => dispatch(setView("admin-users"))}
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full bg-muted" />
                ))
              ) : stats?.recentUsers?.length ? (
                stats.recentUsers.slice(0, 6).map((u, i) => {
                  const roleConfig = getRoleConfig(u.role);
                  const statusConfig = getStatusConfig(u.status);
                  const userInitials = (u.name || u.email)
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-3 transition-colors hover:bg-muted/60"
                    >
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback
                          className={`bg-gradient-to-br ${roleConfig.color} text-[10px] font-bold text-white`}
                        >
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {u.name || u.username || "Unnamed"}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                      <Badge
                        className={`h-5 rounded-md border text-[9px] font-bold ${roleConfig.badge}`}
                      >
                        {roleConfig.label}
                      </Badge>
                      <Badge
                        className={`h-5 rounded-md border text-[9px] font-bold ${statusConfig.color}`}
                      >
                        <span
                          className={`mr-1 h-1.5 w-1.5 rounded-full ${statusConfig.dot} inline-block`}
                        />
                        {statusConfig.label}
                      </Badge>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Create New User",
                desc: "Add a user to the platform",
                view: "admin-users" as const,
                gradient: "from-rose-500 to-amber-500",
              },
              {
                label: "Manage Roles",
                desc: "View role hierarchy & permissions",
                view: "admin-roles" as const,
                gradient: "from-violet-500 to-indigo-500",
              },
              {
                label: "Activity Log",
                desc: "Review system audit trail",
                view: "admin-activity" as const,
                gradient: "from-sky-500 to-cyan-500",
              },
            ].map((action, i) => (
              <button
                key={action.label}
                onClick={() => dispatch(setView(action.view))}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-4 text-left transition-all hover:bg-muted/60 hover:-translate-y-0.5 cursor-pointer"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
