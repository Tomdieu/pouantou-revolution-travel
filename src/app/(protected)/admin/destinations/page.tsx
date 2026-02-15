import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DestinationsTable } from '@/components/admin/DestinationsTable';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Destinations</h1>
                    <p className="text-slate-500 mt-2">Gérez les destinations populaires ({destinations.length}).</p>
                </div>
                <Link href="/admin/destinations/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Destination
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{destinations.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Populaires</CardTitle>
                        <MapPin className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{destinations.filter((d: Destination) => d.isPopular).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actives</CardTitle>
                        <MapPin className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{destinations.filter((d: Destination) => d.isActive).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactives</CardTitle>
                        <MapPin className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{destinations.filter((d: Destination) => !d.isActive).length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-white">
                <DestinationsTable destinations={destinations} />
            </div>
        </div>
    );
}
