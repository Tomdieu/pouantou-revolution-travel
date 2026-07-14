import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DestinationsTable } from '@/components/admin/DestinationsTable';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDestinationsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const destinations = await prisma.destination.findMany({
        orderBy: { order: 'asc' },
    });

    const popular = destinations.filter(d => d.isPopular).length;
    const active = destinations.filter(d => d.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                        Destinations
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {destinations.length} destination{destinations.length !== 1 ? 's' : ''}
                        {' · '}
                        {active} active{active !== 1 ? 's' : ''}
                        {' · '}
                        {popular} populaire{popular !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link href="/admin/destinations/new">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 text-sm font-medium">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Ajouter
                    </Button>
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <DestinationsTable destinations={destinations} />
            </div>
        </div>
    );
}
