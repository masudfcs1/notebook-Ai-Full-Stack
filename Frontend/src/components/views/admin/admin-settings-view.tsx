'use client'

import { motion } from "framer-motion"
import { Settings, Shield, Globe, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAppSelector } from "@/lib/redux/hooks"
import { getUserDisplayName } from "@/lib/utils"

export function AdminSettingsView() {
  const user = useAppSelector((s) => s.auth.user)
  const displayName = getUserDisplayName(user, "Admin")
  const displayEmail = user?.email || ""

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">
          System configuration and admin profile
        </p>
      </motion.div>

      {/* Admin Profile */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-foreground">Admin Profile</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-foreground/80">Display Name</Label>
              <Input
                className="mt-1 border-border/60 bg-muted/40 text-foreground"
                defaultValue={displayName}
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs text-foreground/80">Email</Label>
              <Input
                className="mt-1 border-border/60 bg-muted/40 text-foreground"
                defaultValue={displayEmail}
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs text-foreground/80">Role</Label>
              <div className="mt-1">
                <Badge className="h-6 rounded-lg border border-rose-500/30 bg-rose-500/15 text-xs font-bold text-rose-400">
                  {user?.role || "ADMIN"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-foreground">System Configuration</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">User Registration</p>
                <p className="text-[10px] text-muted-foreground">Allow new users to register on the platform</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Email Verification Required</p>
                <p className="text-[10px] text-muted-foreground">Require email verification before account activation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Auto Approve Users</p>
                <p className="text-[10px] text-muted-foreground">Automatically set new users to ACTIVE status</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Maintenance Mode</p>
                <p className="text-[10px] text-muted-foreground">Restrict access to admin users only</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-foreground">Admin Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">New User Alerts</p>
                <p className="text-[10px] text-muted-foreground">Get notified when new users register</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Security Alerts</p>
                <p className="text-[10px] text-muted-foreground">Failed login attempts and suspicious activity</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <Button className="mt-5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 font-semibold text-white hover:opacity-90 cursor-pointer">
            Save Settings
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}
