import {NextRequest, NextResponse} from "next/server";
import {checkUserPermission, getCurrentUser} from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ userId: string }>}
) {
    /*
    try {
        const { userId } = await context.params;
        const currentUser = await getCurrentUser();

        if(!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
            return NextResponse.json(
                { error: "You do not have the perms to update data on a user" },
                { status: 401 }
            );
        }

        if(userId === currentUser.id) {
            return NextResponse.json(
                { error: "You cannot change your own role" },
            );
        }

        const { role } = await request.json();

        const validRoles = [Role.SOFTWAREENGINEER, Role.PRODUCTMANAGER];

        if(!validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid role or multiple roles assigned at the same time" },
                { status: 404 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            include: { group: true }
        });

        return NextResponse.json(
            {
                user: updatedUser,
                message: `User role updated to ${role} successfully`,
            },
        );
    } catch (error) {
        console.error("Error: ", error);

        if(error instanceof Error && error.message.includes("Record to update not found")) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error, something went wrong"},
            { status: 500 }
        );
    }
     */
}
