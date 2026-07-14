'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChangePasswordModal } from './ChangePasswordModal';

const profileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        role?: string;
    };
    isOAuth: boolean;
}

export function ProfileForm({ user, isOAuth }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        },
    });

    const onSubmit = async (values: ProfileFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Erreur lors de la mise à jour');
            }

            toast.success('Profil mis à jour avec succès');
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-900">Détails du compte</h3>
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Modifier
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); form.reset(); }}
                                        disabled={isLoading}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isLoading}
                                        className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm"
                                    >
                                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                                        Enregistrer
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-slate-700">Nom complet</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={!isEditing || isLoading}
                                                className="h-10 rounded-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-slate-700">Téléphone</FormLabel>
                                        <FormControl>
                                            <InputPhone
                                                defaultCountry="CM"
                                                {...field}
                                                placeholder="+237 6XX XXX XXX"
                                                disabled={!isEditing || isLoading}
                                                className="h-10"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-slate-700">
                                            Email {isOAuth && <span className="text-xs font-normal text-slate-400">(Google)</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                disabled={!isEditing || isLoading || isOAuth}
                                                className="h-10 rounded-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 disabled:opacity-60"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Form>

            {/* Settings */}
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                <div className="px-6 py-4">
                    <h3 className="text-sm font-semibold text-slate-900">Paramètres</h3>
                </div>

                {!isOAuth && (
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Key className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Mot de passe</p>
                                <p className="text-xs text-slate-500">Mettez à jour votre mot de passe</p>
                            </div>
                        </div>
                        <ChangePasswordModal />
                    </div>
                )}

                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-900">Notifications</p>
                        <p className="text-xs text-slate-500">Préférences de notification</p>
                    </div>
                    <button
                        disabled
                        className="text-sm font-medium text-slate-400 cursor-not-allowed"
                    >
                        Bientôt disponible
                    </button>
                </div>
            </div>
        </div>
    );
}
