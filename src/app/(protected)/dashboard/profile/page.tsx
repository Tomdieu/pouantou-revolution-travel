import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { ProfileForm } from './_components/ProfileForm';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect('/login');
    }

    const isOAuth = !user.password;

    const userInitials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user.email?.[0].toUpperCase() || 'U';

    return (
        <div className="py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Paramètres du compte
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gérez votre profil et vos préférences de sécurité
                    </p>
                </div>

                {/* Profile card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start gap-5">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-slate-900 text-white text-lg font-medium">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2 pt-1">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {user.name || 'Utilisateur'}
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-normal text-xs border-0">
                                    {isOAuth ? 'Compte Google' : 'Compte Email'}
                                </Badge>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-normal text-xs border-0">
                                    Actif
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile form */}
                <ProfileForm user={user} isOAuth={isOAuth} />

                {/* Danger zone */}
                <div className="bg-white border border-red-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Zone de danger</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Supprimez définitivement votre compte et toutes les données associées.
                    </p>
                    <button
                        disabled
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg cursor-not-allowed opacity-50"
                    >
                        Supprimer le compte
                    </button>
                </div>

                <p className="text-xs text-slate-400 text-center pt-4">
                    ID: <span className="font-mono">{user.id.slice(-8)}</span>
                </p>
            </div>
        </div>
    );
}
