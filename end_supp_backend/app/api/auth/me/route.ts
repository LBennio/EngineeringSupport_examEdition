import {getCurrentUser} from "@/app/lib/auth";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "you are not authenticated"},
                { status: 401 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}