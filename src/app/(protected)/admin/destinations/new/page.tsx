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
                            <h1 className="text-2xl font-bold">Nouvelle Destination</h1>
                            <p className="text-sm text-purple-100">Ajoutez une nouvelle destination populaire</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DestinationForm mode="create" />
            </main>
        </div>
    );
}
