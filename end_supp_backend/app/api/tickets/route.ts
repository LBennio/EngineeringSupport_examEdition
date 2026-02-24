import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {Role} from "@/app/types";
import {prisma} from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if(!user || user.role !== Role.ADMIN) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const tickets = await prisma.ticket.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        surname: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(
            { tickets, message: "tickets retrieved successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal Server Error, something went wrong" },
            { status: 500 }
        );
    }
}