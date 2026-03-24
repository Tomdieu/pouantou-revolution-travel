'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Send, Loader2, User, Briefcase, MessageSquare } from 'lucide-react';
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
        <div className="bg-white p-8 rounded-xl border border-gray-100 relative overflow-hidden">
            <div className="space-y-8">
                {hasSubmitted ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="w-10 h-10 text-green-600 fill-green-600" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 italic">Merci pour votre avis !</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">
                            Votre message a été bien reçu et sera visible bientôt.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black text-gray-900 italic">Partagez votre Expérience</h3>
                            <p className="text-gray-500 font-medium">Votre avis nous aide à nous améliorer chaque jour.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => form.setValue('stars', star)}
                                            className="p-1 transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-10 h-10 transition-all",
                                                    (hoveredStar || form.watch('stars')) >= star
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-200"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {!session?.user?.name ? (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Nom</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Ivan Tom"
                                                                    className="pl-12 h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all font-medium text-sm"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Téléphone (Privé)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input flex items-center bg-white border border-gray-200 focus-within:border-blue-500 rounded-lg transition-all overflow-hidden">
                                                                <InputPhone
                                                                    {...field}
                                                                    defaultCountry="CM"
                                                                    placeholder="Ex: 677 ..."
                                                                    className="h-12 font-medium"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="jobTitle"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Titre / Profession</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Voyageur Passionné / CEO"
                                                                    className="pl-12 h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all font-medium"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
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
                                                        <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Titre / Profession</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ex: Voyageur Passionné / CEO"
                                                                    className="pl-12 h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all font-medium"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Téléphone (Privé)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input flex items-center bg-white border border-gray-200 focus-within:border-blue-500 rounded-lg transition-all overflow-hidden">
                                                                <InputPhone
                                                                    {...field}
                                                                    defaultCountry="CM"
                                                                    placeholder="Ex: 677 ..."
                                                                    className="h-12 font-medium"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
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
                                            <FormLabel className="text-xs font-semibold text-gray-600 ml-1">Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    rows={4}
                                                    placeholder="Comment s'est passé votre voyage avec nous ?"
                                                    className="bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all p-3 font-medium resize-none text-sm max-h-32"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
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
