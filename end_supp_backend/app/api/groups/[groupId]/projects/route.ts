import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { Prisma, GroupRole, Role } from "@prisma/client";
import { prisma } from "@/app/lib/db";

const PROJECT_CREATE_ALLOWED = new Set<GroupRole>([
  GroupRole.OWNER,
  GroupRole.PRODUCT_MANAGER,
]);

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
          { error: "You are not authenticated" },
          { status: 401 }
      );
    }

    const memberships = await prisma.groupMember.findMany({
      where: {
        userId: user.id,
      },
      select: { groupId: true },
    });

    if (memberships.length === 0) {
      return NextResponse.json(
          { projects: [], message: "No group memberships found" },
          { status: 200 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // filter params
    const groupId = searchParams.get("groupId");
    const title = searchParams.get("title");

    // order params
    const createdAt = searchParams.get("createdAt");
    const updatedAt = searchParams.get("updatedAt");

    // as default, the projects to return will be ALL those in groups the user is member of
    const allowedGroupIds = memberships.map((member) => member.groupId);

    const where: Prisma.ProjectWhereInput = {
      // either a selected group or all the allowed ones
      groupId: groupId ? groupId : { in: allowedGroupIds },

      // IF title is not empty, then filter by the title as well
      ...(title && { title }),
    };

    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [];

    if (createdAt)
      orderBy.push({
        createdAt: createdAt.toLowerCase() === "asc" ? "asc" : "desc",
      });
    if (updatedAt)
      orderBy.push({
        updatedAt: updatedAt.toLowerCase() === "asc" ? "asc" : "desc",
      });

    const projects = await prisma.project.findMany({
      where,
      orderBy: orderBy.length ? orderBy : undefined,
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Error: ", error);

    return NextResponse.json(
        { error: "Internal server error, something went wrong" },
        { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const MAX_BASE_USER_PROJECTS_PER_GROUP = 5;

    if (!user) {
      return NextResponse.json(
          { error: "You are not authenticated" },
          { status: 401 }
      );
    }

    const body = await request.json();
    const title = (body.title ?? body.name ?? "").toString().trim();
    const description = (body.description ?? "").toString();
    const requestedGroupId = (body.groupId ?? "").toString().trim();

    if (!title) {
      return NextResponse.json({ error: "Missing project title" }, { status: 400 });
    }

    // Resolve group
    const groupId = await resolveGroupIdForProjectCreation({
      userId: user.id,
      requestedGroupId: requestedGroupId || undefined,
    });

    // Authorization: must be OWNER or PRODUCT_MANAGER in that group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId: user.id, groupId },
      },
      select: { role: true },
    });

    if (!membership || !PROJECT_CREATE_ALLOWED.has(membership.role)) {
      return NextResponse.json(
          { error: "You are not authorized to create projects in this group" },
          { status: 403 }
      );
    }

    // Plan/limits
    if (user.role === Role.BASE_USER) {
      const currentProjectsInGroup = await prisma.project.count({
        where: { groupId },
      });

      if (currentProjectsInGroup >= MAX_BASE_USER_PROJECTS_PER_GROUP) {
        return NextResponse.json(
            { error: "Project limit reached for your plan. Consider upgrading." },
            { status: 403 }
        );
      }
    }

    // Create project (and default document)
    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        groupId,
        document: {
          create: {
            title,
            version: "1.0.0",
          },
        },
      },
      include: {
        document: true,
      },
    });

    return NextResponse.json(
        { project, message: "Project created successfully" },
        { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === "USER_NOT_IN_GROUP") {
      return NextResponse.json(
          { error: "You are not part of the selected group" },
          { status: 403 }
      );
    }
    // Prisma unique constraint (groupId + title)
    if (error?.code === "P2002") {
      return NextResponse.json(
          { error: "A project with this title already exists in the group" },
          { status: 409 }
      );
    }

    console.error("Error: ", error);
    return NextResponse.json(
        { error: "Internal server error, something went wrong" },
        { status: 500 }
    );
  }
}

async function resolveGroupIdForProjectCreation(opts: {
  userId: string;
  requestedGroupId?: string;
}): Promise<string> {
  const { userId, requestedGroupId } = opts;

  if (requestedGroupId) {
    // Ensure membership exists
    const m = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId: requestedGroupId },
      },
      select: { id: true },
    });
    if (!m) {
      throw new Error("USER_NOT_IN_GROUP");
    }
    return requestedGroupId;
  }

  // Prefer an owned group
  const owned = await prisma.groupMember.findFirst({
    where: { userId, role: GroupRole.OWNER },
    select: { groupId: true },
    orderBy: { groupId: "asc" },
  });

  if (owned) return owned.groupId;

  // Fallback: first membership
  const anyMembership = await prisma.groupMember.findFirst({
    where: { userId },
    select: { groupId: true },
    orderBy: { groupId: "asc" },
  });

  if (anyMembership) return anyMembership.groupId;

  // No groups at all: auto-create a default one
  const code = generateCode("My");
  const group = await prisma.group.create({
    data: {
      name: "My Group",
      description: "Default group",
      code,
      members: {
        create: {
          userId,
          role: GroupRole.OWNER,
        },
      },
    },
    select: { id: true },
  });

  return group.id;
}

function generateCode(title: string) {
  const prefix = (title.slice(0, 2) || "GR").toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}