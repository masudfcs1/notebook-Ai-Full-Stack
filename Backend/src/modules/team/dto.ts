export interface TeamMemberResponseDTO {
  id: string;
  teamId: string;
  userId: number | null;
  name: string;
  email: string;
  avatar: string | null;
  role: 'OWNER' | 'LEAD' | 'MEMBER';
  createdAt: Date;
  user?: {
    id: number;
    uuid: string;
    name: string | null;
    username: string | null;
    email: string;
    avatar: string | null;
    role: string;
    status: string;
  } | null;
}

export interface TeamResponseDTO {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  slug: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMemberResponseDTO[];
}

export const toTeamMemberResponse = (member: any): TeamMemberResponseDTO => {
  return {
    id: member.id,
    teamId: member.teamId,
    userId: member.userId || null,
    name: member.user?.name || member.name,
    email: member.user?.email || member.email,
    avatar: member.user?.avatar || member.avatar || null,
    role: member.role || 'MEMBER',
    createdAt: member.createdAt,
    user: member.user
      ? {
          id: member.user.id,
          uuid: member.user.uuid,
          name: member.user.name,
          username: member.user.username,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.user.role,
          status: member.user.status,
        }
      : null,
  };
};

export const toTeamMemberListResponse = (members: any[]): TeamMemberResponseDTO[] => {
  return (members || []).map(toTeamMemberResponse);
};

export const toTeamResponse = (team: any): TeamResponseDTO => {
  const slug =
    team.slug ||
    team.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  return {
    id: team.id,
    workspaceId: team.workspaceId,
    name: team.name,
    key: team.key,
    slug,
    icon: team.icon || '💬',
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    members: toTeamMemberListResponse(team.members),
  };
};

export const toTeamListResponse = (teams: any[]): TeamResponseDTO[] => {
  return teams.map(toTeamResponse);
};

