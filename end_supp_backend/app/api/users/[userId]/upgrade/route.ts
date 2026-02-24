import {NextRequest, NextResponse} from "next/server";
import Stripe from "stripe";
import {getCurrentUser} from "@/app/lib/auth";

const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY!;
const stripe = new Stripe(STRIPE_PRIVATE_KEY);

export async function POST(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const { userId } = await context.params;

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: user.email,

            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],

            success_url: `${process.env.FRONTEND_URL}/auth/me`,
            cancel_url: `${process.env.FRONTEND_URL}/auth/me`,

            metadata: {
                userId: userId,
                action: 'upgrade_role',
            },
        });

        return NextResponse.json(
            { url: stripeSession.url },
        );
    } catch (error) {
        console.error('Error: ', error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 },
        );
    }
}
