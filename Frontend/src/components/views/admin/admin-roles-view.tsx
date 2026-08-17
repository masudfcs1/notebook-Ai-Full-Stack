"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowDown, Users } from "lucide-react";
import { useGetAdminStatsQuery } from "@/lib/redux/api/adminApiSlice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_ROLES } from "@/constants/admin";

export function AdminRolesView() {
  const { data: statsResponse, isLoading } = useGetAdminStatsQuery();
  const stats = statsResponse?.data;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Roles & Permissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Role hierarchy and access level overview
        </p>
      </motion.div>

      {/* Role hierarchy visual */}
      <div className="space-y-3">
        {ADMIN_ROLES.map((role, i) => {
          const userCount = stats?.usersByRole[role.name] || 0;
          return (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur-sm transition-all hover:bg-muted/60">
                <div className="flex items-stretch">
                  {/* Level bar */}
                  <div className={`w-1.5 bg-gradient-to-b ${role.color}`} />

                  <div className="flex flex-1 items-center gap-4 p-5">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-lr ${role.color} text-white shadow-lg`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-foreground">
                          {role.label}
                        </h3>
                        <Badge
                          className={`h-5 rounded-md border text-[9px] font-bold ${role.badge}`}
                        >
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    {/* User count */}
                    <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
                      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {isLoading ? (
                          <Skeleton className="h-5 w-6 bg-muted" />
                        ) : (
                          <span className="text-sm font-bold text-foreground">
                            {userCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        users
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative gradient */}
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-lr ${role.color} opacity-[0.04] blur-2xl`}
                />
              </Card>

              {/* Arrow connector */}
              {i < ADMIN_ROLES.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/70" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Permission matrix info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Permission Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Permission
                  </th>
                  {ADMIN_ROLES.map((r) => (
                    <th key={r.name} className="px-3 py-2 text-center">
                      <Badge
                        className={`h-5 rounded-md border text-[8px] font-bold ${r.badge}`}
                      >
                        {r.label}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    perm: "Manage all users",
                    roles: [true, true, false, false, false],
                  },
                  {
                    perm: "Assign roles",
                    roles: [true, false, false, false, false],
                  },
                  {
                    perm: "View user list",
                    roles: [true, true, true, false, false],
                  },
                  {
                    perm: "Create users",
                    roles: [true, true, false, false, false],
                  },
                  {
                    perm: "Delete users",
                    roles: [true, false, false, false, false],
                  },
                  {
                    perm: "View activity log",
                    roles: [true, true, true, false, false],
                  },
                  {
                    perm: "Manage workspaces",
                    roles: [true, true, true, true, false],
                  },
                  {
                    perm: "Create notes",
                    roles: [true, true, true, true, true],
                  },
                  {
                    perm: "View own data",
                    roles: [true, true, true, true, true],
                  },
                ].map((row) => (
                  <tr
                    key={row.perm}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-foreground/80 font-medium">
                      {row.perm}
                    </td>
                    {row.roles.map((allowed, j) => (
                      <td key={j} className="px-3 py-2.5 text-center">
                        {allowed ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground/70 text-[10px]">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
