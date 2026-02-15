import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        const session = await auth();

        if (!session?.user || !session.user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone } = body;

        // Fetch user to check if they are an OAuth user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        const isOAuth = !user.password;

        const updateData: any = {};

        if (name) updateData.name = name;
        if (phone) {
            // Check if phone is already taken
            const existingUserPhone = await prisma.user.findUnique({
                where: { phone }
            });

            if (existingUserPhone && existingUserPhone.id !== session.user.id) {
                return new NextResponse('Phone number already in use', { status: 400 });
            }
            updateData.phone = phone;
        }

        // Only allow email update if not an OAuth user
        if (email && !isOAuth) {
            // Check if email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.id !== session.user.id) {
                return new NextResponse('Email already in use', { status: 400 });
            }
            updateData.email = email;
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('[PROFILE_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
