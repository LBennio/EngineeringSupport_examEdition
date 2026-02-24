import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";
import {generateToken, verifyPassword} from "@/app/lib/auth";

const cookieAge = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if( !email || !password ) {
            return NextResponse.json(
                { error: "Email or password are missing or invalid" },
                { status: 400 },
            );
        }

        const userFromDb = await prisma.user.findUnique({
            where: { email },
        });

        if(!userFromDb) {
            return NextResponse.json(
                { error: "invalid credentials" },
                { status: 401 },
            );
        }

        const isValidPassword = await verifyPassword(password, userFromDb.password);

        if(!isValidPassword) {
            return NextResponse.json(
                { error: "invalid credentials" },
                { status: 401 },
            );
        }

        const token = generateToken(userFromDb.id);

        const response = NextResponse.json(
            {
                user: {
                    id: userFromDb.id,
                    email: userFromDb.email,
                    name: userFromDb.name,
                    surname: userFromDb.surname,
                    role: userFromDb.role,
                    token
                }
            }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: cookieAge
        });

        // FE middleware defaults to "es_session". Keep both cookies for compatibility.
        response.cookies.set("es_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: cookieAge
        });

        return response;
    } catch (error) {
        console.error("error: ", error);

        return NextResponse.json(
            {
                error: "Internal server error, something went wrong",
                details: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}