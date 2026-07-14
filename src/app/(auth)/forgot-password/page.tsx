'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { forgotPassword } from '@/actions/auth-actions';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', data.email);

            const result = await forgotPassword(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                setIsSubmitted(true);
                toast.success(result.message || 'Instructions envoyées par email');
            }
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {isSubmitted ? 'Email envoyé' : 'Réinitialisation'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isSubmitted
                                ? 'Vérifiez votre boîte de réception'
                                : 'Nous vous enverrons un lien sécurisé'
                            }
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-medium text-slate-700">
                                        Lien envoyé à :
                                    </p>
                                    <p className="text-sm text-slate-900 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                                        {form.getValues('email')}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-500 text-center max-w-xs">
                                    Si l&apos;adresse correspond à un compte existant, vous recevrez des instructions sous peu.
                                </p>
                            </div>
                            <Link href="/login" className="block">
                                <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour à la connexion
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="votre@email.com"
                                                    className="h-11 rounded-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                />
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
                                    Envoyer le lien
                                </Button>

                                <div className="text-center pt-2">
                                    <Link
                                        href="/login"
                                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
}
