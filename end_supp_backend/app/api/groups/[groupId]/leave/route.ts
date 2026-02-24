import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import {GroupRole} from "@/app/types";

export async function DELETE(
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

        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                },
            },
        });

        if(!membership) {
            return NextResponse.json(
                { error: "You are not part of this group" },
                { status: 401 },
            );
        }

        if(membership.role === GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You cannot leave a group you own" },
                { status: 400 }
            );
        }

        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                },
            },
        });

        return NextResponse.json(
            { message: "Successfully deleted your membership to this group" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}