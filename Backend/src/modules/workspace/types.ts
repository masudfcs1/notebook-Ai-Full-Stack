export interface WorkspaceResponse {
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

export interface WorkspaceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateWorkspaceData {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  userId: number;
  ownerName?: string | null;
  ownerEmail?: string;
  ownerAvatar?: string | null;
}

export interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
}
