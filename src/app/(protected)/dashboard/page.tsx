import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingList } from '@/components/dashboard/BookingList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plane, Clock, CheckCircle2, PartyPopper, ShieldCheck } from 'lucide-react';
import { DashboardHeader } from './_components/DashboardHeader';
import ServicesSection from '@/components/ServicesSection';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        redirect('/login');
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
        where: {
            userId: session.user.id,
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

    const stats = [
        {
            label: 'Total Réservations',
            value: bookings.length,
            icon: Plane,
            color: 'text-blue-600',
        },
        {
            label: 'En attente',
            value: bookings.filter((b) => b.status === 'PENDING').length,
            icon: Clock,
            color: 'text-yellow-600',
        },
        {
            label: 'Confirmées',
            value: bookings.filter((b) => b.status === 'CONFIRMED').length,
            icon: CheckCircle2,
            color: 'text-green-600',
        },
        {
            label: 'Terminées',
            value: bookings.filter((b) => b.status === 'COMPLETED').length,
            icon: PartyPopper,
            color: 'text-indigo-600',
        },
    ];

    const userForHeader = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <Card key={idx}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Services Hub (New Request Section) */}
                <div id="services-hub">
                    <ServicesSection isDashboard userId={session.user.id} />
                </div>

                {/* Booking List Container */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Plane className="h-5 w-5 text-blue-600" />
                                Mes Réservations
                            </CardTitle>
                            <Badge variant="secondary">
                                {bookings.length} Demandes
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <BookingList bookings={bookingsWithParsedDetails} />
                </Card>
            </div>
        </main>
    );
}
