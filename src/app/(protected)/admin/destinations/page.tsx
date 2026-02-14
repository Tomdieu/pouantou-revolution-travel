import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DestinationsTable } from '@/components/admin/DestinationsTable';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDestinationsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Fetch all destinations
    const destinations = await prisma.destination.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    type Destination = typeof destinations[number];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Gestion des Destinations</h1>
                                <p className="text-sm text-purple-100">Gérez les destinations populaires</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button variant="secondary">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour Admin
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="text-sm text-gray-600 mb-1">Total</div>
                        <div className="text-3xl font-bold text-gray-900">{destinations.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="text-sm text-gray-600 mb-1">Populaires</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {destinations.filter((d: Destination) => d.isPopular).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="text-sm text-gray-600 mb-1">Actives</div>
                        <div className="text-3xl font-bold text-green-600">
                            {destinations.filter((d: Destination) => d.isActive).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="text-sm text-gray-600 mb-1">Inactives</div>
                        <div className="text-3xl font-bold text-gray-400">
                            {destinations.filter((d: Destination) => !d.isActive).length}
                        </div>
                    </div>
                </div>

                {/* Destinations Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Toutes les Destinations</h2>
                            <p className="text-sm text-gray-600 mt-1">Gérez les destinations affichées sur la page d'accueil</p>
                        </div>
                        <Link href="/admin/destinations/new">
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle Destination
                            </Button>
                        </Link>
                    </div>
                    <DestinationsTable destinations={destinations} />
                </div>
            </main>
        </div>
    );
}
