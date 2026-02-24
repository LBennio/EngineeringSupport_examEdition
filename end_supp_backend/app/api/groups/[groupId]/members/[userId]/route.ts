import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import {GroupRole} from "@/app/types";

export async function DELETE(
    request: NextRequest,
    context: { params: { groupId: string, userId: string } }
) {
    try {
        const user = await getCurrentUser();
        const { groupId, userId } = await context.params;

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const userMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                },
            },
            select: {
                role: true,
            },
        });

        if(!userMembership) {
            return NextResponse.json(
                { error: "You are not part of this group" },
                { status: 403 },
            )
        }

        if(userMembership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You do not have permission to perform this operation" },
                { status: 403 }
            )
        }

        const toKickMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId,
                },
            },
            select: {
                role: true,
            },
        });

        if(!toKickMembership) {
            return NextResponse.json(
                { error: "The user you're trying to kick is not part of this group" },
                { status: 402 },
            );
        }

        if(toKickMembership.role === GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You cannot kick an owner of the group" },
                { status: 402 }
            )
        }

        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId,
                },
            },
        });

        return NextResponse.json(
            { message: "User membership revoked successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        )
    }
}