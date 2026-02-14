'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, ArrowLeft, Plane } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

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
            // TODO: Implement password reset logic
            // For now, just show a success message
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);
            toast.success('Instructions envoyées par email');
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-[440px] animate-fade-in-up">
                <div className="glass-premium rounded-[2.5rem] p-8 md:p-10 border border-white/40 shadow-2xl relative overflow-hidden group">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-[-20px] right-[-20px] p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none rotate-[25deg]">
                        <Mail className="w-40 h-40" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                {isSubmitted ? 'Email Envoyé !' : 'Réinitialisation'}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {isSubmitted
                                    ? 'Vérifiez votre boîte de réception'
                                    : 'Nous vous enverrons un lien sécurisé'
                                }
                            </p>
                        </div>

                        {isSubmitted ? (
                            <div className="space-y-8 animate-fade-in">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-100/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-100 transition-transform duration-500 scale-110">
                                        <Mail className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-700 font-bold">
                                            Lien envoyé à :
                                        </p>
                                        <div className="bg-blue-50/50 py-2 px-4 rounded-xl inline-block border border-blue-100">
                                            <span className="text-blue-700 font-black">{form.getValues('email')}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        Si l'adresse correspond à un compte existant, vous recevrez des instructions sous peu.
                                    </p>
                                </div>
                                <Link href="/login" className="block">
                                    <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3">
                                        <ArrowLeft className="h-5 w-5" />
                                        Retour à la connexion
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-400 group-focus-within:text-blue-600">
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

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.98] group flex items-center justify-center gap-3 overflow-hidden mt-6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <span className="text-lg">Envoi...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-lg">Envoyer le lien</span>
                                                <Plane className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center pt-2">
                                        <Link
                                            href="/login"
                                            className="text-[11px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="h-3 w-3" />
                                            Retour à la connexion
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>

                {/* Footer simple for Auth */}
                <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Pouantou Revolution Travel
                    </p>
                </div>
            </div>
        </div>
    );
}
