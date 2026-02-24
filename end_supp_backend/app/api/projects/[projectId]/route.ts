import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import {GroupRole} from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string} }
) {
    try {
        // if you're NOT authenticated, return an error
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated"},
                { status: 401 }
            );
        }

        // get the project. duh.
        const project = await prisma.project.findFirst({
            where: {
                id: params.projectId,
                group: {
                    members: {
                        some: { userId: user.id }
                    },
                },
            },
            include: {
                group: {
                    select: {
                        name: true,
                        code: true,
                    }
                },
                document: true,
            },
        });

        // if the project does not exist, return an error
        if(!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { project, message: "Project retreived succesfully" },
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
    { params }: { params: { projectId: string } },
) {
    try {
        const user = await getCurrentUser();
        const allowedRoles: GroupRole[] = [GroupRole.OWNER, GroupRole.PRODUCT_MANAGER];

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated"},
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description } = body;

        const project = await prisma.project.findUnique({
            where: {
                id: params.projectId
            },
            include: {
                group: {
                    include: {
                        members: {
                            where: {
                                userId: user.id
                            },
                        },
                    },
                },
            },
        });

        if(!project) {
            return NextResponse.json(
                { error: "The project does not exist" },
                { status: 404 }
            )
        }

        const membership = project.group.members[0];

        if(!membership) {
            return NextResponse.json(
                { error: "You are not allowed to update this project" },
                { status: 403 }
            );
        }

        if (!allowedRoles.includes(membership.role)) {
            return NextResponse.json(
                { error: "Only Managers or Owners can edit projects" },
                { status: 403 }
            );
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: params.projectId
            },
            data: {
                title,
                description,
            },
        });

        return NextResponse.json(
            { project: updatedProject, message: "Project updated successfully" },
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { projectId: string } },
) {
    try {
        const user = await getCurrentUser();
        const allowedRoles = [GroupRole.OWNER, GroupRole.PRODUCT_MANAGER];

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated"},
                { status: 401 }
            );
        }

        const project = await prisma.project.findFirst({
            where: {
                id: params.projectId ,
                group: {
                    members: {
                        some: {
                            userId: user.id,
                            role: {
                                in: allowedRoles,
                            }
                        }
                    }
                }
            }
        });

        if(!project) {
            return NextResponse.json(
                { error: "The project does not exist" },
                { status: 404 }
            );
        }

        await prisma.project.delete({
            where: { id: params.projectId }
        });

        return NextResponse.json(
            { message: "Project deleted successfully" },
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