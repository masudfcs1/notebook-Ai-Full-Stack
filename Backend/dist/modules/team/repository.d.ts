import { CreateTeamData, UpdateTeamData, AddTeamMemberData, UpdateTeamMemberData } from './types';
export declare const TEAM_MEMBER_INCLUDE: {
    readonly include: {
        readonly user: {
            readonly select: {
                readonly id: true;
                readonly uuid: true;
                readonly name: true;
                readonly username: true;
                readonly email: true;
                readonly avatar: true;
                readonly role: true;
                readonly status: true;
            };
        };
    };
};
export declare class TeamRepository {
    create(data: CreateTeamData): Promise<{
        members: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
    findById(id: string): Promise<({
        workspace: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            slug: string;
            icon: string | null;
            description: string | null;
        };
        members: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }) | null>;
    findByWorkspaceId(workspaceId: string, userId?: number, isAdmin?: boolean, userEmail?: string): Promise<({
        members: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    })[]>;
    findAll(userId?: number, isAdmin?: boolean, userEmail?: string): Promise<({
        members: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    })[]>;
    update(id: string, data: UpdateTeamData): Promise<{
        members: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
    getMembers(teamId: string): Promise<({
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    })[]>;
    findMemberById(memberId: string): Promise<({
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        team: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            icon: string | null;
            workspaceId: string;
        };
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    }) | null>;
    findMemberByTeamAndEmailOrUserId(teamId: string, email: string, userId?: number): Promise<({
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            password: string | null;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
            provider: import(".prisma/client").$Enums.Provider;
            isVerified: boolean;
            lastLogin: Date | null;
            loginCount: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    }) | null>;
    addMember(teamId: string, data: AddTeamMemberData): Promise<{
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    }>;
    addMembersBulk(teamId: string, membersData: AddTeamMemberData[]): Promise<({
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    })[]>;
    updateMember(memberId: string, data: UpdateTeamMemberData): Promise<{
        user: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    }>;
    deleteMember(memberId: string): Promise<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        createdAt: Date;
        userId: number | null;
        teamId: string;
    }>;
    searchAvailableUsers(teamId: string, search?: string): Promise<{
        id: any;
        uuid: any;
        name: any;
        username: any;
        email: any;
        avatar: any;
        role: any;
        status: any;
        memberships: any;
    }[]>;
}
export declare const teamRepository: TeamRepository;
//# sourceMappingURL=repository.d.ts.map