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
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-sm text-slate-400">
          System configuration and admin profile
        </p>
      </motion.div>

      {/* Admin Profile */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">Admin Profile</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-slate-300">Display Name</Label>
              <Input
                className="mt-1 border-white/5 bg-white/[0.03] text-white"
                defaultValue={displayName}
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs text-slate-300">Email</Label>
              <Input
                className="mt-1 border-white/5 bg-white/[0.03] text-white"
                defaultValue={displayEmail}
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs text-slate-300">Role</Label>
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
        <Card className="border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">System Configuration</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">User Registration</p>
                <p className="text-[10px] text-slate-500">Allow new users to register on the platform</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">Email Verification Required</p>
                <p className="text-[10px] text-slate-500">Require email verification before account activation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">Auto Approve Users</p>
                <p className="text-[10px] text-slate-500">Automatically set new users to ACTIVE status</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">Maintenance Mode</p>
                <p className="text-[10px] text-slate-500">Restrict access to admin users only</p>
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
        <Card className="border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">Admin Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">New User Alerts</p>
                <p className="text-[10px] text-slate-500">Get notified when new users register</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-xs font-semibold text-white">Security Alerts</p>
                <p className="text-[10px] text-slate-500">Failed login attempts and suspicious activity</p>
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
