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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/destinations">
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Modifier la Destination</h1>
                            <p className="text-sm text-purple-100">{destination.name}, {destination.country}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            </main>
        </div>
    );
}
