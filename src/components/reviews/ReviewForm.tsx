'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Send, Loader2, User, Briefcase } from 'lucide-react';
import { createReview } from '@/actions/review-actions';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { InputPhone } from '@/components/ui/input-phone';

const reviewSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    jobTitle: z.string().min(2, "Le titre du poste est requis"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    stars: z.number().min(1).max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export const ReviewForm = () => {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        const submitted = localStorage.getItem('pouantou_has_reviewed');
        if (submitted === 'true') {
            setHasSubmitted(true);
        }
    }, []);

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            name: session?.user?.name || '',
            jobTitle: '',
            phone: '',
            description: '',
            stars: 5,
        },
    });

    const onSubmit = async (data: ReviewFormData) => {
        setIsSubmitting(true);
        try {
            const result = await createReview(data);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
                localStorage.setItem('pouantou_has_reviewed', 'true');
                setHasSubmitted(true);
                form.reset({
                    name: session?.user?.name || '',
                    jobTitle: '',
                    phone: '',
                    description: '',
                    stars: 5,
                });
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="space-y-6">
                {hasSubmitted ? (
                    <div className="text-center py-10 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Star className="w-7 h-7 text-slate-900 fill-slate-900" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Merci pour votre avis !</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            Votre message a été bien reçu et sera visible bientôt.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-1.5">
                            <h3 className="text-xl font-bold text-slate-900">Partagez votre expérience</h3>
                            <p className="text-slate-500 text-sm">Votre avis nous aide à nous améliorer chaque jour.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="flex justify-center gap-1.5 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => form.setValue('stars', star)}
                                            className="p-0.5 transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-8 h-8 transition-colors",
                                                    (hoveredStar || form.watch('stars')) >= star
                                                        ? "fill-slate-900 text-slate-900"
                                                        : "text-slate-200"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {!session?.user?.name ? (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-slate-700">Nom</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Ivan Tom"
                                                                    className="pl-10 h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors text-sm"
                                                                />
                                                            </div>
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
                                                        <FormLabel className="text-sm font-medium text-slate-700">Téléphone (Privé)</FormLabel>
                                                        <FormControl>
                                                            <InputPhone
                                                                {...field}
                                                                defaultCountry="CM"
                                                                placeholder="Ex: 677 ..."
                                                                className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="jobTitle"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel className="text-sm font-medium text-slate-700">Titre / Profession</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Voyageur Passionné / CEO"
                                                                    className="pl-10 h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors text-sm"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="jobTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-slate-700">Titre / Profession</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Voyageur Passionné / CEO"
                                                                    className="pl-10 h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors text-sm"
                                                                />
                                                            </div>
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
                                                        <FormLabel className="text-sm font-medium text-slate-700">Téléphone (Privé)</FormLabel>
                                                        <FormControl>
                                                            <InputPhone
                                                                {...field}
                                                                defaultCountry="CM"
                                                                placeholder="Ex: 677 ..."
                                                                className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-slate-700">Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    rows={3}
                                                    placeholder="Comment s'est passé votre voyage avec nous ?"
                                                    className="border-slate-200 rounded-lg focus:ring-slate-900 transition-colors p-3 font-medium resize-none text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Publier mon avis</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </>
                )}
            </div>
        </div>
    );
};
