import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        const body = await req.json();
        const { type, searchDetails } = body;

        if (!type || !searchDetails) {
            return NextResponse.json({ success: false, error: 'Missing type or searchDetails' }, { status: 400 });
        }

        const log = await prisma.searchLog.create({
            data: {
                userId: session?.user?.id || null,
                type,
                searchDetails: typeof searchDetails === 'string' ? searchDetails : JSON.stringify(searchDetails),
            },
        });

        return NextResponse.json({ success: true, data: log });
    } catch (error) {
        console.error('Error logging search:', error);
        return NextResponse.json({ success: false, error: 'Failed to log search' }, { status: 500 });
    }
}
