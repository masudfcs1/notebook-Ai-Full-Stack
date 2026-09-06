import { Crown, Shield, Users, type LucideIcon } from "lucide-react";

export interface TeamTheme {
  id: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradient: string;
  gradientHover: string;
  glow: string;
  ring: string;
  dot: string;
  avatarBg: string;
  activeBorder: string;
  subtleBg: string;
  roleBg: string;
}

const THEME_PALETTES: TeamTheme[] = [
  {
    id: "indigo",
    name: "Indigo",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/30",
    gradient: "from-indigo-500 to-violet-600",
    gradientHover: "hover:from-indigo-600 hover:to-violet-700",
    glow: "bg-indigo-500/20",
    ring: "ring-indigo-500/30",
    dot: "bg-indigo-500",
    avatarBg: "bg-indigo-500/20 text-indigo-300",
    activeBorder: "border-indigo-500/80",
    subtleBg: "bg-indigo-500/10",
    roleBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "emerald",
    name: "Emerald",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-600",
    gradientHover: "hover:from-emerald-600 hover:to-teal-700",
    glow: "bg-emerald-500/20",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-500",
    avatarBg: "bg-emerald-500/20 text-emerald-300",
    activeBorder: "border-emerald-500/80",
    subtleBg: "bg-emerald-500/10",
    roleBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "violet",
    name: "Violet",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-400",
    badgeBorder: "border-violet-500/30",
    gradient: "from-violet-500 to-purple-600",
    gradientHover: "hover:from-violet-600 hover:to-purple-700",
    glow: "bg-violet-500/20",
    ring: "ring-violet-500/30",
    dot: "bg-violet-500",
    avatarBg: "bg-violet-500/20 text-violet-300",
    activeBorder: "border-violet-500/80",
    subtleBg: "bg-violet-500/10",
    roleBg: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  {
    id: "amber",
    name: "Amber",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
    gradient: "from-amber-500 to-orange-600",
    gradientHover: "hover:from-amber-600 hover:to-orange-700",
    glow: "bg-amber-500/20",
    ring: "ring-amber-500/30",
    dot: "bg-amber-500",
    avatarBg: "bg-amber-500/20 text-amber-300",
    activeBorder: "border-amber-500/80",
    subtleBg: "bg-amber-500/10",
    roleBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: "rose",
    name: "Rose",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/30",
    gradient: "from-rose-500 to-pink-600",
    gradientHover: "hover:from-rose-600 hover:to-pink-700",
    glow: "bg-rose-500/20",
    ring: "ring-rose-500/30",
    dot: "bg-rose-500",
    avatarBg: "bg-rose-500/20 text-rose-300",
    activeBorder: "border-rose-500/80",
    subtleBg: "bg-rose-500/10",
    roleBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  {
    id: "cyan",
    name: "Cyan",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    gradient: "from-cyan-500 to-blue-600",
    gradientHover: "hover:from-cyan-600 hover:to-blue-700",
    glow: "bg-cyan-500/20",
    ring: "ring-cyan-500/30",
    dot: "bg-cyan-500",
    avatarBg: "bg-cyan-500/20 text-cyan-300",
    activeBorder: "border-cyan-500/80",
    subtleBg: "bg-cyan-500/10",
    roleBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    badgeBg: "bg-fuchsia-500/15",
    badgeText: "text-fuchsia-400",
    badgeBorder: "border-fuchsia-500/30",
    gradient: "from-fuchsia-500 to-pink-600",
    gradientHover: "hover:from-fuchsia-600 hover:to-pink-700",
    glow: "bg-fuchsia-500/20",
    ring: "ring-fuchsia-500/30",
    dot: "bg-fuchsia-500",
    avatarBg: "bg-fuchsia-500/20 text-fuchsia-300",
    activeBorder: "border-fuchsia-500/80",
    subtleBg: "bg-fuchsia-500/10",
    roleBg: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  },
  {
    id: "sky",
    name: "Sky",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-400",
    badgeBorder: "border-sky-500/30",
    gradient: "from-sky-500 to-indigo-600",
    gradientHover: "hover:from-sky-600 hover:to-indigo-700",
    glow: "bg-sky-500/20",
    ring: "ring-sky-500/30",
    dot: "bg-sky-500",
    avatarBg: "bg-sky-500/20 text-sky-300",
    activeBorder: "border-sky-500/80",
    subtleBg: "bg-sky-500/10",
    roleBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
];

/**
 * Deterministically generates a vibrant theme palette for a given team key, id, or name.
 */
export function getTeamTheme(seed?: string | null): TeamTheme {
  if (!seed || !seed.trim()) return THEME_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % THEME_PALETTES.length;
  return THEME_PALETTES[index];
}

export interface RoleConfig {
  label: string;
  style: string;
  bar: string;
  icon: LucideIcon;
  description: string;
}

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  OWNER: {
    label: "Owner",
    style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    bar: "bg-amber-500",
    icon: Crown,
    description: "Full administrative rights, member management, and team settings",
  },
  LEAD: {
    label: "Lead",
    style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    bar: "bg-indigo-500",
    icon: Shield,
    description: "Team leadership, sprint management, and task reviewer",
  },
  MEMBER: {
    label: "Member",
    style: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    bar: "bg-slate-400",
    icon: Users,
    description: "Active contributor, meeting participant, and note editor",
  },
};
