import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";
import crypto from 'crypto';
import {sendResetEmail} from "@/app/lib/mail";

// 15 min
const EXPIRE_TIME = 60 * 15 * 1000;

export async function POST(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { error: "Invalid JSON format" },
                { status: 400 }
            )
        }
        const { email } = body;

        if(!email) {
            return NextResponse.json(
                { error: "Email is required for this operation" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user) {
            return NextResponse.json(
                { message: "the user you're trying to reach does not exist" },
                { status: 404 }
            );
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + EXPIRE_TIME);

        await prisma.passwordReset.create({
            data: { userId: user.id, token, expiresAt }
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await sendResetEmail(user.email, resetLink);

        return NextResponse.json(
            { message: "If this email exists, a reset link will be sent to it." },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}