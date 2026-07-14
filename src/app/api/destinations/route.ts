import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating/updating a destination
const destinationSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
    description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
    price: z.number().positive('Le prix doit être positif'),
    currency: z.string().default('FCFA'),
    imageUrl: z.string().url('URL invalide').optional().nullable(),
    emoji: z.string().optional().nullable(),
    badge: z.string().optional().nullable(),
    isPopular: z.boolean().default(false),
    isActive: z.boolean().default(true),
    order: z.number().int().default(0),
});

// GET /api/destinations - Get all destinations (with optional filters)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const popular = searchParams.get('popular');
        const active = searchParams.get('active');
        const limit = searchParams.get('limit');

        // Build query filters
        const where: any = {};

        if (popular === 'true') {
            where.isPopular = true;
        }

        if (active === 'true' || active === null) {
            // By default, only show active destinations
            where.isActive = true;
        }

        const destinations = await prisma.destination.findMany({
            where,
            orderBy: {
                order: 'asc',
            },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json({
            success: true,
            destinations,
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des destinations' },
            { status: 500 }
        );
    }
}

// POST /api/destinations - Create a new destination (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé - Accès administrateur requis' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = destinationSchema.parse(body);

        const destination = await prisma.destination.create({
            data: validatedData,
        });

        return NextResponse.json(
            {
                success: true,
                destination,
                message: 'Destination créée avec succès',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating destination:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création de la destination' },
            { status: 500 }
        );
    }
}
