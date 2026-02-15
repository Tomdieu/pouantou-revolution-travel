import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Key, Trash2 } from 'lucide-react';
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
        <div className="bg-stone-50 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Page Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                        Account Settings
                    </h1>
                    <p className="text-stone-500">
                        Manage your profile and security preferences
                    </p>
                </div>

                {/* Profile Card - Clean and Focused */}
                <Card className="border-0 shadow-sm ring-1 ring-stone-200">
                    <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                            <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-stone-900 text-stone-50 text-xl font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-4 pt-1">
                                <div>
                                    <h2 className="text-xl font-semibold text-stone-900">
                                        {user.name || 'User'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1 text-stone-600">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-100 font-normal rounded-md">
                                        {isOAuth ? 'Google Account' : 'Email Account'}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 font-normal rounded-md border-0">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details Form */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Key className="h-4 w-4 text-stone-400" />
                        <h3 className="text-sm font-medium text-stone-900 uppercase tracking-wide">
                            Account Details
                        </h3>
                    </div>
                    <Card className="border-0 shadow-sm ring-1 ring-stone-200">
                        <CardContent className="p-6">
                            <ProfileForm user={user} isOAuth={isOAuth} />
                        </CardContent>
                    </Card>
                </section>

                {/* Danger Zone - Understated but Clear */}
                <section className="space-y-3 pt-4">
                    <div className="flex items-center gap-2 px-1">
                        <Trash2 className="h-4 w-4 text-red-400" />
                        <h3 className="text-sm font-medium text-stone-900 uppercase tracking-wide">
                            Danger Zone
                        </h3>
                    </div>
                    <Card className="border-red-100 bg-red-50/30 shadow-none">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-stone-900">
                                        Delete Account
                                    </h4>
                                    <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
                                        Permanently remove your account and all associated data. This cannot be undone.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 rounded-lg shrink-0"
                                    disabled
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Footer Info */}
                <div className="pt-8 text-center">
                    <p className="text-xs text-stone-400">
                        User ID: <span className="font-mono">{user.id.slice(-8)}</span>
                    </p>
                </div>

            </div>
        </div>
    );
}