import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import { Prisma } from "@prisma/client";
import {prisma} from "@/app/lib/db";
import {GroupRole, Role} from "@/app/types";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 },
            );
        }

        const memberships = await prisma.groupMember.findMany({
            where: {
                userId: user.id,
            }
        })

        if(memberships.length === 0) {
            return NextResponse.json(
                { projects: [], message: "No group memberships found" },
                { status: 200 },
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
            ...(title && {title}),
        };

        const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [];

        if(createdAt) orderBy.push({ createdAt: createdAt.toLowerCase() === 'asc' ? 'asc' : 'desc'});
        if(updatedAt) orderBy.push({ updatedAt: updatedAt.toLowerCase() === 'asc' ? 'asc' : 'desc'});

        const projects = await prisma.project.findMany({
            where,
            orderBy: orderBy.length ? orderBy : undefined,
        });

        return NextResponse.json(
            { projects },
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