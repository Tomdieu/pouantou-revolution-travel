import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from './_components/DashboardHeader';
import { ShieldCheck, Plane } from 'lucide-react';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        redirect('/login');
    }

    const userForHeader = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <DashboardHeader user={userForHeader} />

            <main className="flex-1">
                {children}
            </main>

            {/* Global Dashboard Footer */}
            <footer className="border-t bg-white mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-900">Revolution Travel</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            &copy; 2024 Voyagez avec excellence. Tous droits réservés.
                        </p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Données Sécurisées</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
