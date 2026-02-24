import Stripe from "stripe";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import {prisma} from "@/app/lib/db";
import {Role} from "@prisma/client";

// Support both env names (STRIPE_PRIVATE_KEY is used elsewhere in this repo)
const STRIPE_SECRET_KEY = (process.env.STRIPE_PRIVATE_KEY || process.env.STRIPE_SECRET_KEY)!;
const STRIPE_WEBHOOK_KEY = process.env.STRIPE_WEBHOOK_SECRET_KEY!;

const stripe = new Stripe(STRIPE_SECRET_KEY);
const webhookSecret = STRIPE_WEBHOOK_KEY;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error("Webhook signature verification failed", error);

        return NextResponse.json(
            { error: "Internal Server error, something went wrong" },
            { status: 500 },
        );
    }

    switch( event.type ) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.userId;
            const action = session.metadata?.action;

            if(userId && action === 'upgrade_role') {
                console.log(`Payment success, upgrading user ${userId}`);

                try {
                    await prisma.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            role: Role.UPGRADED_USER,
                        }
                    })

                    console.log(`User ${userId} successfully updated`);
                } catch (error) {
                    console.error("Error: ", error);

                    return NextResponse.json(
                        { error: "Internal Server error, something went wrong" },
                        { status: 400 },
                    );
                }
            }

            break;
        }

        case 'customer.subscription.deleted': {
            const session = event.data.object as Stripe.Subscription;

            console.log('Canceled user subscritpion');
            break;
        }

        default: {
            console.log(`unhandled event type ${event.type}`);
        }
    }

    return NextResponse.json(
        { message: "upgrade request carried on" },
        { status: 200 }
    );
}