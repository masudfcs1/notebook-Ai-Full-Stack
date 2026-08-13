export interface TeamResponseDTO {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  slug: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: any[];
}

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
    members: team.members || [],
  };
};

export const toTeamListResponse = (teams: any[]): TeamResponseDTO[] => {
  return teams.map(toTeamResponse);
};
