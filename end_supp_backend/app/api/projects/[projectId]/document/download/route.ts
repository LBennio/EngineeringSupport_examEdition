import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { renderToStream } from "@react-pdf/renderer";
import { ProjectDocumentPdf } from "@/app/components/pdf/ProjectDocumentPdf";
import React from 'react';

export async function GET(
    request: NextRequest,
    context: { params: { projectId: string } }
) {

    try {
        const { projectId } = await context.params;
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const documentData = await prisma.document.findFirst({
            where: {
                projectId,
                project: {
                    group: {
                        members: {
                            some: { userId: user.id }
                        },
                    },
                },
            },
            include: {
                project: {
                    select: { title: true, groupId: true },
                },
                sections: {
                    orderBy: { order: 'asc' },
                    include: {
                        backlogItems: {
                            include: { useCase: true }
                        },
                    },
                },
                usecases: {
                    include: {
                        specification: true,
                    },
                },
            },
        });

        if(!documentData) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 },
            );
        }

        const stream = await renderToStream(
            React.createElement(ProjectDocumentPdf, { data: documentData } )
        );

        const pdfTitle = documentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${pdfTitle}_v${documentData.version}.pdf`;

        return new NextResponse(stream as any, {
            headers: {
                "Content-type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}