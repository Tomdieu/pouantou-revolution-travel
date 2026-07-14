'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const reviewSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    jobTitle: z.string().min(2, "Le titre du poste est requis"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    stars: z.number().min(1).max(5),
});

export async function createReview(values: z.infer<typeof reviewSchema>) {
    const session = await auth();

    const validatedFields = reviewSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Données invalides" };
    }

    const { name, jobTitle, phone, description, stars } = validatedFields.data;

    if (!prisma.review) {
        return { error: "Système d'avis momentanément indisponible. Veuillez réessayer plus tard." };
    }

    try {
        await prisma.review.create({
            data: {
                name: session?.user?.name || name,
                jobTitle,
                phone,
                description,
                stars,
                userId: session?.user?.id || null,
                isModerated: false, // Moderated by default
            },
        });

        return { success: "Merci pour votre avis ! Il sera visible après modération." };
    } catch (error) {
        console.error('Create review error:', error);
        return { error: "Une erreur est survenue lors de l'envoi de votre avis." };
    }
}

export async function getApprovedReviews() {
    if (!prisma.review) {
        console.error('Prisma review model not found in client');
        return [];
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { isModerated: true },
            select: {
                id: true,
                name: true,
                jobTitle: true,
                description: true,
                stars: true,
                createdAt: true,
                user: {
                    select: {
                        image: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return reviews;
    } catch (error) {
        console.error('Get approved reviews error:', error);
        return [];
    }
}

export async function toggleReviewStatus(id: string) {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        return { error: "Non autorisé" };
    }

    try {
        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) return { error: "Avis non trouvé" };

        await prisma.review.update({
            where: { id },
            data: { isModerated: !review.isModerated },
        });

        revalidatePath('/admin/reviews');
        revalidatePath('/');
        return { success: "Statut mis à jour" };
    } catch (error) {
        console.error('Toggle review status error:', error);
        return { error: "Une erreur est survenue." };
    }
}

export async function deleteReview(id: string) {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        return { error: "Non autorisé" };
    }

    try {
        await prisma.review.delete({
            where: { id },
        });

        revalidatePath('/admin/reviews');
        revalidatePath('/');
        return { success: "Avis supprimé" };
    } catch (error) {
        console.error('Delete review error:', error);
        return { error: "Une erreur est survenue lors de la suppression." };
    }
}
