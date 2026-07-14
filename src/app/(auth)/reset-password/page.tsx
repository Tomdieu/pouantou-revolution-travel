'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
            <div className="text-center space-y-4 py-8">
                <p className="text-sm text-slate-600">
                    Lien de réinitialisation invalide ou expiré.
                </p>
                <Link href="/forgot-password">
                    <Button variant="outline" className="rounded-lg border-slate-200 text-slate-700 font-medium">
                        Demander un nouveau lien
                    </Button>
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-slate-900">Succès</h2>
                        <p className="text-sm text-slate-500">
                            Votre mot de passe a été mis à jour. Redirection...
                        </p>
                    </div>
                </div>
                <Link href="/login" className="block">
                    <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200">
                        Aller à la connexion
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Nouveau mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 rounded-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 rounded-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Réinitialiser le mot de passe
                </Button>
            </form>
        </Form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Nouveau mot de passe
                        </h1>
                        <p className="text-sm text-slate-500">
                            Choisissez un mot de passe sécurisé
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1.5"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
