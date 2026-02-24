import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {prisma} from "@/app/lib/db";
import {GroupRole, Role} from "@/app/types";


export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                members: {
                    where: { userId: user.id },
                    select: {
                        id: true,
                        role: true
                    },
                },
            },
        });

        return NextResponse.json(
            { groups, message: "Groups retrieved successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const MAX_BASE_USER_GROUP_NUM = 3;

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 }
            );
        }

        if(user.role === Role.BASE_USER) {
            const groupMembershNum = await prisma.groupMember.count({
                where: {
                    userId: user.id,
                    role: GroupRole.OWNER,
                }
            });

            if(groupMembershNum >= MAX_BASE_USER_GROUP_NUM) {
                return NextResponse.json(
                    { error: "You cannot create any more Group, consider Upgrading" },
                    { status: 403 }
                );
            }
        }

        const { title, description } = await request.json();
        const desc = description || `${user.name}'s group`;

        if(!title) {
            return NextResponse.json(
                { error: "Invalid title for this group" },
                { status: 400 }
            );
        }

        const group = await createGroup({
            name: title,
            description: desc,
            userId: user.id,
        });

        return NextResponse.json(
            { group, message: "Group created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 }
        );
    }
}

const createGroup = async (data: { name: string, description: string, userId: string} ) => {
    let group;
    let retries = 0;
    const MAX_RETRIES = 5;

    while(!group && retries < MAX_RETRIES) {
        try {
            const code = generateCode(data.name);

            group = await prisma.group.create({
                data: {
                    name: data.name,
                    description: data.description,
                    code: code,
                    members: {
                        create: {
                            userId: data.userId,
                            role: GroupRole.OWNER
                        },
                    },
                },
            });
        } catch (error) {
            retries++;
            console.warn(`Code collision in the database (${retries})/${MAX_RETRIES}}). Retrying...`);
        }
    }

    return group;
}

const generateCode = (title: string) => {
    const prefix = (title.slice(0, 2)|| 'GR').toUpperCase();

    const randomNum = Math.floor(1000 + Math.random() * 9000)

    return `${prefix}${randomNum}`;
}