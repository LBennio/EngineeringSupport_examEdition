import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import { Prisma } from "@prisma/client";
import { Role, GroupRole } from "@/app/types";
import { prisma } from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authorized to access user information" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const groupId = searchParams.get("groupId");
        const role = searchParams.get("role") as Role | null;
        const groupRole = searchParams.get("groupRole") as GroupRole | null;

        const where: Prisma.UserWhereInput = {};

        // the admin can see everyone, optionally filtering by role
        // (ADMIN, BASE_USER, UPGRADED_USER, GUEST)
        if(user.role === Role.ADMIN) {
            if(role) {
                where.role = role;
            }

            if(groupId || groupRole) {
                where.memberships = {
                    some: {
                        ...(groupId && { groupId }),
                        ...(groupRole && { role: groupRole }),
                    }
                }
            }

        } else {
            // look for all the groups the user is in
            const memberships = await prisma.groupMember.findMany({
                where: { userId: user.id },
                select: { groupId: true },
            });

            // if none, return an empty array
            if(!memberships.length) {
                return NextResponse.json({ users: [] });
            }

            // get all the group ids linked to the current user's membership account
            const allowedGroupIds = memberships.map((member) => member.groupId);

            // if there ain't none, you cannot access these users' information
            if(groupId && !allowedGroupIds.includes(groupId)) {
                return NextResponse.json(
                    { error: "You do not have access to this group" },
                    { status: 403 }
                );
            }

            // look for memberships where the groupId is the same as any of the ones the user is in
            where.memberships = {
                // the user has to have at least one row corresponding to this group
                some: {

                    // if a group is searched for (params), search that one,
                    // otherwise, look through the allowed groups
                    groupId: groupId ?? { in: allowedGroupIds },

                    // optionally filter through the result with the Group Role of the searched users' information
                    ...(groupRole && { role: groupRole }),
                },
            };
        }

        // actually implement the query
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true,
                memberships: {
                    include: {
                        group: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },

                createdAt: true,
            },
        })

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 },
        );
    }
}