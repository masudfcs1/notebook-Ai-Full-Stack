export interface CreateTeamData {
  workspaceId: string;
  name: string;
  key: string;
  icon?: string;
  slug?: string;
  userId?: number;
  ownerName?: string | null;
  ownerEmail?: string;
  ownerAvatar?: string | null;
}

export interface UpdateTeamData {
  name?: string;
  key?: string;
  icon?: string;
  slug?: string;
}

export interface TeamQuery {
  workspaceId?: string;
}

export interface AddTeamMemberData {
  userId?: number;
  name: string;
  email: string;
  role?: 'OWNER' | 'LEAD' | 'MEMBER';
  avatar?: string;
}

export interface AddTeamMembersBulkData {
  members: AddTeamMemberData[];
}

export interface UpdateTeamMemberData {
  name?: string;
  email?: string;
  role?: 'OWNER' | 'LEAD' | 'MEMBER';
  avatar?: string;
}

export interface UserTeamMembership {
  teamId: string;
  teamName: string;
  teamKey: string;
  teamIcon?: string | null;
  role: string;
}

export interface AvailableUser {
  id: number;
  uuid: string;
  name: string | null;
  username: string | null;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  memberships?: UserTeamMembership[];
}
