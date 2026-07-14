'use server';

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function trackVisit() {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // Simple check for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if visitor with this IP exists already today
        const existingVisit = await prisma.visitor.findFirst({
            where: {
                ip: ip,
                visitedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        if (!existingVisit) {
            // Rough country detection placeholder (implement real geoip if needed later)
            // For now, we just store null or maybe hardcode 'Unknown'

            await prisma.visitor.create({
                data: {
                    ip,
                    userAgent,
                    // country: ... (would need external API call here)
                },
            });
            // console.log(`New visitor tracked: ${ip}`);
        }
    } catch (error) {
        console.error("Error tracking visit:", error);
    }
}
