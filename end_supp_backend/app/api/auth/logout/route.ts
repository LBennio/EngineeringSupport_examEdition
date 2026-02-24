import {NextResponse} from "next/server";

const cookieAge = 50;

export async function POST() {
    const response = NextResponse.json(
        { message: "User logged out successfully" },
        { status: 200 }
    );

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: cookieAge,
    });

    response.cookies.set("es_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: cookieAge,
    });

    return response;
}