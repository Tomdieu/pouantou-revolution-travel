import { DestinationForm } from '@/components/admin/DestinationForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function EditDestinationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const { id } = await params;

    const destination = await prisma.destination.findUnique({
        where: { id },
    });

    if (!destination) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modifier la Destination</h1>
                    <p className="text-slate-500 mt-2">{destination.name}, {destination.country}</p>
                </div>
                <Link href="/admin/destinations">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="bg-white">
                <DestinationForm
                    mode="edit"
                    initialData={{
                        id: destination.id,
                        name: destination.name,
                        country: destination.country,
                        description: destination.description,
                        price: destination.price,
                        currency: destination.currency,
                        imageUrl: destination.imageUrl,
                        emoji: destination.emoji,
                        badge: destination.badge,
                        isPopular: destination.isPopular,
                        isActive: destination.isActive,
                        order: destination.order,
                    }}
                />
            </div>
        </div>
    );
}
