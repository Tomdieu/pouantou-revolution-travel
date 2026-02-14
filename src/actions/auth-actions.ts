'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/emailService';
import { render } from '@react-email/render';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import React from 'react';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export async function forgotPassword(formData: FormData) {
    const email = formData.get('email') as string;

    const validatedFields = forgotPasswordSchema.safeParse({ email });

    if (!validatedFields.success) {
        return { error: 'Email invalide' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // We don't want to reveal if a user exists or not for security reasons
        if (!user) {
            return { success: true };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

        // Ensure the model exists in the client
        if (!prisma.passwordResetToken) {
            throw new Error('Prisma client not initialized with PasswordResetToken. Please restart the dev server.');
        }

        await prisma.passwordResetToken.upsert({
            where: { token },
            update: { token, expires },
            create: { email, token, expires },
        });

        const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const emailHtml = await render(
            React.createElement(ResetPasswordEmail, {
                resetLink,
                userName: user.name || undefined,
            })
        );

        await sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: emailHtml,
        });

        return { success: true };
    } catch (error) {
        console.error('Forgot password error:', error);
        return { error: 'Une erreur est survenue lors de l\'envoi de l\'email' };
    }
}

export async function resetPassword(values: z.infer<typeof resetPasswordSchema>) {
    const validatedFields = resetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Données invalides' };
    }

    const { token, password } = validatedFields.data;

    try {
        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return { error: 'Jeton de réinitialisation invalide' };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return { error: 'Jeton de réinitialisation expiré' };
        }

        const user = await prisma.user.findUnique({
            where: { email: existingToken.email },
        });

        if (!user) {
            return { error: 'Utilisateur non trouvé' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });

        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { error: 'Une erreur est survenue lors de la réinitialisation' };
    }
}

const updatePhoneSchema = z.object({
    phone: z.string().min(1, 'Le numéro de téléphone est requis'),
});

export async function updateUserPhone(userId: string, phone: string) {
    const validatedFields = updatePhoneSchema.safeParse({ phone });

    if (!validatedFields.success) {
        return { error: 'Numéro de téléphone invalide' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { phone },
        });

        return { success: true };
    } catch (error) {
        console.error('Update phone error:', error);
        return { error: 'Une erreur est survenue lors de la mise à jour du numéro de téléphone' };
    }
}
