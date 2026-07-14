import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from './_components/DashboardHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        redirect('/login');
    }

    if (!session.user.phone) {
        redirect('/onboarding');
    }

    const userForHeader = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DashboardHeader user={userForHeader} />
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t border-slate-100 bg-white mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-sm font-semibold text-slate-900">Revolution Travel</span>
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
