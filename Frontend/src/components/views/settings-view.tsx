'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Bell, Palette, Shield, Sparkles, Moon, Sun, Check, Globe,
  Mail, Lock, Smartphone, Zap, Download, Trash2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAppDispatch } from "@/lib/redux/hooks"
import { pushNotification } from "@/lib/redux/appSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const [name, setName] = useState("Arjun Kapoor")
  const [email, setEmail] = useState("arjun@noteflow.ai")
  const [role, setRole] = useState("Product Manager")
  const [timezone, setTimezone] = useState("Asia/Dhaka")
  const [prefs, setPrefs] = useState({
    emailSummaries: true,
    weeklyDigest: true,
    taskReminders: true,
    aiSuggestions: true,
    autoSummarize: false,
    compactMode: false,
  })

  function toggle(key: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  function save() {
    toast.success("Settings saved")
    dispatch(pushNotification({
      title: "Settings updated",
      description: "Your preferences have been saved.",
      type: "info",
    }))
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="profile" className="gap-1.5 rounded-lg text-sm"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 rounded-lg text-sm"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 rounded-lg text-sm"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 rounded-lg text-sm"><Sparkles className="h-4 w-4" /> AI</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 rounded-lg text-sm"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-5 space-y-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <div className="mb-5 flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
                  AK
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Badge variant="secondary" className="mt-1 gap-1 bg-indigo-500/10 text-[10px] text-indigo-600 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" /> Pro Plan
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="ml-auto gap-1.5 rounded-xl">
                <Download className="h-3.5 w-3.5" /> Change photo
              </Button>
            </div>
            <Separator className="mb-5" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" icon={User}>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-muted/30" />
              </Field>
              <Field label="Email" icon={Mail}>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-muted/30" />
              </Field>
              <Field label="Role / Title" icon={Shield}>
                <Input value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl bg-muted/30" />
              </Field>
              <Field label="Timezone" icon={Globe}>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="rounded-xl bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={save} className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md">
                <Check className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-5 space-y-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-1 text-base font-semibold">Theme</h3>
            <p className="mb-5 text-sm text-muted-foreground">Choose how NoteFlow looks to you.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                { key: "light", label: "Light", icon: Sun, bg: "bg-white", fg: "text-slate-900" },
                { key: "dark", label: "Dark", icon: Moon, bg: "bg-slate-900", fg: "text-white" },
                { key: "system", label: "System", icon: Smartphone, bg: "bg-gradient-to-br from-white to-slate-900", fg: "text-slate-700" },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    theme === opt.key ? "border-indigo-500 bg-indigo-500/5" : "border-border/50 hover:border-border"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shadow-sm", opt.bg, opt.fg)}>
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  {theme === opt.key && (
                    <motion.div
                      layoutId="theme-active"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-4 text-base font-semibold">Accent color</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Indigo", grad: "from-indigo-500 to-violet-500" },
                { name: "Emerald", grad: "from-emerald-500 to-teal-500" },
                { name: "Rose", grad: "from-rose-500 to-pink-500" },
                { name: "Amber", grad: "from-amber-500 to-orange-500" },
                { name: "Sky", grad: "from-sky-500 to-cyan-500" },
              ].map((c, i) => (
                <button
                  key={c.name}
                  className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-transform hover:scale-105",
                    c.grad,
                    i === 0 && "ring-2 ring-offset-2 ring-offset-background ring-indigo-500"
                  )}
                  aria-label={c.name}
                >
                  {i === 0 && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <ToggleRow
              icon={Zap}
              title="Compact mode"
              desc="Reduce padding and font sizes for denser layouts"
              checked={prefs.compactMode}
              onChange={() => toggle("compactMode")}
            />
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-5 space-y-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-1 text-base font-semibold">Email notifications</h3>
            <p className="mb-4 text-sm text-muted-foreground">Control what we send to your inbox.</p>
            <div className="space-y-1">
              <ToggleRow icon={Sparkles} title="AI summaries" desc="Get notified when a summary is ready" checked={prefs.emailSummaries} onChange={() => toggle("emailSummaries")} />
              <Separator className="my-1" />
              <ToggleRow icon={Mail} title="Weekly digest" desc="A weekly roundup of your meetings" checked={prefs.weeklyDigest} onChange={() => toggle("weeklyDigest")} />
              <Separator className="my-1" />
              <ToggleRow icon={Bell} title="Task reminders" desc="Reminders for upcoming due dates" checked={prefs.taskReminders} onChange={() => toggle("taskReminders")} />
            </div>
          </Card>
        </TabsContent>

        {/* AI */}
        <TabsContent value="ai" className="mt-5 space-y-5">
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5 backdrop-blur-sm md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">AI Preferences</h3>
                <p className="text-sm text-muted-foreground">Fine-tune how the AI assists you.</p>
              </div>
            </div>
            <div className="space-y-1">
              <ToggleRow icon={Sparkles} title="Smart suggestions" desc="Show AI-powered suggestions on summaries" checked={prefs.aiSuggestions} onChange={() => toggle("aiSuggestions")} />
              <Separator className="my-1" />
              <ToggleRow icon={Zap} title="Auto-summarize uploads" desc="Automatically run AI when files are uploaded" checked={prefs.autoSummarize} onChange={() => toggle("autoSummarize")} />
            </div>
          </Card>

          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-3 text-base font-semibold">Usage this month</h3>
            <div className="space-y-3">
              <UsageBar label="AI summaries" used={96} total={200} gradient="from-indigo-500 to-violet-500" />
              <UsageBar label="Storage" used={4.3} total={10} unit="GB" gradient="from-emerald-500 to-teal-500" />
              <UsageBar label="Action items" used={243} total={500} gradient="from-amber-500 to-orange-500" />
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-5 space-y-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-1 text-base font-semibold">Password</h3>
            <p className="mb-4 text-sm text-muted-foreground">Update your password regularly to keep your account secure.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Current password" icon={Lock}>
                <Input type="password" placeholder="••••••••" className="rounded-xl bg-muted/30" />
              </Field>
              <div className="hidden md:block" />
              <Field label="New password" icon={Lock}>
                <Input type="password" placeholder="••••••••" className="rounded-xl bg-muted/30" />
              </Field>
              <Field label="Confirm password" icon={Lock}>
                <Input type="password" placeholder="••••••••" className="rounded-xl bg-muted/30" />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md">
                <Lock className="h-4 w-4" /> Update password
              </Button>
            </div>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-1 text-base font-semibold text-rose-600 dark:text-rose-400">Danger zone</h3>
            <p className="mb-4 text-sm text-muted-foreground">Irreversible account actions.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="gap-2 rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10">
                <Download className="h-4 w-4" /> Export all data
              </Button>
              <Button variant="outline" className="gap-2 rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10">
                <Trash2 className="h-4 w-4" /> Delete account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </Label>
      {children}
    </div>
  )
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange }: {
  icon: typeof User; title: string; desc: string; checked: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function UsageBar({ label, used, total, unit, gradient }: {
  label: string; used: number; total: number; unit?: string; gradient: string
}) {
  const pct = Math.min(100, (used / total) * 100)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{used}{unit ? unit : ""} / {total}{unit ? unit : ""}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
        />
      </div>
    </div>
  )
}
