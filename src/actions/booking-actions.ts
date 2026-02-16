'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/render";
import PriceUpdateEmail from "@/emails/PriceUpdateEmail";
import { sendEmail } from "@/lib/emailService";

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

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { price },
            include: {
                user: true,
            },
        });

        // Send email notification to client
        try {
            let bookingDetails = {};
            try {
                bookingDetails = JSON.parse(updatedBooking.searchDetails);
            } catch (e) {
                console.error("Failed to parse search details for email", e);
            }

            const emailHtml = await render(PriceUpdateEmail({
                fullName: updatedBooking.contactName,
                bookingId: updatedBooking.id,
                bookingType: updatedBooking.type,
                newPrice: updatedBooking.price || 0,
                currency: updatedBooking.currency || 'EUR',
                bookingDetails: bookingDetails,
            }));

            await sendEmail({
                to: updatedBooking.contactEmail,
                subject: `Mise à jour du tarif de votre réservation #${updatedBooking.id.slice(-8).toUpperCase()}`,
                html: emailHtml,
                text: `Bonjour ${updatedBooking.contactName}, le tarif de votre réservation #${updatedBooking.id.slice(-8).toUpperCase()} a été mis à jour à ${updatedBooking.price} ${updatedBooking.currency || 'EUR'}.`,
            });

            console.log('Price update notification email sent to:', updatedBooking.contactEmail);
        } catch (emailError) {
            console.error("Error sending price update email:", emailError);
            // We don't return error here as the DB update was successful
        }

        revalidatePath('/admin/bookings');
        revalidatePath('/admin/users');

        return { success: true };
    } catch (error) {
        console.error("Error updating booking price:", error);
        return { error: "Erreur lors de la mise à jour du prix" };
    }
}
