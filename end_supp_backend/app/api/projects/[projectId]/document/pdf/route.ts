import { NextRequest, NextResponse } from "next/server";

/**
 * Compatibility route.
 * Some FE versions call /api/projects/:projectId/pdf.
 * We redirect to the canonical PDF endpoint.
 */
export async function GET(
    request: NextRequest,
    context: { params: { projectId: string } }
) {
    const { projectId } = context.params;
    const url = new URL(`/api/projects/${projectId}/document/download`, request.url);
    return NextResponse.redirect(url, { status: 307 });
}
