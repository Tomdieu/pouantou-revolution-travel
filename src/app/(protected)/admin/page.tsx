import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingsTable } from '@/components/admin/BookingsTable';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/auth';

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Fetch all bookings
    const bookings = await prisma.booking.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Parse searchDetails JSON
    type Booking = typeof bookings[number];
    const bookingsWithParsedDetails = bookings.map((booking: Booking) => ({
        ...booking,
        searchDetails: JSON.parse(booking.searchDetails),
    }));

    // Calculate stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter((b: Booking) => b.status === 'PENDING').length,
        confirmed: bookings.filter((b: Booking) => b.status === 'CONFIRMED').length,
        completed: bookings.filter((b: Booking) => b.status === 'COMPLETED').length,
        cancelled: bookings.filter((b: Booking) => b.status === 'CANCELLED').length,
        flights: bookings.filter((b: Booking) => b.type === 'FLIGHT').length,
        hotels: bookings.filter((b: Booking) => b.type === 'HOTEL').length,
        carRentals: bookings.filter((b: Booking) => b.type === 'CAR_RENTAL').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
                                <p className="text-sm text-blue-100">Gestion des réservations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/admin/destinations">
                                <Button variant="secondary">
                                    Destinations
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="secondary">
                                    Mon Dashboard
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="secondary">
                                    Accueil
                                </Button>
                            </Link>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}
                            >
                                <Button type="submit" variant="secondary" className="text-red-600 hover:text-red-700">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Déconnexion
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <StatsOverview stats={stats} />

                {/* Bookings Table */}
                <div className="bg-white rounded-lg shadow-sm border mt-8">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Toutes les Réservations</h2>
                        <p className="text-sm text-gray-600 mt-1">Gérez toutes les demandes de réservation des clients</p>
                    </div>
                    <BookingsTable bookings={bookingsWithParsedDetails} />
                </div>
            </main>
        </div>
    );
}
