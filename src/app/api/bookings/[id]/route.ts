import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating booking status
const updateBookingSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    notes: z.string().optional(),
});

// GET /api/bookings/:id - Get a specific booking
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404 }
            );
        }

        // Check if user has permission to view this booking
        if (session.user.role !== 'ADMIN' && booking.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            booking: {
                ...booking,
                searchDetails: JSON.parse(booking.searchDetails),
            },
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la réservation' },
            { status: 500 }
        );
    }
}

// PATCH /api/bookings/:id - Update booking (status, price, notes)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if booking exists
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404 }
            );
        }

        // Check permissions
        const isAdmin = session.user.role === 'ADMIN';
        const isOwner = existingBooking.userId === session.user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = updateBookingSchema.parse(body);

        // Only admins can update status to CONFIRMED or COMPLETED
        if (
            validatedData.status &&
            ['CONFIRMED', 'COMPLETED'].includes(validatedData.status) &&
            !isAdmin
        ) {
            return NextResponse.json(
                { error: 'Seuls les administrateurs peuvent confirmer ou compléter une réservation' },
                { status: 403 }
            );
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: validatedData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            booking: {
                ...updatedBooking,
                searchDetails: JSON.parse(updatedBooking.searchDetails),
            },
            message: 'Réservation mise à jour avec succès',
        });
    } catch (error) {
        console.error('Error updating booking:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de la réservation' },
            { status: 500 }
        );
    }
}

// DELETE /api/bookings/:id - Cancel/delete booking
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if booking exists
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404 }
            );
        }

        // Check permissions
        const isAdmin = session.user.role === 'ADMIN';
        const isOwner = existingBooking.userId === session.user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        // Instead of deleting, update status to CANCELLED
        const cancelledBooking = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({
            success: true,
            booking: {
                ...cancelledBooking,
                searchDetails: JSON.parse(cancelledBooking.searchDetails),
            },
            message: 'Réservation annulée avec succès',
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'annulation de la réservation' },
            { status: 500 }
        );
    }
}
