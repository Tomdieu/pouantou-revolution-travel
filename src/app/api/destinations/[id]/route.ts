import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a destination
const updateDestinationSchema = z.object({
    name: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    price: z.number().positive().optional(),
    currency: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
    emoji: z.string().optional().nullable(),
    badge: z.string().optional().nullable(),
    isPopular: z.boolean().optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
});

// GET /api/destinations/:id - Get a specific destination
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const destination = await prisma.destination.findUnique({
            where: { id },
        });

        if (!destination) {
            return NextResponse.json(
                { error: 'Destination non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            destination,
        });
    } catch (error) {
        console.error('Error fetching destination:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la destination' },
            { status: 500 }
        );
    }
}

// PATCH /api/destinations/:id - Update destination (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé - Accès administrateur requis' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Check if destination exists
        const existingDestination = await prisma.destination.findUnique({
            where: { id },
        });

        if (!existingDestination) {
            return NextResponse.json(
                { error: 'Destination non trouvée' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = updateDestinationSchema.parse(body);

        const updatedDestination = await prisma.destination.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json({
            success: true,
            destination: updatedDestination,
            message: 'Destination mise à jour avec succès',
        });
    } catch (error) {
        console.error('Error updating destination:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de la destination' },
            { status: 500 }
        );
    }
}

// DELETE /api/destinations/:id - Delete destination (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé - Accès administrateur requis' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Check if destination exists
        const existingDestination = await prisma.destination.findUnique({
            where: { id },
        });

        if (!existingDestination) {
            return NextResponse.json(
                { error: 'Destination non trouvée' },
                { status: 404 }
            );
        }

        await prisma.destination.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Destination supprimée avec succès',
        });
    } catch (error) {
        console.error('Error deleting destination:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression de la destination' },
            { status: 500 }
        );
    }
}
