'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Phone, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { InputPhone } from '@/components/ui/input-phone';
import { updateUserPhone } from '@/actions/auth-actions';
import { signOut } from 'next-auth/react';

const phoneSchema = z.object({
    phone: z.string().min(1, 'Le numéro de téléphone est requis'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function OnboardingPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PhoneFormData>({
        resolver: zodResolver(phoneSchema),
        defaultValues: {
            phone: '',
        },
    });

    const onSubmit = async (data: PhoneFormData) => {
        if (!session?.user?.id) return;

        setIsLoading(true);
        try {
            const result = await updateUserPhone(session.user.id, data.phone);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Profil mis à jour !');
                // Update session to reflect the new phone number
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        phone: data.phone,
                    },
                });
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-xl animate-fade-in-up">
                <div className="rounded-md p-8 md:p-10 border border-white/40 shadow relative overflow-hidden group bg-white/10 backdrop-blur-md">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-[-20px] right-[-20px] p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none rotate-12">
                        <Phone className="w-40 h-40" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-4 text-center">
                            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-2">
                                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">
                                Dernière Étape !
                            </h1>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                Ravi de vous compter parmi nous, {session.user.name?.split(' ')[0]}.
                                Ajoutez votre numéro de téléphone pour finaliser vos réservations en toute sécurité.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Votre numéro de téléphone</FormLabel>
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

                                <div className="pt-2 space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden text-lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <span>Finalisation...</span>
                                            </>
                                        ) : (
                                            <span>Terminer mon profil</span>
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="w-full h-12 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-bold transition-colors text-sm"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Se déconnecter</span>
                                    </button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
