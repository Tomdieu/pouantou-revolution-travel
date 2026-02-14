'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, Plane, Phone, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { InputPhone } from '@/components/ui/input-phone';

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(1, 'Numéro de téléphone requis'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.field && (result.field === 'email' || result.field === 'phone')) {
                    form.setError(result.field as 'email' | 'phone', {
                        type: 'manual',
                        message: result.error
                    });
                } else {
                    toast.error(result.error || 'Erreur lors de l\'inscription');
                }
                return;
            }

            toast.success('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
            router.push('/login');
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-xl animate-fade-in-up">
                <div className="rounded-md p-8 md:p-10 border border-white/40 shadow relative overflow-hidden group bg-white/10 backdrop-blur-md">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-[-20px] left-[-20px] p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none -rotate-12">
                        <User className="w-40 h-40" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                Créer un Compte
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Rejoignez l'aventure Pouantou Revolution Travel
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Nom complet</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-blue-600 z-10">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        placeholder="Jean Dupont"
                                                        className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all duration-300 font-medium"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-blue-600 z-10">
                                                        <Mail className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="votre@email.com"
                                                        className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all duration-300 font-medium"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-blue-600 z-10">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <InputPhone
                                                        {...field}
                                                        defaultCountry="CM"
                                                        placeholder="+237 6XX XXX XXX"
                                                        popoverFontSize="text-lg"
                                                        className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-2 border-gray-100 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl transition-all duration-300 font-medium"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Mot de passe</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-blue-600 z-10">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="pl-12 pr-12 h-14 bg-white/50 backdrop-blur-sm border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all duration-300 font-medium"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300 z-10"
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Confirmer le mot de passe</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-blue-600 z-10">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="pl-12 pr-12 h-14 bg-white/50 backdrop-blur-sm border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all duration-300 font-medium"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300 z-10"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.98] group flex items-center justify-center gap-3 overflow-hidden mt-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="text-lg">Création...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-lg">Créer mon compte</span>
                                            <Plane className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="text-center pt-4">
                            <p className="text-gray-500 font-medium text-sm">
                                Vous avez déjà un compte ?{' '}
                                <Link
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-700 font-black transition-colors"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
