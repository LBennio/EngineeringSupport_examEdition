import {Project} from "@/app/types/project";

export enum Role {
    ADMIN = 'ADMIN',
    BASE_USER = "BASE_USER",
    UPGRADED_USER = "UPGRADED_USER",
    GUEST = "GUEST",
}

export enum GroupRole {
    OWNER = "OWNER",
    PRODUCT_MANAGER = "PRODUCT_MANAGER",
    SOFTWARE_ENGINEER = "SOFTWARE_ENGINEER",
}

export interface User {
    id: string,
    name: string,
    surname: string,
    email: string,
    password: string,

    role: Role,

    memberships: GroupMember[];

    createdAt: Date,
    updatedAt: Date,
}

export interface Group {
    id: string,
    name: string,
    description?: string | null,
    code: string,

    members: GroupMember[],
    projects?: Project[] | null,

    createdAt: Date,
    updatedAt: Date,
}

export interface GroupMember {
    id: string,
    userId: string,
    groupId: string,

    role: GroupRole,

    user?: User,
    group?: Group,
}
