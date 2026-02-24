import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import {GroupRole} from "@prisma/client";

export async function GET(
    request: NextRequest,
    context: { params: { groupId: string } }
) {
    try {
        const user = await getCurrentUser();
        const { groupId } = await context.params;

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const requesterMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                }
            }
        });

        if(!requesterMembership) {
            return NextResponse.json(
                { error: "You are not authorized to this information" },
                { status: 403 }
            )
        }

        const memberships = await prisma.groupMember.findMany({
            where: {
                groupId: groupId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                role: 'asc',
            }
        });

        return NextResponse.json(
            { memberships, message: "All members of this group have been retrieved successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: { groupId: string } }
) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 },
            );
        }

        const { groupId } = context.params;

        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                },
            },
            select: {
                role: true,
            }
        });

        if(!membership || membership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You are not authorized to update the data about a member" },
                { status: 403 }
            )
        }

        const { targetId, newRole } = await request.json();

        if(!targetId || !newRole) {
            return NextResponse.json(
                { error: "Missing user id or role"},
                { status: 400 }
            );
        }

        if(targetId === user.id && newRole !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You cannot change your own role, update this group's ownership first" },
                { status: 400 }
            );
        }

        const updatedMember = await prisma.groupMember.update({
            where: {
                userId_groupId: {
                    userId: targetId,
                    groupId: groupId,
                },
            },
            data: {
                role: newRole,
            }
        });

        return NextResponse.json(
            {
                member: updatedMember,
                message: `Successfully updated member`,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}