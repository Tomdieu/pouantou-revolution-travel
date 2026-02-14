import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Fetch user to check password and OAuth status
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        if (!user.password) {
            return new NextResponse('OAuth users cannot change password', { status: 400 });
        }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordsMatch) {
            return new NextResponse('Mot de passe actuel incorrect', { status: 403 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return new NextResponse('Password updated successfully', { status: 200 });
    } catch (error) {
        console.error('[PASSWORD_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
