import { Check, ChevronDown, Crown, Edit3, MoreHorizontal, Shield, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeamMember } from "@/lib/redux/api/workspaceApiSlice";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";

export const TEAM_MEMBER_ROLES = [
  {
    value: "MEMBER",
    label: "Member",
    icon: Users,
    className: "border-border bg-muted/60 text-muted-foreground",
  },
  {
    value: "LEAD",
    label: "Lead",
    icon: Shield,
    className: "border-indigo-500/15 bg-indigo-500/8 text-indigo-700 dark:text-indigo-300",
  },
  {
    value: "OWNER",
    label: "Owner",
    icon: Crown,
    className: "border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-300",
  },
] as const;

export function MemberIdentity({ member, isCurrentUser = false }: {
  member: TeamMember;
  isCurrentUser?: boolean;
}) {
  const name = member.user?.name || member.name;
  const email = member.user?.email || member.email;
  const avatar = getAvatarUrl(member.user?.avatar || member.avatar);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/60">
        {avatar && <AvatarImage src={avatar} alt="" />}
        <AvatarFallback className="bg-primary/8 text-xs font-semibold text-primary">
          {getUserInitials(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[13px] font-semibold text-foreground" title={name}>{name}</p>
          {isCurrentUser && <span className="shrink-0 text-[10px] font-normal text-muted-foreground">You</span>}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground" title={email}>{email}</p>
      </div>
    </div>
  );
}

export function MemberRoleControl({ member, canManage, disabled, onChange }: {
  member: TeamMember;
  canManage: boolean;
  disabled?: boolean;
  onChange: (member: TeamMember, role: TeamMember["role"]) => void;
}) {
  const role = TEAM_MEMBER_ROLES.find((item) => item.value === member.role) || TEAM_MEMBER_ROLES[0];
  const Icon = role.icon;
  const className = cn("inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium", role.className);

  if (!canManage) {
    return <span className={className}><Icon className="h-3 w-3" />{role.label}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={`Change role for ${member.user?.name || member.name}, currently ${role.label}`}
          className={cn(className, "cursor-pointer transition-colors hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60")}
        >
          <Icon className="h-3 w-3" />{role.label}<ChevronDown className="ml-0.5 h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 rounded-xl p-1.5">
        <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">Team role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TEAM_MEMBER_ROLES.map((option) => {
          const RoleIcon = option.icon;
          return (
            <DropdownMenuItem key={option.value} onSelect={() => onChange(member, option.value)} className="cursor-pointer gap-2 rounded-md py-2 text-xs">
              <RoleIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {option.label}
              {member.role === option.value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MemberActions({ member, disabled, onEdit, onRemove }: {
  member: TeamMember;
  disabled?: boolean;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Actions for ${member.user?.name || member.name}`} className="h-8 w-8 shrink-0 cursor-pointer rounded-lg text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
        <DropdownMenuItem onSelect={() => onEdit(member)} className="cursor-pointer gap-2 rounded-md py-2 text-xs">
          <Edit3 className="h-3.5 w-3.5" /> Edit member
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onRemove(member)} className="cursor-pointer gap-2 rounded-md py-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Remove from team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MemberOtherTeams({ member, teamId }: { member: TeamMember; teamId: string }) {
  const memberships = (member.user?.memberships || []).filter((item) => item.teamId !== teamId);

  if (!memberships.length) return <span className="text-[11px] text-muted-foreground">No other teams</span>;

  return (
    <div className="flex min-w-0 items-center gap-1.5" title={memberships.map((item) => `${item.teamName} · ${item.role.toLowerCase()}`).join(", ")}>
      <span className="max-w-36 truncate rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground">
        {memberships[0].teamName}
      </span>
      {memberships.length > 1 && <span className="shrink-0 text-[10px] text-muted-foreground">+{memberships.length - 1}</span>}
    </div>
  );
}

export function formatMemberJoined(date?: string, compact = false) {
  if (!date || Number.isNaN(new Date(date).getTime())) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: compact ? undefined : "numeric",
  });
}
