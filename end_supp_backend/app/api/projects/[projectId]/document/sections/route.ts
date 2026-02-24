import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { GroupRole } from "@/app/types";
import { SectionType as PrismaSectionType } from "@prisma/client";
import { SectionValidationSchema } from "@/app/lib/validation";

export const SECTION_CREATION_AUTHORIZED_ROLES = [
    GroupRole.PRODUCT_MANAGER,
    GroupRole.OWNER
];

// --- GET: Fetch all sections for the document ---
export async function GET(
    request: NextRequest,
    context: { params: { projectId: string } }
)  {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { projectId } = await context.params;

        // Fetch the document and verify the user is a member of the group
        const document = await prisma.document.findFirst({
            where: {
                projectId: projectId,
                project: {
                    group: {
                        members: {
                            some: {
                                userId: user.id,
                            },
                        },
                    },
                },
            },
            include: {
                sections: {
                    orderBy: {
                        order: 'asc',
                    },
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
            { sections: document.sections, message: "Sections retrieved successfully." },
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

// --- POST: Create a new section using Zod validation ---
export async function POST(
    request: NextRequest,
    context: { params: { projectId: string } }
) {
    try {
        const user = await getCurrentUser();
        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 },
            );
        }

        const { projectId } = await context.params;
        const rawBody = await request.json();

        // 1. Normalize frontend payload before validation
        if (rawBody.type === 'IMAGE') {
            rawBody.type = PrismaSectionType.DIAGRAM;
        }

        // 2. Validate with Zod
        const validation = SectionValidationSchema.safeParse(rawBody);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: "Invalid section data",
                    details: validation.error.flatten().fieldErrors
                },
                { status: 400 },
            );
        }

        const validatedData = validation.data;

        // 3. Check Database Authorization & get document info
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                group: {
                    include: {
                        members: {
                            where: { userId: user.id },
                        },
                    },
                },
                document: {
                    include: {
                        sections: {
                            select: { order: true },
                        },
                    },
                },
            },
        });

        if(!project || !project.document) {
            return NextResponse.json(
                { error: "Missing document for this project" },
                { status: 404 },
            );
        }

        const membership = project.group.members[0];
        if(!membership || !SECTION_CREATION_AUTHORIZED_ROLES.includes(membership.role as GroupRole)) {
            return NextResponse.json(
                { error: "You are not authorized to create sections" },
                { status: 403 }
            );
        }

        // 4. Calculate next section order
        const existingOrders = project.document.sections.map((s) => s.order);
        const nextOrder = existingOrders.length ? Math.max(...existingOrders) + 1 : 1;

        // 5. Extract fields safely depending on the discriminated union result
        const content = 'content' in validatedData ? validatedData.content : null;
        const imageUrl = 'imageUrl' in validatedData ? validatedData.imageUrl : null;
        const mermaidCode = 'mermaidCode' in validatedData ? validatedData.mermaidCode : null;
        const altText = 'altText' in validatedData ? validatedData.altText : null;

        // 6. Create in DB
        const createdSection = await prisma.section.create({
            data: {
                documentId: project.document.id,
                type: validatedData.type,
                title: validatedData.title,
                description: validatedData.description ?? null,
                content: content ?? null,
                imageUrl: imageUrl ?? null,
                mermaidCode: mermaidCode ?? null,
                altText: altText ?? null,
                order: nextOrder,
                isRequired: false,
                isUnique: false,
            },
        });

        return NextResponse.json(
            { section: createdSection, message: "Section created successfully" },
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