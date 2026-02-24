import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {GroupMember, GroupRole, Role, User} from "@/app/types";
import {cookies} from "next/headers";
import {prisma} from "@/app/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;
const expireTime = "5d";
const hashingSalt = 12;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, hashingSalt);
}

export const verifyPassword = async (
    password: string,
    hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: expireTime });
}

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
}

/**
 * Cookie names
 * - Frontend middleware defaults to "es_session"
 * - Backend historically used "token"
 * We support both to keep backward compatibility.
 */
export const getAuthCookieNames = (): string[] => {
    const primary = process.env.AUTH_SESSION_COOKIE_NAME?.trim();
    const names = [primary || 'token', 'token', 'es_session'];
    return Array.from(new Set(names.filter(Boolean)));
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const cookieStore = await cookies();
        const cookieNames = getAuthCookieNames();
        const token = cookieNames
            .map((name) => cookieStore.get(name)?.value)
            .find(Boolean);

        if(!token) return null;

        const decode = verifyToken(token);

        const userFromDb = await prisma.user.findUnique({
            where: { id: decode.userId },
            include: {
                memberships: {
                    include: {
                        group: true,
                    },
                },
            },
        });

        if(!userFromDb) return null;

        const { password, memberships, ...user } = userFromDb;

        return user as User;
    } catch (error) {
        console.error("Authentication Error: ", error);
        return null;
    }
}

export const checkUserPermission = (
    user: User,
    requiredRole: Role
): boolean => {
    const roleHierarchy = {
        [Role.GUEST]: 0,
        [Role.BASE_USER]: 1,
        [Role.UPGRADED_USER]: 2,
        [Role.ADMIN]: 3,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

export const checkMemberPermission = (
    member: GroupMember,
    requiredRole: GroupRole,
): boolean => {
    const roleHierarchy = {
        [GroupRole.PRODUCT_MANAGER]: 1,
        [GroupRole.SOFTWARE_ENGINEER]: 2,
        [GroupRole.OWNER]: 3,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}