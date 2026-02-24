import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import { GroupRole } from "@prisma/client";

export async function GET(
    request: NextRequest,
    context: { params: { groupId: string } }
) {
    try {
        const { groupId } = context.params;
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const group = await prisma.group.findUnique({
            where: {
                id: groupId,
                members: {
                    some: {
                        userId: user.id,
                    }
                },
            },
            include: {
                projects: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                }
            }
        });

        if(!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { group, message: "Group retrieved succesfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: { groupId: string } }
) {
    try {
        const { groupId } = context.params;
        const user = await getCurrentUser();
        const { name, description } = await request.json();

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
                }
            }
        });

        if(!membership || membership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You are not authorized to edit this group" },
                { status: 403 }
            );
        }

        const updatedGroup = await prisma.group.update({
            where: {
                id: groupId
            },
            data: {
                name,
                description,
            },
        });

        return NextResponse.json(
            { updatedGroup, message: "Group updated" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: { groupId: string } }
) {
    try {
        const { groupId } = context.params;
        const user = await getCurrentUser();

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
                }
            }
        });

        if(!membership || membership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You are not authorized to delete this group" },
                { status: 403 }
            );
        }

        await prisma.group.delete({
            where: {
                id: groupId
            },
        });

        return NextResponse.json(
            { message: "Group deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}
