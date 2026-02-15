'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User, Mail, Shield, Key, Phone } from 'lucide-react';
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Détails du Compte</CardTitle>
                                <CardDescription>Informations de votre compte Revolution Travel</CardDescription>
                            </div>
                            {!isEditing ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-xl"
                                >
                                    Modifier
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false);
                                            form.reset();
                                        }}
                                        disabled={isLoading}
                                        className="rounded-xl"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Enregistrer
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-700 ml-1">Nom Complet</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        disabled={!isEditing || isLoading}
                                                        className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-700 ml-1">Téléphone</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                                                        <Phone className="h-4 w-4" />
                                                    </div>
                                                    <InputPhone
                                                        defaultCountry="CM"
                                                        {...field}
                                                        placeholder="+237 6 12 34 56 78"
                                                        disabled={!isEditing || isLoading}
                                                        className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-700 ml-1">
                                                Adresse Email {isOAuth && <span className="text-xs font-normal text-gray-400 ml-1">(Géré via Google)</span>}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        disabled={!isEditing || isLoading || isOAuth}
                                                        className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all disabled:opacity-70"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>

            {/* Account Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres du Compte</CardTitle>
                    <CardDescription>Gérez vos préférences et paramètres de sécurité</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {!isOAuth && (
                            <div className="flex items-center justify-between p-4 border rounded-2xl bg-white/50 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <Key className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Mot de passe</h3>
                                        <p className="text-sm text-gray-500">Mettez à jour votre mot de passe de sécurité</p>
                                    </div>
                                </div>
                                <ChangePasswordModal />
                            </div>
                        )}
                        <div className="flex items-center justify-between p-4 border rounded-2xl bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    <p className="text-sm text-gray-500">Gérez vos préférences de notification</p>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl" disabled>
                                Configurer
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
