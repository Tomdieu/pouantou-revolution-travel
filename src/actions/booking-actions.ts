'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    try {
        const session = await auth();

        if (session?.user?.role !== 'ADMIN') {
            return { error: "Accès non autorisé" };
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
        });

        revalidatePath('/admin/bookings');
        revalidatePath('/admin/users'); // Also revalidate user page as it shows bookings

        return { success: true };
    } catch (error) {
        console.error("Error updating booking status:", error);
        return { error: "Erreur lors de la mise à jour du statut" };
    }
}

export async function updateBookingPrice(bookingId: string, price: number) {
    try {
        const session = await auth();

        if (session?.user?.role !== 'ADMIN') {
            return { error: "Accès non autorisé" };
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: { price },
        });

        revalidatePath('/admin/bookings');
        revalidatePath('/admin/users');

        return { success: true };
    } catch (error) {
        console.error("Error updating booking price:", error);
        return { error: "Erreur lors de la mise à jour du prix" };
    }
}
