import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/lib/auth";
import {Role} from "@/app/types";
import {prisma} from "@/app/lib/db";

export async function GET(request: NextRequest) {
    const LATEST_DATE_OFFSET = 30; // days.

    try {
        const user = await getCurrentUser();

        if(!user) {
            return NextResponse.json(
                { error: "You are not authenticated" },
                { status: 401 },
            );
        }

        if(user.role !== Role.ADMIN) {
            return NextResponse.json(
                { error: "You are not authorized to access these informations" },
                { status: 403 },
            );
        }

        const latestMark = new Date();
        latestMark.setDate(latestMark.getDate() - LATEST_DATE_OFFSET);

        const [
            totalUsers,
            newUsers,
            usersByRole,
            totalGroups,
            totalProjects
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: latestMark
                    },
                },
            }),
            prisma.user.groupBy({
                by: ['role'] as const,
                _count: {
                    role: true
                },
            }),
            prisma.group.count(),
            prisma.project.count(),
        ]);

        const roleStats = usersByRole.reduce((acc, curr) => {
            acc[curr.role] = curr._count.role;
            return acc;
        }, {} as Record<string, number>);

        const averageProjectsPerGroup = totalGroups > 0
            ? (totalProjects / totalGroups).toFixed(2)
            : 0;

        const startCount = totalUsers - newUsers;

        return NextResponse.json(
            {
                overview: {
                totalUsers,
                newUsersLastMark: newUsers,
                growthRate: totalUsers > 0 ? ((newUsers / startCount) * 100).toFixed(2) + "%" : "100%",
            },
                business: {
                    roleDistribution: roleStats,
                    totalGroups,
                    totalProjects,
                    averageProjectsPerGroup,
                },
                message: "Admin statistics retrieved successfully"
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error: ", error);

        return NextResponse.json(
            { error: "Internal server error, something went wrong" },
            { status: 500 },
        );
    }
}