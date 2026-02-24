import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";

export async function POST(
    request: NextRequest
) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { groupCode } = await request.json();

        if(!groupCode) {
            return NextResponse.json(
                { error: "Invalid group code: " + groupCode },
                { status: 400 }
            );
        }

        const group = await prisma.group.findUnique({
            where: {
                code: groupCode,
            }
        });

        if(!group) {
            return NextResponse.json(
                { error: "Could not find a group associated to this code" },
                { status: 404 }
            );
        }

        const existingMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: group.id,
                },
            }
        });

        if(existingMembership) {
            return NextResponse.json(
                { error: "You are already a member of this group" },
                { status: 409 }
            );
        }

        await prisma.groupMember.create({
            data: {
                userId: user.id,
                groupId: group.id,
            }
        });

        return NextResponse.json(
            { groupId: group.id, message: "Group joined successfully" },
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