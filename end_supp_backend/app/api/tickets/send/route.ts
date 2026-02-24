import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { message } = await request.json();

        if(!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid ticket body" },
                { status: 400 }
            );
        }

        const ticket = await prisma.ticket.create({
            data: {
                message: message,
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        surname: true,
                    }
                }
            }
        })

        return NextResponse.json(
            { ticket, message: "Ticket registered successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}