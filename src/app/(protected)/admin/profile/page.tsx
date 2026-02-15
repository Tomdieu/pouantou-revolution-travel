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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mon Profil</h1>
                <p className="text-slate-500 mt-2">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
            </div>

            <div className="max-w-2xl">
                <ProfileForm user={user} isOAuth={isOAuth} />
            </div>
        </div>
    );
}
