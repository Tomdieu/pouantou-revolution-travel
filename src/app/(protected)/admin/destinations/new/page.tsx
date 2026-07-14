import { DestinationForm } from '@/components/admin/DestinationForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function NewDestinationPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-8 w-full flex flex-col  overflow-y-auto flex-1 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nouvelle Destination</h1>
                    <p className="text-slate-500 mt-2">Ajoutez une nouvelle destination populaire.</p>
                </div>
                <Link href="/admin/destinations">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="">
                <DestinationForm mode="create" />
            </div>
        </div>
    );
}
