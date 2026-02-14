'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { resetPassword } from '@/actions/auth-actions';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Jeton de réinitialisation manquant');
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword({
                token,
                password: data.password,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                setIsSuccess(true);
                toast.success('Mot de passe réinitialisé avec succès');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">
                    Lien de réinitialisation invalide ou expiré.
                </div>
                <Link href="/forgot-password">
                    <Button variant="ghost" className="text-blue-600 font-bold">
                        Demander un nouveau lien
                    </Button>
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="space-y-8 animate-fade-in text-center">
                <div className="w-20 h-20 bg-green-100/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">Succès !</h2>
                    <p className="text-gray-500 font-medium">
                        Votre mot de passe a été mis à jour. Redirection vers la connexion...
                    </p>
                </div>
                <Link href="/login" className="block">
                    <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl">
                        Aller à la connexion
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Nouveau mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-blue-600 z-10">
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors z-10"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
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
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-blue-600 z-10">
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors z-10"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-[11px] font-bold mt-1.5 ml-1" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 mt-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-lg">Mise à jour...</span>
                        </div>
                    ) : (
                        <span className="text-lg">Réinitialiser le mot de passe</span>
                    )}
                </Button>
            </form>
        </Form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-xl animate-fade-in-up">
                <div className="p-8 md:p-10 border rounded-md relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none rotate-[25deg]">
                        <Lock className="w-40 h-40" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                Nouveau mot de passe
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Choisissez un mot de passe sécurisé
                            </p>
                        </div>

                        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
                            <ResetPasswordForm />
                        </Suspense>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="text-[11px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
