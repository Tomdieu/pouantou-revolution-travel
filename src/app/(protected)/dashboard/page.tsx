import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingList } from '@/components/dashboard/BookingList';
import { Plane, Clock, CheckCircle2, PartyPopper } from 'lucide-react';
import ServicesSection from '@/components/ServicesSection';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        redirect('/login');
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    type Booking = typeof bookings[number];
    const bookingsWithParsedDetails = bookings.map((booking: Booking) => ({
        ...booking,
        searchDetails: JSON.parse(booking.searchDetails),
    }));

    const stats = [
        {
            label: 'Total',
            value: bookings.length,
            icon: Plane,
        },
        {
            label: 'En attente',
            value: bookings.filter((b) => b.status === 'PENDING').length,
            icon: Clock,
        },
        {
            label: 'Confirmées',
            value: bookings.filter((b) => b.status === 'CONFIRMED').length,
            icon: CheckCircle2,
        },
        {
            label: 'Terminées',
            value: bookings.filter((b) => b.status === 'COMPLETED').length,
            icon: PartyPopper,
        },
    ];

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <stat.icon className="h-4 w-4 text-slate-400" />
                                <span className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</span>
                            </div>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Services */}
                <div id="services-hub">
                    <ServicesSection isDashboard userId={session.user.id} />
                </div>

                {/* Bookings */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            Mes réservations
                        </h2>
                        <span className="text-sm text-slate-400">
                            {bookings.length} demande{bookings.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <BookingList bookings={bookingsWithParsedDetails} />
                </div>
            </div>
        </main>
    );
}
