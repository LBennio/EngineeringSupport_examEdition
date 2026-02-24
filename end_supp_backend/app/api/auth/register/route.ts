import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";
import {generateToken, hashPassword} from "@/app/lib/auth";
import {Role} from "@/app/types";
import {sendWelcomeEmail} from "@/app/lib/mail";

const DEFAULT_ROLE = Role.BASE_USER;
const cookieAge = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, surname, email, password } = body;

        if(!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email or password is empty or not valid" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(existingUser) {
            return NextResponse.json(
                { error: "User with this email address already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const userCount = await prisma.user.count({});
        const role = userCount === 0 ? Role.ADMIN : DEFAULT_ROLE;

        const user = await prisma.user.create({
            data: {
                name,
                surname,
                email,
                password: hashedPassword,
                role,
            },
        });

        try {
            console.log("Sending email");
            await sendWelcomeEmail(user.email);
        } catch (e) {
            console.error("User email error: ", e);
        }

        const token = generateToken(user.id);

        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role,
                token,
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: cookieAge,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            {
                error: "Internal server error, something went wrong",
                details: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}
