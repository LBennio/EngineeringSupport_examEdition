import {NextRequest, NextResponse} from "next/server";
import {checkUserPermission, getCurrentUser} from "@/app/lib/auth";
import {GroupRole, Role} from "@/app/types";
import {prisma} from "@/app/lib/db";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ userId: string }>}
){
    try {
        // get the user you want to add to a group and the role you want to give him
        const { userId } = await context.params;
        const user = await getCurrentUser();

        // if the user is not authenticated OR the user is not an ADMIN
        if(!user || !checkUserPermission(user, Role.ADMIN)) {
            return NextResponse.json(
                { error: "You do not have the perms to update data on a user" },
                { status: 401 }
            );
        }

        // get the group to add the user to, using HTTP parameters
        const { groupId, groupRole } = await request.json();

        // if the group exists
        if(groupId) {
            // get the group corresponding to the id
            const group = await prisma.group.findUnique({
                where: { id: groupId },
            });

            // if the group does not exist, "throw an error"
            if(!group) {
                return NextResponse.json(
                    { error: "Group not found" },
                    { status: 404 }
                );
            }
        }

        // check if a membership linked to the same group exists, for this user
        const existingMembership = await prisma.groupMember.findFirst({
            where: {
                userId,
                groupId,
            },
        });

        // if the membership exists, no need to add the user, so "throw an error"
        if(existingMembership) {
            return NextResponse.json(
                { error: "This user is already a member of this group" },
                { status: 409 },
            );
        }

        // create a membership between a user and a group
        const membership = await prisma.groupMember.create({
            data: {
                userId,
                groupId,
                role: groupRole,
            }
        });

        // update the data of a user, to add a new membership
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memberships: {
                    include: {
                        group: true,
                    },
                },
            }
        });

        if(!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                user: updatedUser,
                message: groupId ? "User assigned to group successfully" : "User removed from a group successfully",
            }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}