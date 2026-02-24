import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { GroupRole } from "@prisma/client";

const SECTION_EDIT_ALLOWED = new Set<GroupRole>([
  GroupRole.OWNER,
  GroupRole.PRODUCT_MANAGER,
  GroupRole.SOFTWARE_ENGINEER,
]);

const SECTION_DELETE_ALLOWED = new Set<GroupRole>([
  GroupRole.OWNER,
  GroupRole.PRODUCT_MANAGER,
]);

export async function PATCH(
  request: NextRequest,
  context: { params: { projectId: string; sectionId: string } }
) {
  try {
    const user = await getCurrentUser();
    const { projectId, sectionId } = context.params;

    if (!user) {
      return NextResponse.json(
        { error: "You are not authenticated" },
        { status: 401 }
      );
    }

    const payload = await request.json();

    // Validate access + role
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        group: {
          projects: {
            some: { id: projectId },
          },
        },
      },
      select: { role: true },
    });

    if (!membership || !SECTION_EDIT_ALLOWED.has(membership.role)) {
      return NextResponse.json(
        { error: "You are not authorized to update sections" },
        { status: 403 }
      );
    }

    // Ensure the section belongs to the project document
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        document: {
          projectId,
        },
      },
      select: { id: true },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const updatable = {
      title: payload.title,
      description: payload.description,
      content: payload.content,
      imageUrl: payload.imageUrl,
      mermaidCode: payload.mermaidCode,
      altText: payload.altText,
      order: payload.order,
    };

    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updatable)) {
      if (v !== undefined) data[k] = v;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data,
    });

    return NextResponse.json(
      { section: updated, message: "Section updated successfully" },
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
  context: { params: { projectId: string; sectionId: string } }
) {
  try {
    const user = await getCurrentUser();
    const { projectId, sectionId } = context.params;

    if (!user) {
      return NextResponse.json(
        { error: "You are not authenticated" },
        { status: 401 }
      );
    }

    // Only owners / PM can delete sections
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        group: {
          projects: {
            some: { id: projectId },
          },
        },
      },
      select: { role: true },
    });

    if (!membership || !SECTION_DELETE_ALLOWED.has(membership.role)) {
      return NextResponse.json(
        { error: "You are not authorized to delete sections" },
        { status: 403 }
      );
    }

    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        document: { projectId },
      },
      select: { id: true },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await prisma.section.delete({ where: { id: sectionId } });

    return NextResponse.json(
      { message: "Section deleted successfully" },
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
