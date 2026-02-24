import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";
import {getCurrentUser} from "@/app/lib/auth";
import {GroupRole} from "@/app/types";
import {SectionType} from "@prisma/client";

export const DEFAULT_SECTIONS = [
    {
        type: SectionType.DESCRIPTION,
        title: "Introduction",
        order: 1,
        isUnique: true,
        isRequired: true,
    },
    {
        type: SectionType.DESCRIPTION,
        title: "Business Context",
        order: 2,
        isUnique: true,
        isRequired: true,
    },
    {
        type: SectionType.DESCRIPTION,
        title: "Stakeholders",
        order: 3,
        isUnique: true,
        isRequired: true,
    }
] as const;

export const AUTHORIZED_PATCH_USERS: GroupRole[] = [
    GroupRole.OWNER,
    GroupRole.PRODUCT_MANAGER,
]

export async function GET(
    request: NextRequest,
    context: { params: { projectId: string } }
) {

    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated"},
                { status: 401 }
            );
        }

        const { projectId } = await context.params;

        const document = await prisma.document.findFirst({
            where: {
                projectId,
                project: {
                    group: {
                        members: {
                            some: {
                                userId: user.id
                            },
                        },
                    },
                },
            },
            include: {
                sections: { orderBy: { order: 'asc' } },
                usecases: {
                    include: { specification: true },
                    orderBy: { title: 'asc' },
                },
            },
        });

        if(!document) {
            return NextResponse.json(
                { error: "Document not found or access denied" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { document, message: "Document retrieved successfully", },
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

export async function POST(
    request: NextRequest,
    context: { params: { projectId: string } }
) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { projectId } = await context.params;

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
            include: {
                document: {
                    select: { id: true },
                },
                group: {
                    include: {
                        members: {
                            where: { userId: user.id },
                        }
                    }
                }
            },
        });

        if(!project) {
            return NextResponse.json(
                { error: "The project you're trying to reach does not exist" },
                { status: 404 }
            );
        }

        if(project.document) {
            return NextResponse.json(
                { error: "The project already has a document" },
                { status: 409 },
            );
        }

        const userMembership = project.group.members[0];

        if(!userMembership || userMembership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "You are not authorized to perform this operation" },
                { status: 403 }
            )
        }

        const document = await prisma.document.create({
            data: {
                title: project.title,
                version: "1.0.0",
                projectId: project.id,
                sections: {
                    create: DEFAULT_SECTIONS.map((s) => ({
                        type: s.type as SectionType,
                        title: s.title,
                        order: s.order,
                        isUnique: s.isUnique ?? false,
                        isRequired: s.isRequired ?? false,
                    })),
                },
            },
            include: {
                sections: true,
            }
        })

        return NextResponse.json(
            { document, message: "document created successfully" },
            { status: 201 }
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
    { params }: { params: { projectId: string } }
) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { title, version, type } = await request.json();

        if(!title && !version && !type) {
            return NextResponse.json(
                { error: "Nothing to update" },
                { status: 400 },
            );
        }

        const projectDocumentData = await prisma.project.findFirst({
            where: {
                id: params.projectId,
                group: {
                    members: {
                        some: { userId: user.id }
                    }
                },
            },
            include: {
                document: true,
                group: {
                    include: {
                        members: {
                            where: {
                                userId: user.id,
                            }
                        }
                    }
                }
            }
        });


        if(!projectDocumentData || !projectDocumentData.document) {
            return NextResponse.json(
                { error: "Project not found or access denied" },
                { status: 404 }
            )
        }

        const userRole = projectDocumentData.group.members[0]?.role;
        if(!userRole || !AUTHORIZED_PATCH_USERS.includes(userRole as GroupRole)) {
            return NextResponse.json(
                { error: "You are not authorized to update this document information"},
                { status: 403 }
            );
        }

        // Version handling:
        // - If caller passes a full version string, use it
        // - Otherwise, increment current version based on `type`
        let newVersion: string | undefined;

        if (typeof version === 'string' && version.trim()) {
            newVersion = version.trim();
        } else if (type === 'major' || type === 'minor' || type === 'patch') {
            newVersion = incrementVersion(projectDocumentData.document.version, type);
        }

        const document = await prisma.document.update({
            where: {
                projectId: params.projectId
            },
            data: {
                ...(title && {title}),
                ...(newVersion && { version: newVersion }),
            }
        });

        return NextResponse.json(
            { document, message: "Document updated successfully" },
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

export async function DELETE(
    request: NextRequest,
    context: { params: { projectId: string } }
) {
    try {
        const user = await getCurrentUser();
        const { projectId } = await context.params;

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const membership = await prisma.groupMember.findFirst({
            where: {
                userId: user.id,
                group: {
                    projects: {
                        some: {
                            id: projectId,
                        }
                    }
                }
            },
        });

        if(!membership || membership.role !== GroupRole.OWNER) {
            return NextResponse.json(
                { error: "Only the group owner can delete this document" },
                { status: 403 }
            );
        }

        await prisma.document.delete({
            where: {
                projectId,
            }
        });

        return NextResponse.json(
            { message: "document deleted successfully" },
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

function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const parts = version.split('.').map(Number);
    if(parts.length !== 3) return version;

    if(type === 'major') {
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
    } else if (type === 'minor') {
        parts[1]++;
        parts[2] = 0;
    } else {
        parts[2]++;
    }

    return parts.join('.');
}