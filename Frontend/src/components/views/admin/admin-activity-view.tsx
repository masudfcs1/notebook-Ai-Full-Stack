"use client";

import { motion } from "framer-motion";
import { Activity, Clock, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminActivityView() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          System activity and audit trail
        </p>
      </motion.div>

      {/* Coming soon placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/70 p-12 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-lr from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25">
              <Activity className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              Activity Log Coming Soon
            </h3>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              The activity log will provide a comprehensive audit trail of all
              system events, including user logins, role changes, account
              modifications, and security events.
            </p>
            <Badge className="mt-4 h-6 rounded-lg border border-sky-500/30 bg-sky-500/15 text-xs font-bold text-sky-400">
              <Clock className="mr-1 h-3 w-3" /> In Development
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Preview of what will be here */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Planned Features
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Login History",
                desc: "Track all user login attempts with IP, device, and browser info",
              },
              {
                title: "Role Changes",
                desc: "Log all role assignments and permission modifications",
              },
              {
                title: "Account Events",
                desc: "User creation, deletion, suspension, and reactivation events",
              },
              {
                title: "Security Alerts",
                desc: "Failed login attempts, suspicious activity, and rate limiting",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/60 bg-card/70 p-4"
              >
                <h4 className="text-xs font-semibold text-foreground mb-1">
                  {item.title}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
