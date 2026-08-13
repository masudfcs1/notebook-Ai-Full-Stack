export interface WorkspaceResponseDTO {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
  teams?: any[];
  notes?: any[];
}

export const toWorkspaceResponse = (workspace: any): WorkspaceResponseDTO => {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    icon: workspace.icon,
    description: workspace.description,
    userId: workspace.userId ?? null,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    teams: workspace.teams || [],
    notes: workspace.notes || [],
  };
};

export const toWorkspaceListResponse = (workspaces: any[]): WorkspaceResponseDTO[] => {
  return workspaces.map(toWorkspaceResponse);
};
