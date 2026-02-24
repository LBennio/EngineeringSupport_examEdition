import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";
import {hashPassword} from "@/app/lib/auth";

export async function POST(request: NextRequest) {
    // leggere la richiesta
    try {
        const {token, newPassword} = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                {error: "This token is invalid"},
                {status: 400}
            );
        }

        const resetRecord = await prisma.passwordReset.findUnique({
            where: {token},
            include: {user: true}
        });

        if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
            return NextResponse.json(
                {error: "Invalid or expired token"},
                {status: 400}
            )
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: {
                id: resetRecord.userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });

        return NextResponse.json(
            { message: "Password has been reset successfully"},
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        )
    }
}