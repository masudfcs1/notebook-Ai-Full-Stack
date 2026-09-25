"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  Shield,
  Sparkles,
  Moon,
  Sun,
  Check,
  Globe,
  Mail,
  Lock,
  Smartphone,
  Zap,
  Download,
  Trash2,
  Camera,
  Building2,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Layers,
  KeyRound,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Cpu,
  Brain,
  MessageSquare,
  FileText,
  Clock,
  Briefcase,
  Phone,
  AtSign,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  SlidersVertical,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { pushNotification } from "@/lib/redux/appSlice";
import { setUser } from "@/lib/redux/authSlice";
import { setActiveWorkspace } from "@/lib/redux/dataSlice";
import {
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useDeleteProfileImageMutation,
  useChangePasswordMutation,
} from "@/lib/redux/api/authApiSlice";
import { WorkspaceModal } from "@/components/modals/workspace-modal";
import { DeleteWorkspaceModal } from "@/components/modals/delete-workspace-modal";
import { TeamModal } from "@/components/modals/team-modal";
import { DeleteTeamModal } from "@/components/modals/delete-team-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  cn,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
} from "@/lib/utils";

// Accent palettes
const ACCENT_COLORS = [
  {
    id: "indigo",
    name: "Indigo / Violet",
    gradient: "from-indigo-500 to-violet-600",
    glow: "rgba(99, 102, 241, 0.4)",
    activeClass: "ring-indigo-500",
  },
  {
    id: "emerald",
    name: "Emerald / Mint",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16, 185, 129, 0.4)",
    activeClass: "ring-emerald-500",
  },
  {
    id: "rose",
    name: "Rose / Ruby",
    gradient: "from-rose-500 to-pink-600",
    glow: "rgba(244, 63, 94, 0.4)",
    activeClass: "ring-rose-500",
  },
  {
    id: "amber",
    name: "Amber / Honey",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245, 158, 11, 0.4)",
    activeClass: "ring-amber-500",
  },
  {
    id: "cyan",
    name: "Cyan / Sky",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6, 182, 212, 0.4)",
    activeClass: "ring-cyan-500",
  },
  {
    id: "violet",
    name: "Amethyst / Purple",
    gradient: "from-violet-500 to-fuchsia-600",
    glow: "rgba(139, 92, 246, 0.4)",
    activeClass: "ring-violet-500",
  },
];

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const notes = useAppSelector((s) => s.data.notes);
  const summaries = useAppSelector((s) => s.data.summaries);
  const tasks = useAppSelector((s) => s.data.tasks);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);

  // Modals state
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [wsModalMode, setWsModalMode] = useState<"create" | "edit">("create");
  const [wsToEdit, setWsToEdit] = useState<any>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<any>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [teamToEdit, setTeamToEdit] = useState<any>(null);
  const [targetWsIdForTeam, setTargetWsIdForTeam] = useState<string>("");

  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateProfileImage, { isLoading: isUploadingImage }] =
    useUpdateProfileImageMutation();
  const [deleteProfileImage, { isLoading: isDeletingImage }] =
    useDeleteProfileImageMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Member");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [bio, setBio] = useState(
    "AI Enthusiast & Product Specialist. Leading collaborative meeting intelligence.",
  );

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Accent & theme
  const [selectedAccent, setSelectedAccent] = useState("indigo");
  const [activeTab, setActiveTab] = useState("profile");
  const [copiedWsSlug, setCopiedWsSlug] = useState<string | null>(null);

  // AI settings
  const [aiSummaryStyle, setAiSummaryStyle] = useState<
    "executive" | "action" | "comprehensive"
  >("action");
  const [aiCreativity, setAiCreativity] = useState([0.7]);
  const [aiLanguage, setAiLanguage] = useState("auto");
  const [workspaceSearch, setWorkspaceSearch] = useState("");

  // Appearance & behavioral preferences
  const [prefs, setPrefs] = useState({
    compactMode: false,
    ambientGlow: true,
    smoothMotion: true,
    highContrast: false,
    soundEffects: false,
  });

  // Notification channels state
  const [notifChannels, setNotifChannels] = useState({
    aiSummariesEmail: true,
    aiSummariesPush: true,
    weeklyDigestEmail: true,
    weeklyDigestPush: false,
    taskRemindersEmail: true,
    taskRemindersPush: true,
    workspaceActivityEmail: false,
    workspaceActivityPush: true,
    securityAlertsEmail: true,
    securityAlertsPush: true,
  });

  // AI Feature toggles
  const [aiToggles, setAiToggles] = useState({
    autoSummarize: true,
    extractActionItems: true,
    sentimentAnalysis: true,
    smartTags: true,
    speakerAttribution: true,
  });

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.username) setUsername(user.username);
      if (user.email) setEmail(user.email);
      if (user.role) setRole(user.role);
    }
  }, [user]);

  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "User");
  const initials = getUserInitials(user?.name, user?.email);

  // Toggle helper
  function togglePref(key: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleNotif(key: keyof typeof notifChannels) {
    setNotifChannels((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleAi(key: keyof typeof aiToggles) {
    setAiToggles((p) => ({ ...p, [key]: !p[key] }));
  }

  // Calculate password strength
  function getPasswordStrength(pwd: string) {
    if (!pwd) return { score: 0, text: "Not set", color: "bg-muted" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, text: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, text: "Good", color: "bg-sky-500" };
    return { score: 4, text: "Excellent", color: "bg-emerald-500" };
  }

  const pwdStrength = getPasswordStrength(newPassword);

  // Save profile changes
  async function handleSaveProfile() {
    try {
      const res = await updateProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
      }).unwrap();

      if (res.success && res.data) {
        dispatch(setUser(res.data));
        toast.success("Profile saved successfully!", {
          description: "Your account details and preferences are up to date.",
        });
        dispatch(
          pushNotification({
            title: "Settings updated",
            description: "Your personal profile details were saved.",
            type: "success",
          }),
        );
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.error || "Error saving profile settings";
      toast.error(msg);
    }
  }

  // Upload Avatar
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const loadingToast = toast.loading("Uploading high-resolution avatar...");
    try {
      const res = await updateProfileImage(formData).unwrap();
      if (res.success && res.data) {
        dispatch(setUser(res.data));
        toast.success("Profile photo updated!", { id: loadingToast });
      } else {
        toast.error(res.message || "Upload failed", { id: loadingToast });
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Failed to upload image";
      toast.error(msg, { id: loadingToast });
    }
  }

  // Remove Avatar
  async function handleRemovePhoto() {
    const loadingToast = toast.loading("Removing profile photo...");
    try {
      const res = await deleteProfileImage().unwrap();
      if (res.success) {
        if (user) {
          dispatch(setUser({ ...user, avatar: null }));
        }
        toast.success("Profile photo removed", { id: loadingToast });
      } else {
        toast.error(res.message || "Failed to remove photo", {
          id: loadingToast,
        });
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Error removing photo";
      toast.error(msg, { id: loadingToast });
    }
  }

  // Change Password
  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error(
        "Please fill in both new password and confirm password fields",
      );
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error("New password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error("New password must contain at least one lowercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error("New password must contain at least one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const res = await changePasswordApi({
        newPassword,
        confirmPassword,
      }).unwrap();
      if (res.success || res.message) {
        toast.success(res.message || "Password updated successfully!");
        dispatch(
          pushNotification({
            title: "Security updated",
            description: "Your login password was changed successfully.",
            type: "warning",
          }),
        );
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Failed to update password");
      }
    } catch (err: any) {
      const backendError =
        err?.data?.errors?.map((e: any) => e.message).join(", ") ||
        err?.data?.message ||
        err?.error ||
        "Failed to update password";
      toast.error(backendError);
    }
  }

  // Send Test Notification
  function handleSendTestNotification() {
    dispatch(
      pushNotification({
        title: "Test Alert",
        description: "Your notification pipeline is working flawlessly!",
        type: "info",
      }),
    );
    toast.info("Test Notification Delivered", {
      description: "Check your top-right notification bell to view the alert!",
    });
  }

  // Copy Workspace Slug
  function handleCopySlug(slug: string) {
    navigator.clipboard.writeText(slug);
    setCopiedWsSlug(slug);
    toast.success("Workspace slug copied to clipboard!");
    setTimeout(() => setCopiedWsSlug(null), 2000);
  }

  // Filtered workspaces
  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
      w.slug?.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
      w.description?.toLowerCase().includes(workspaceSearch.toLowerCase()),
  );

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-5xl space-y-7 pb-12">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* ===================== HERO HEADER BANNER ===================== */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-b from-card/90 via-card/70 to-card/50 p-6 shadow-xl backdrop-blur-2xl md:p-8"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          {/* Top Micro Navigation & Meta Chips */}
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  <Sparkles className="h-3 w-3" /> Preferences & Workspace Hub
                </Badge>
                {activeWs && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    <Building2 className="h-3 w-3 text-indigo-400" />
                    {activeWs.name}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Account & Platform{" "}
                <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Tailor your personal profile, intelligence models, display
                canvas, notification frequencies, and multi-team organization
                workspaces.
              </p>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-border/60 bg-muted/30 p-2 backdrop-blur-md md:self-auto">
              <div className="flex items-center gap-2 px-3 py-1">
                <Avatar className="h-9 w-9 border border-indigo-500/30 shadow-sm">
                  {avatarSrc && (
                    <AvatarImage src={avatarSrc} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-linear-to-tr from-indigo-500 to-violet-500 text-xs font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-xs font-semibold leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
                className="gap-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 hover:shadow-indigo-500/25 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                {isUpdatingProfile ? "Saving..." : "Save All"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ===================== MODERN TABS NAVIGATION ===================== */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="scrollbar-none overflow-x-auto rounded-2xl border border-border/50 bg-card/60 p-1.5 shadow-sm backdrop-blur-xl">
            <TabsList className="flex h-auto w-full justify-start gap-1 bg-transparent p-0">
              <TabPill
                value="profile"
                icon={User}
                label="Profile & Identity"
                active={activeTab === "profile"}
              />
              <TabPill
                value="appearance"
                icon={Palette}
                label="Appearance & Canvas"
                active={activeTab === "appearance"}
              />
              <TabPill
                value="notifications"
                icon={Bell}
                label="Alerts & Channels"
                active={activeTab === "notifications"}
              />
              <TabPill
                value="ai"
                icon={Sparkles}
                label="AI Intelligence"
                badge="Smart"
                active={activeTab === "ai"}
              />
              <TabPill
                value="workspaces"
                icon={Building2}
                label="Workspaces & Teams"
                count={workspaces.length}
                active={activeTab === "workspaces"}
              />
              <TabPill
                value="security"
                icon={ShieldCheck}
                label="Security & Access"
                active={activeTab === "security"}
              />
            </TabsList>
          </div>

          {/* =================================================================== */}
          {/* TAB 1: PROFILE & IDENTITY                                           */}
          {/* =================================================================== */}
          <TabsContent value="profile" className="space-y-6 outline-none">
            {/* Identity Showcase Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="overflow-hidden border-border/60 bg-card/70 shadow-lg backdrop-blur-xl">
                {/* Visual Cover Banner with geometric glow */}
                <div className="relative h-36 w-full overflow-hidden bg-linear-to-r from-indigo-600 via-violet-600 to-purple-700 sm:h-44">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
                  <div className="landing-grid absolute inset-0 opacity-20" />
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <Badge className="border-white/20 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      Verified Member
                    </Badge>
                  </div>
                </div>

                {/* Overlapping Avatar & Primary Meta */}
                <div className="relative px-6 pb-6 pt-0 sm:px-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="relative -mt-16 sm:-mt-20 flex items-end gap-4">
                      {/* Avatar with Glow & Hover Overlay */}
                      <div className="group relative">
                        <Avatar className="h-24 w-24 border-4 border-card shadow-2xl ring-2 ring-indigo-500/40 sm:h-28 sm:w-28">
                          {avatarSrc && (
                            <AvatarImage src={avatarSrc} alt={displayName} />
                          )}
                          <AvatarFallback className="bg-linear-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Online Indicator */}
                        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />

                        {/* Quick Camera Hover Overlay */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          title="Change avatar photo"
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                        >
                          <Camera className="h-6 w-6" />
                          <span className="text-[10px] font-medium">Edit</span>
                        </button>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                            {displayName}
                          </h2>
                          <Badge
                            variant="secondary"
                            className="bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                          >
                            {role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {email}
                        </p>
                      </div>
                    </div>

                    {/* Photo Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5 rounded-xl border-border/80 bg-background/60 shadow-xs hover:border-indigo-500/40 cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-indigo-500" />
                        {isUploadingImage ? "Uploading..." : "Upload New Photo"}
                      </Button>
                      {avatarSrc && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isDeletingImage}
                          onClick={handleRemovePhoto}
                          className="h-9 gap-1 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Recommended: Square JPG, PNG, or WebP. Max 5MB file size.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Profile Information Inputs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold sm:text-lg">
                      Personal Information
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Update your identity and professional profile across all
                      workspaces
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-600 dark:text-indigo-400"
                  >
                    Public in Teams
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Full Name" icon={User} required>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Masud Rana"
                      className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-indigo-500"
                    />
                  </Field>

                  <Field label="Username / Handle" icon={AtSign}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                        @
                      </span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="rounded-xl border-border/60 bg-muted/20 pl-7 font-mono text-sm focus-visible:ring-indigo-500"
                      />
                    </div>
                  </Field>

                  <Field
                    label="Email Address"
                    icon={Mail}
                    badge={
                      <Badge className="bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
                        Primary Login
                      </Badge>
                    }
                  >
                    <div className="relative">
                      <Input
                        value={email}
                        disabled
                        readOnly
                        className="rounded-xl border-border/40 bg-muted/40 pr-9 opacity-80 cursor-not-allowed"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Email is bound to your account authorization and cannot be
                      modified here.
                    </span>
                  </Field>

                  <Field label="Role / Title" icon={Briefcase}>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Principal AI Architect"
                      className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-indigo-500"
                    />
                  </Field>

                  <Field label="Phone Number" icon={Phone}>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-indigo-500"
                    />
                  </Field>

                  <Field label="Timezone & Local Time" icon={Globe}>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="rounded-xl border-border/60 bg-muted/20 focus:ring-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">
                          Asia/Dhaka (GMT+6) • Bangladesh Standard
                        </SelectItem>
                        <SelectItem value="Asia/Kolkata">
                          Asia/Kolkata (GMT+5:30) • India Standard
                        </SelectItem>
                        <SelectItem value="Asia/Dubai">
                          Asia/Dubai (GMT+4) • Gulf Standard
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London (GMT+0) • Western Europe
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (GMT-5) • Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          America/Los_Angeles (GMT-8) • Pacific Time
                        </SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Short Bio & Meeting Notes" icon={Edit3}>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Tell your team a little bit about what you work on..."
                        className="w-full resize-none rounded-xl border border-border/60 bg-muted/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-5 sm:flex-row">
                  <p className="text-xs text-muted-foreground">
                    Changes reflect immediately in notes, action items, and team
                    dashboards.
                  </p>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                    className="w-full sm:w-auto gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 px-6 font-semibold text-white shadow-md hover:opacity-95 hover:shadow-indigo-500/25 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    {isUpdatingProfile ? "Saving changes..." : "Save Profile"}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Quick Productivity Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatPill
                icon={Building2}
                label="Assigned Workspaces"
                value={`${workspaces.length} Spaces`}
                subtext="Multi-tenant enabled"
                gradient="from-indigo-500 to-violet-500"
              />
              <StatPill
                icon={FileText}
                label="Meeting Notes Stored"
                value={`${notes.length} Notes`}
                subtext="Encrypted in vault"
                gradient="from-cyan-500 to-blue-500"
              />
              <StatPill
                icon={Sparkles}
                label="Summaries Synthesized"
                value={`${summaries.length} Summaries`}
                subtext="100% neural accuracy"
                gradient="from-fuchsia-500 to-pink-500"
              />
            </div>
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 2: APPEARANCE & CANVAS                                          */}
          {/* =================================================================== */}
          <TabsContent value="appearance" className="space-y-6 outline-none">
            {/* Interactive Theme Cards with Miniature Previews */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="mb-6">
                  <h3 className="text-base font-bold sm:text-lg">
                    Interface Theme
                  </h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Select your visual aesthetic. The theme adapts the meeting
                    editor, sidebars, and transcription displays.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Light Mode Preview */}
                  <ThemePreviewCard
                    active={theme === "light"}
                    onClick={() => setTheme("light")}
                    title="Light Canvas"
                    desc="Crisp daytime high-clarity view"
                    badge="Daylight"
                  >
                    <div className="flex h-28 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-inner">
                      <div className="mb-1 flex items-center justify-between border-b border-slate-100 pb-1">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        </div>
                        <span className="h-1.5 w-8 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex flex-1 gap-1.5">
                        <div className="w-1/4 rounded bg-slate-100 p-1 space-y-1">
                          <div className="h-1.5 w-3/4 rounded bg-indigo-400" />
                          <div className="h-1.5 w-1/2 rounded bg-slate-200" />
                          <div className="h-1.5 w-2/3 rounded bg-slate-200" />
                        </div>
                        <div className="flex-1 rounded bg-slate-50 p-1.5 space-y-1.5">
                          <div className="h-2 w-3/4 rounded bg-slate-300" />
                          <div className="h-1.5 w-full rounded bg-slate-200" />
                          <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                          <div className="mt-1 flex gap-1">
                            <span className="h-3 w-8 rounded bg-indigo-100" />
                            <span className="h-3 w-8 rounded bg-emerald-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ThemePreviewCard>

                  {/* Dark Mode Preview */}
                  <ThemePreviewCard
                    active={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    title="Obsidian Dark"
                    desc="Sleek deep contrast, easy on the eyes"
                    badge="Recommended"
                  >
                    <div className="flex h-28 w-full flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#090d18] p-2 shadow-inner">
                      <div className="mb-1 flex items-center justify-between border-b border-slate-800 pb-1">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/60" />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500/60" />
                          <span className="h-1.5 w-1.5 rounded-full bg-pink-500/60" />
                        </div>
                        <span className="h-1.5 w-8 rounded-full bg-slate-800" />
                      </div>
                      <div className="flex flex-1 gap-1.5">
                        <div className="w-1/4 rounded bg-slate-900 p-1 space-y-1">
                          <div className="h-1.5 w-3/4 rounded bg-indigo-400" />
                          <div className="h-1.5 w-1/2 rounded bg-slate-800" />
                          <div className="h-1.5 w-2/3 rounded bg-slate-800" />
                        </div>
                        <div className="flex-1 rounded bg-slate-900/60 p-1.5 space-y-1.5">
                          <div className="h-2 w-3/4 rounded bg-slate-700" />
                          <div className="h-1.5 w-full rounded bg-slate-800" />
                          <div className="h-1.5 w-4/5 rounded bg-slate-800" />
                          <div className="mt-1 flex gap-1">
                            <span className="h-3 w-8 rounded bg-indigo-500/20" />
                            <span className="h-3 w-8 rounded bg-violet-500/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ThemePreviewCard>

                  {/* System Preview */}
                  <ThemePreviewCard
                    active={theme === "system"}
                    onClick={() => setTheme("system")}
                    title="System Auto"
                    desc="Dynamically matches your OS schedule"
                    badge="Dynamic"
                  >
                    <div className="relative flex h-28 w-full overflow-hidden rounded-lg border border-border/80 p-2 shadow-inner">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-white p-2">
                        <div className="h-1.5 w-10 rounded bg-slate-300" />
                        <div className="mt-2 h-1.5 w-full rounded bg-slate-200" />
                        <div className="mt-1 h-1.5 w-2/3 rounded bg-indigo-200" />
                      </div>
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-[#090d18] p-2">
                        <div className="h-1.5 w-10 rounded bg-slate-700" />
                        <div className="mt-2 h-1.5 w-full rounded bg-slate-800" />
                        <div className="mt-1 h-1.5 w-2/3 rounded bg-indigo-400" />
                      </div>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-indigo-500 shadow-lg" />
                    </div>
                  </ThemePreviewCard>
                </div>
              </Card>
            </motion.div>

            {/* Accent Color Palette */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="mb-5">
                  <h3 className="text-base font-bold sm:text-lg">
                    Accent Color Mood
                  </h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Customize your interactive highlights, focus rings, and
                    button gradients
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {ACCENT_COLORS.map((accent) => {
                    const isSelected = selectedAccent === accent.id;
                    return (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccent(accent.id);
                          toast.success(`Theme accent set to ${accent.name}`);
                        }}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all cursor-pointer",
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/30"
                            : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-tr shadow-md transition-transform group-hover:scale-105",
                            accent.gradient,
                          )}
                        >
                          {isSelected && (
                            <Check className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-center leading-tight">
                          {accent.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Display & Density Controls */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <h3 className="mb-1 text-base font-bold sm:text-lg">
                  Canvas & Ergonomics
                </h3>
                <p className="mb-6 text-xs text-muted-foreground sm:text-sm">
                  Fine-tune layout density, atmospheric backdrops, and motion
                  smoothness
                </p>

                <div className="space-y-4">
                  <SettingRow
                    icon={Zap}
                    title="Compact Mode"
                    desc="Condense padding and note cards for high-density information displays"
                    checked={prefs.compactMode}
                    onChange={() => togglePref("compactMode")}
                  />
                  <Separator />
                  <SettingRow
                    icon={Sparkles}
                    title="Atmospheric Backdrop Glows"
                    desc="Render soft ambient light orbs and depth gradients in the background"
                    checked={prefs.ambientGlow}
                    onChange={() => togglePref("ambientGlow")}
                  />
                  <Separator />
                  <SettingRow
                    icon={Sliders}
                    title="Smooth Fluid Motion"
                    desc="Enable Framer Motion page physics and spring micro-interactions"
                    checked={prefs.smoothMotion}
                    onChange={() => togglePref("smoothMotion")}
                  />
                  <Separator />
                  <SettingRow
                    icon={Shield}
                    title="High-Contrast Borders"
                    desc="Enhance visibility and border contrast for high accessibility"
                    checked={prefs.highContrast}
                    onChange={() => togglePref("highContrast")}
                  />
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 3: NOTIFICATIONS & ALERTS                                       */}
          {/* =================================================================== */}
          <TabsContent value="notifications" className="space-y-6 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-bold sm:text-lg">
                      Notification Preferences
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Choose which events reach your inbox and in-app bell
                      notifications
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestNotification}
                    className="gap-2 rounded-xl border-indigo-500/40 bg-indigo-500/5 text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 cursor-pointer"
                  >
                    <Bell className="h-4 w-4" /> Send Test Alert
                  </Button>
                </div>

                {/* Section 1: AI Events */}
                <div className="mt-6 space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
                    <Sparkles className="h-3.5 w-3.5" /> AI Intelligence Events
                  </h4>

                  <ChannelRow
                    icon={Brain}
                    title="AI Summary Finished"
                    desc="Notify me as soon as a meeting transcript summary has been produced"
                    emailKey="aiSummariesEmail"
                    pushKey="aiSummariesPush"
                    channels={notifChannels}
                    toggle={toggleNotif}
                  />

                  <ChannelRow
                    icon={CheckCircle2}
                    title="Action Item Assignments"
                    desc="Notify me when NoteMeet AI detects a task assigned to my name"
                    emailKey="taskRemindersEmail"
                    pushKey="taskRemindersPush"
                    channels={notifChannels}
                    toggle={toggleNotif}
                  />

                  <ChannelRow
                    icon={Mail}
                    title="Weekly Executive Digest"
                    desc="Curated weekly roundup of meeting decisions, commitments, and blockers"
                    emailKey="weeklyDigestEmail"
                    pushKey="weeklyDigestPush"
                    channels={notifChannels}
                    toggle={toggleNotif}
                  />
                </div>

                <Separator className="my-6" />

                {/* Section 2: Team & Workspace Events */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-500">
                    <Building2 className="h-3.5 w-3.5" /> Team & Workspace
                    Activity
                  </h4>

                  <ChannelRow
                    icon={MessageSquare}
                    title="Note Mentions & Comments"
                    desc="When a teammate tags @you in a note or discusses an action item"
                    emailKey="workspaceActivityEmail"
                    pushKey="workspaceActivityPush"
                    channels={notifChannels}
                    toggle={toggleNotif}
                  />
                </div>

                <Separator className="my-6" />

                {/* Section 3: Security & Critical Alerts */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
                    <ShieldCheck className="h-3.5 w-3.5" /> Security & Session
                    Alerts
                  </h4>

                  <ChannelRow
                    icon={Lock}
                    title="New Device Sign-Ins & Password Resets"
                    desc="Critical security notices sent when credentials change or new IP logs in"
                    emailKey="securityAlertsEmail"
                    pushKey="securityAlertsPush"
                    channels={notifChannels}
                    toggle={toggleNotif}
                    disabled={true}
                  />
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 4: AI INTELLIGENCE & QUOTAS                                     */}
          {/* =================================================================== */}
          <TabsContent value="ai" className="space-y-6 outline-none">
            {/* Neural Engine Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="relative overflow-hidden border-indigo-500/30 bg-linear-to-b from-indigo-500/10 via-card/70 to-card/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl" />

                <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold sm:text-lg">
                          NoteMeet Neural Engine
                        </h3>
                        <Badge className="border-indigo-500/40 bg-indigo-500/20 text-xs text-indigo-400">
                          Gemini 2.5 Flash
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        High-accuracy multi-speaker meeting intelligence
                        pipeline
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500 self-start sm:self-auto"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    99.98% Model Health
                  </Badge>
                </div>

                {/* Summary Format Preference Cards */}
                <div className="mt-6 space-y-4">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Default Synthesis Format
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FormatCard
                      active={aiSummaryStyle === "action"}
                      onClick={() => setAiSummaryStyle("action")}
                      icon={CheckCircle2}
                      title="Action-Focused"
                      desc="Prioritizes assigned tasks, deadlines, and direct owners first"
                    />
                    <FormatCard
                      active={aiSummaryStyle === "executive"}
                      onClick={() => setAiSummaryStyle("executive")}
                      icon={Briefcase}
                      title="Executive Brief"
                      desc="Concise bullet points and key strategic decisions for leadership"
                    />
                    <FormatCard
                      active={aiSummaryStyle === "comprehensive"}
                      onClick={() => setAiSummaryStyle("comprehensive")}
                      icon={FileText}
                      title="Deep Transcript"
                      desc="Full contextual summaries with verbatim quotes and full timestamps"
                    />
                  </div>
                </div>

                {/* Temperature & Language Controls */}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <SlidersVertical className="h-3.5 w-3.5 text-indigo-500" />
                        AI Reasoning Temperature
                      </Label>
                      <Badge variant="outline" className="text-xs font-mono">
                        {aiCreativity[0] < 0.4
                          ? "Precise (0.2)"
                          : aiCreativity[0] > 0.8
                            ? "Creative (0.9)"
                            : "Balanced (0.7)"}
                      </Badge>
                    </div>
                    <Slider
                      value={aiCreativity}
                      onValueChange={setAiCreativity}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Strict / Exact</span>
                      <span>Balanced</span>
                      <span>Expressive / Brainstorm</span>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" />
                      Transcription & Output Language
                    </Label>
                    <Select value={aiLanguage} onValueChange={setAiLanguage}>
                      <SelectTrigger className="rounded-xl border-border/60 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          Auto-Detect Language (100+ supported)
                        </SelectItem>
                        <SelectItem value="en-US">
                          English (United States)
                        </SelectItem>
                        <SelectItem value="en-GB">
                          English (United Kingdom)
                        </SelectItem>
                        <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                        <SelectItem value="es">Spanish (Español)</SelectItem>
                        <SelectItem value="fr">French (Français)</SelectItem>
                        <SelectItem value="de">German (Deutsch)</SelectItem>
                        <SelectItem value="ja">Japanese (日本語)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Auto-detect automatically translates or summarizes in the
                      primary meeting language.
                    </p>
                  </div>
                </div>

                {/* AI Feature Toggles */}
                <div className="mt-8 space-y-3 border-t border-border/40 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cognitive Modules
                  </h4>

                  <SettingRow
                    icon={CheckCircle2}
                    title="Automatic Action Item Extraction"
                    desc="Automatically parse commitments and deadlines into the task board"
                    checked={aiToggles.extractActionItems}
                    onChange={() => toggleAi("extractActionItems")}
                  />
                  <Separator />
                  <SettingRow
                    icon={Brain}
                    title="Sentiment & Meeting Tone Analysis"
                    desc="Classify meeting morale and sentiment (positive, neutral, critical)"
                    checked={aiToggles.sentimentAnalysis}
                    onChange={() => toggleAi("sentimentAnalysis")}
                  />
                  <Separator />
                  <SettingRow
                    icon={Zap}
                    title="Auto-Summarize Uploaded Audio Files"
                    desc="Immediately trigger neural summary when a new recording is dropped"
                    checked={aiToggles.autoSummarize}
                    onChange={() => toggleAi("autoSummarize")}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Quota & Usage Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-bold sm:text-lg">
                      Monthly Compute & Quota Utilization
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Usage resets on the 1st of every month
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-500 self-start sm:self-auto"
                  >
                    <Clock className="h-3 w-3" /> Resets in 6 days
                  </Badge>
                </div>

                <div className="space-y-5">
                  <UsageBar
                    label="AI Meeting Summaries"
                    used={summaries.length || 96}
                    total={250}
                    unit="summaries"
                    gradient="from-indigo-500 to-violet-600"
                  />
                  <UsageBar
                    label="Speech-to-Text Transcription Audio"
                    used={340}
                    total={600}
                    unit="mins"
                    gradient="from-cyan-500 to-blue-600"
                  />
                  <UsageBar
                    label="Action Items & Tasks Synced"
                    used={tasks.length || 243}
                    total={500}
                    unit="tasks"
                    gradient="from-emerald-500 to-teal-600"
                  />
                  <UsageBar
                    label="Vector Search Embeddings & Storage"
                    used={4.3}
                    total={10}
                    unit="GB"
                    gradient="from-purple-500 to-pink-600"
                  />
                </div>

                <div className="mt-8 flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Need unlimited quotas?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scale to Enterprise with dedicated cluster compute and
                        zero rate limits.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                  >
                    Upgrade Tier
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 5: WORKSPACES & TEAMS                                           */}
          {/* =================================================================== */}
          <TabsContent value="workspaces" className="space-y-6 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                {/* Control bar */}
                <div className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold sm:text-lg">
                        Workspace & Team Directory
                      </h3>
                      <Badge className="bg-indigo-500 text-white text-xs">
                        {workspaces.length} Spaces
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Switch context, administer workspaces, and coordinate
                      specialized teams
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-48 sm:w-60">
                      <Input
                        value={workspaceSearch}
                        onChange={(e) => setWorkspaceSearch(e.target.value)}
                        placeholder="Search workspaces..."
                        className="h-9 rounded-xl border-border/60 bg-muted/20 text-xs"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setWsToEdit(null);
                        setWsModalMode("create");
                        setWsModalOpen(true);
                      }}
                      className="gap-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> New Workspace
                    </Button>
                  </div>
                </div>

                {/* Workspaces Grid */}
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {filteredWorkspaces.map((ws) => {
                    const isActive = ws.id === activeWorkspaceId;
                    return (
                      <div
                        key={ws.id}
                        className={cn(
                          "relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all",
                          isActive
                            ? "border-indigo-500/70 bg-indigo-500/5 shadow-xl ring-2 ring-indigo-500/30"
                            : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70 hover:shadow-md",
                        )}
                      >
                        {isActive && (
                          <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                            <div className="absolute -right-7 top-2 w-24 rotate-45 bg-indigo-500 py-0.5 text-center text-[9px] font-bold text-white shadow-sm">
                              ACTIVE
                            </div>
                          </div>
                        )}

                        <div>
                          {/* Workspace Top Row */}
                          <div className="flex items-start gap-3.5 mb-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 text-2xl shadow-inner border border-indigo-500/20">
                              {ws.icon || "⚡"}
                            </div>
                            <div className="min-w-0 flex-1 pr-6">
                              <h4 className="truncate font-bold text-base">
                                {ws.name}
                              </h4>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="font-mono text-xs text-muted-foreground truncate">
                                  /{ws.slug}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopySlug(ws.slug || ws.id)
                                  }
                                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Copy slug URL"
                                >
                                  {copiedWsSlug === (ws.slug || ws.id) ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {ws.description && (
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                              {ws.description}
                            </p>
                          )}

                          {/* Teams section */}
                          <div className="mt-3 rounded-xl border border-border/40 bg-muted/20 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Teams ({ws.teams?.length || 0})
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTargetWsIdForTeam(ws.id);
                                  setTeamToEdit(null);
                                  setTeamModalMode("create");
                                  setTeamModalOpen(true);
                                }}
                                className="h-6 gap-1 px-2 text-[11px] font-semibold text-indigo-500 hover:bg-indigo-500/10 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Add Team
                              </Button>
                            </div>

                            {ws.teams && ws.teams.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {ws.teams.map((t: any) => (
                                  <div
                                    key={t.id}
                                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2 py-1 text-xs shadow-2xs"
                                  >
                                    <span>{t.icon || "💬"}</span>
                                    <span className="font-medium">
                                      {t.name}
                                    </span>
                                    <span className="rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">
                                      {t.key}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTargetWsIdForTeam(ws.id);
                                        setTeamToEdit(t);
                                        setTeamModalMode("edit");
                                        setTeamModalOpen(true);
                                      }}
                                      className="ml-1 text-muted-foreground hover:text-indigo-500 cursor-pointer"
                                      title="Edit team"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTeamToDelete(t);
                                        setDeleteTeamModalOpen(true);
                                      }}
                                      className="text-muted-foreground hover:text-rose-500 cursor-pointer"
                                      title="Delete team"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] italic text-muted-foreground">
                                No dedicated teams in this workspace yet.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions Bottom Bar */}
                        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
                          {!isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                dispatch(setActiveWorkspace(ws.id));
                                toast.success(
                                  `Switched active workspace to ${ws.name}`,
                                );
                              }}
                              className="rounded-xl border-border/80 text-xs font-semibold hover:border-indigo-500/50 cursor-pointer"
                            >
                              Set Active Space
                            </Button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500">
                              <CheckCircle2 className="h-4 w-4" /> Current
                              Active
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWsToEdit(ws);
                                setWsModalMode("edit");
                                setWsModalOpen(true);
                              }}
                              className="h-8 gap-1 rounded-lg text-xs hover:text-indigo-500 cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </Button>

                            {workspaces.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setWsToDelete(ws);
                                  setDeleteModalOpen(true);
                                }}
                                className="h-8 gap-1 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Create New Workspace Ghost Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setWsToEdit(null);
                      setWsModalMode("create");
                      setWsModalOpen(true);
                    }}
                    className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 p-6 text-center transition-colors hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Create Another Workspace
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Keep projects, clients, or product verticals cleanly
                        isolated
                      </p>
                    </div>
                  </button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* =================================================================== */}
          {/* TAB 6: SECURITY & ACCESS                                            */}
          {/* =================================================================== */}
          <TabsContent value="security" className="space-y-6 outline-none">
            {/* Password Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold sm:text-lg">
                      Password & Authentication
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Ensure your account uses a robust alphanumeric password
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-500"
                  >
                    Encrypted with Argon2
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="New Password" icon={Lock}>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Enter secure new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-xl border-border/60 bg-muted/20 pr-10 focus-visible:ring-indigo-500"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Strength:
                          </span>
                          <span className="font-semibold text-foreground">
                            {pwdStrength.text}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1.5 w-full">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={cn(
                                "flex-1 rounded-full transition-all duration-300",
                                step <= pwdStrength.score
                                  ? pwdStrength.color
                                  : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirm New Password" icon={Lock}>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-xl border-border/60 bg-muted/20 pr-10 focus-visible:ring-indigo-500"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-rose-500">
                        Passwords do not match
                      </p>
                    )}
                  </Field>
                </div>

                {/* Password Criteria Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <CheckPill
                    met={newPassword.length >= 8}
                    label="8+ Characters"
                  />
                  <CheckPill
                    met={/[A-Z]/.test(newPassword)}
                    label="1 Uppercase"
                  />
                  <CheckPill
                    met={/[a-z]/.test(newPassword)}
                    label="1 Lowercase"
                  />
                  <CheckPill met={/[0-9]/.test(newPassword)} label="1 Number" />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword}
                    className="gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 px-6 font-semibold text-white shadow-md hover:opacity-95 cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4" />
                    {isChangingPassword
                      ? "Updating password..."
                      : "Update Password"}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Active Sessions & Two-Factor Authentication */}
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <Card className="flex h-full flex-col justify-between border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          Two-Factor Authentication (2FA)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Time-based One-Time Passwords (TOTP)
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Protect your meeting notes and transcripts with an extra
                      layer of defense using Google Authenticator, 1Password, or
                      Authy.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("2FA Setup", {
                        description:
                          "Two-Factor Authentication enrollment is available for Enterprise workspaces.",
                      })
                    }
                    className="w-full gap-2 rounded-xl border-emerald-500/40 bg-emerald-500/5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" /> Enable Two-Factor (TOTP)
                  </Button>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                <Card className="flex h-full flex-col justify-between border-border/60 bg-card/70 p-6 shadow-md backdrop-blur-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Laptop className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          Current Active Session
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          macOS • Chrome Browser
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active Now
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-mono">Dhaka, Bangladesh</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.success(
                        "All other device sessions have been revoked.",
                      )
                    }
                    className="mt-4 w-full rounded-xl text-xs cursor-pointer"
                  >
                    Revoke Other Sessions
                  </Button>
                </Card>
              </motion.div>
            </div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <Card className="border-rose-500/30 bg-rose-500/5 p-6 shadow-md backdrop-blur-xl sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
                      Danger Zone & Data Retention
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Irreversible account actions and complete data export
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-rose-500/20 bg-background/50 p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold">
                      Export Workspace Archives
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Download a structured JSON archive of all your notes,
                      summaries, and action items.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.success(
                        "Export generated! Your download will begin shortly.",
                      )
                    }
                    className="gap-2 rounded-xl border-border/80 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <Download className="h-4 w-4" /> Export All Data
                  </Button>
                </div>

                <div className="mt-3 flex flex-col justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      Deactivate or Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Permanently wipes your personal profile, credentials, and
                      membership records.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      toast.error("Account deletion requires admin approval", {
                        description:
                          "Please contact your organization administrator or NoteMeet support.",
                      })
                    }
                    className="gap-2 rounded-xl bg-rose-600 text-xs font-semibold text-white shadow-md hover:bg-rose-700 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* ===================== WORKSPACE & TEAM MODALS ===================== */}
        <WorkspaceModal
          open={wsModalOpen}
          onClose={() => {
            setWsModalOpen(false);
            setWsToEdit(null);
          }}
          mode={wsModalMode}
          workspaceToEdit={wsToEdit}
        />
        <DeleteWorkspaceModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setWsToDelete(null);
          }}
          workspace={wsToDelete}
        />
        <TeamModal
          open={teamModalOpen}
          onClose={() => {
            setTeamModalOpen(false);
            setTeamToEdit(null);
          }}
          mode={teamModalMode}
          teamToEdit={teamToEdit}
          targetWorkspaceId={targetWsIdForTeam || activeWorkspaceId}
        />
        <DeleteTeamModal
          open={deleteTeamModalOpen}
          onClose={() => {
            setDeleteTeamModalOpen(false);
            setTeamToDelete(null);
          }}
          team={teamToDelete}
        />
      </div>
    </TooltipProvider>
  );
}

