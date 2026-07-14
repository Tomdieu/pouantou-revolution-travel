import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = registerSchema.parse(body);

        // Check if user already exists by email or phone
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { phone: validatedData.phone || undefined },
                ],
            },
        });

        if (existingUser) {
            const isEmailConflict = existingUser.email === validatedData.email;
            return NextResponse.json(
                {
                    error: `Un compte avec cet ${isEmailConflict ? 'email' : 'numéro de téléphone'} existe déjà`,
                    field: isEmailConflict ? 'email' : 'phone'
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create user with default USER role
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                password: hashedPassword,
                role: 'USER', // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                user,
                message: 'Compte créé avec succès'
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création du compte' },
            { status: 500 }
        );
    }
}
