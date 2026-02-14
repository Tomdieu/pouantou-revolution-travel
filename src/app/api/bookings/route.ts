import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a booking
const createBookingSchema = z.object({
    type: z.enum(['FLIGHT', 'HOTEL', 'CAR_RENTAL']),
    searchDetails: z.record(z.any()), // JSON object with search details
    price: z.number().optional(),
    currency: z.string().optional(),
    contactName: z.string().min(2),
    contactEmail: z.string().email(),
    contactPhone: z.string().optional(),
    notes: z.string().optional(),
});

// GET /api/bookings - Get all bookings (user's own or all for admin)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        // Build query based on user role
        const where: any = {};

        // Non-admin users can only see their own bookings
        if (session.user.role !== 'ADMIN') {
            where.userId = session.user.id;
        }

        // Filter by type if provided
        if (type && ['FLIGHT', 'HOTEL', 'CAR_RENTAL'].includes(type)) {
            where.type = type;
        }

        // Filter by status if provided
        if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Parse searchDetails JSON for each booking
        const bookingsWithParsedDetails = bookings.map(booking => ({
            ...booking,
            searchDetails: JSON.parse(booking.searchDetails),
        }));

        return NextResponse.json({
            success: true,
            bookings: bookingsWithParsedDetails,
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des réservations' },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createBookingSchema.parse(body);

        // Verify user exists in database and get correct ID
        let dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        // Fallback: search by email if ID not found (handles stale session tokens)
        if (!dbUser && session.user.email) {
            dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
            });
        }

        if (!dbUser) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé dans la base de données. Veuillez vous reconnecter.' },
                { status: 404 }
            );
        }

        const userId = dbUser.id;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: userId,
                type: validatedData.type,
                searchDetails: JSON.stringify(validatedData.searchDetails),
                price: validatedData.price,
                currency: validatedData.currency || 'EUR',
                contactName: validatedData.contactName,
                contactEmail: validatedData.contactEmail,
                contactPhone: validatedData.contactPhone || '',
                notes: validatedData.notes,
                status: 'PENDING',
            },
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

        return NextResponse.json(
            {
                success: true,
                booking: {
                    ...booking,
                    searchDetails: JSON.parse(booking.searchDetails),
                },
                message: 'Réservation créée avec succès',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating booking:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création de la réservation' },
            { status: 500 }
        );
    }
}
