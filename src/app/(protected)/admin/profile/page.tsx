import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/app/(protected)/dashboard/profile/_components/ProfileForm';

export default async function AdminProfilePage() {
    const session = await auth();

    if (!session?.user || !session.user.id || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect('/login');
    }

    const isOAuth = !user.password;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Mon profil
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Informations personnelles et sécurité
                </p>
            </div>

            <div className="max-w-2xl">
                <ProfileForm user={user} isOAuth={isOAuth} />
            </div>
        </div>
    );
}