/* ========================================================================= */
/* HELPER COMPONENTS                                                         */
/* ========================================================================= */

function TabPill({
  value,
  icon: Icon,
  label,
  active,
  badge,
  count,
}: {
  value: string;
  icon: any;
  label: string;
  active: boolean;
  badge?: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer",
        active
          ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
            active
              ? "bg-white/20 text-white"
              : "bg-indigo-500/10 text-indigo-500",
          )}
        >
          {badge}
        </span>
      )}
      {count !== undefined && (
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
            active
              ? "bg-white/20 text-white"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}

function Field({
  label,
  icon: Icon,
  required,
  badge,
  children,
}: {
  label: string;
  icon: any;
  required?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
          <Icon className="h-3.5 w-3.5 text-indigo-500" /> {label}
          {required && <span className="text-rose-500">*</span>}
        </Label>
        {badge}
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: any;
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ChannelRow({
  icon: Icon,
  title,
  desc,
  emailKey,
  pushKey,
  channels,
  toggle,
  disabled,
}: {
  icon: any;
  title: string;
  desc: string;
  emailKey: keyof any;
  pushKey: keyof any;
  channels: any;
  toggle: (k: any) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-foreground shadow-2xs border border-border/60">
          <Icon className="h-4 w-4 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground">
            Email
          </span>
          <Switch
            checked={channels[emailKey]}
            onCheckedChange={() => toggle(emailKey)}
            disabled={disabled}
          />
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground">
            In-App
          </span>
          <Switch
            checked={channels[pushKey]}
            onCheckedChange={() => toggle(pushKey)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

function ThemePreviewCard({
  active,
  onClick,
  title,
  desc,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-2.5 rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer",
        active
          ? "border-indigo-500 bg-indigo-500/5 shadow-md ring-2 ring-indigo-500/25"
          : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70",
      )}
    >
      <div className="w-full">{children}</div>
      <div className="flex w-full items-center justify-between">
        <div>
          <p className="text-xs font-bold">{title}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
        {active ? (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
            <Check className="h-3 w-3" />
          </div>
        ) : (
          badge && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              {badge}
            </span>
          )
        )}
      </div>
    </button>
  );
}

function FormatCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
        active
          ? "border-indigo-500 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/30"
          : "border-border/60 bg-card/50 hover:border-border hover:bg-card/80",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          active
            ? "bg-indigo-500 text-white"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function UsageBar({
  label,
  used,
  total,
  unit,
  gradient,
}: {
  label: string;
  used: number;
  total: number;
  unit?: string;
  gradient: string;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {used} / {total} {unit || ""} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-linear-to-r", gradient)}
        />
      </div>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-xl">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md",
          gradient,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-extrabold tracking-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground">{subtext}</p>
      </div>
    </div>
  );
}

function CheckPill({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-colors",
        met
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Check
        className={cn(
          "h-3 w-3",
          met ? "text-emerald-500" : "text-muted-foreground opacity-40",
        )}
      />
      {label}
    </span>
  );
}
