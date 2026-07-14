'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { UploadButton } from '@uploadthing/react';
import { Loader2, X, Upload, Globe, MapPin, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const destinationSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
    description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
    price: z.coerce.number().positive('Le prix doit être positif'),
    currency: z.string().default('FCFA'),
    imageUrl: z.string().url('URL invalide').optional().nullable(),
    emoji: z.string().optional().nullable(),
    badge: z.string().optional().nullable(),
    isPopular: z.boolean().default(false),
    isActive: z.boolean().default(true),
    order: z.coerce.number().int().default(0),
});

type DestinationFormData = z.input<typeof destinationSchema>;

interface DestinationFormProps {
    initialData?: Partial<DestinationFormData> & { id?: string };
    mode: 'create' | 'edit';
}

export function DestinationForm({ initialData, mode }: DestinationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
        initialData?.imageUrl || null
    );

    const form = useForm<DestinationFormData>({
        resolver: zodResolver(destinationSchema),
        defaultValues: {
            name: initialData?.name || '',
            country: initialData?.country || '',
            description: initialData?.description || '',
            price: initialData?.price || 0,
            currency: initialData?.currency || 'FCFA',
            imageUrl: initialData?.imageUrl || null,
            emoji: initialData?.emoji || '',
            badge: initialData?.badge || '',
            isPopular: initialData?.isPopular || false,
            isActive: initialData?.isActive ?? true,
            order: initialData?.order || 0,
        },
    });

    const onSubmit = async (data: DestinationFormData) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                ...data,
                imageUrl: uploadedImageUrl || data.imageUrl,
            };

            const url = mode === 'create'
                ? '/api/destinations'
                : `/api/destinations/${initialData?.id}`;

            const method = mode === 'create' ? 'POST' : 'PATCH';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || 'Destination enregistrée');
                router.push('/admin/destinations');
                router.refresh();
            } else {
                toast.error(result.error || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/admin/destinations')}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                        {mode === 'create' ? 'Nouvelle destination' : 'Modifier la destination'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {mode === 'create'
                            ? 'Ajoutez une nouvelle destination au catalogue'
                            : `Modification de ${initialData?.name || 'la destination'}`}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Image */}
                    <div>
                        <label className="text-sm font-medium text-slate-900 mb-3 block">
                            Image de la destination
                        </label>
                        {uploadedImageUrl ? (
                            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                <Image
                                    src={uploadedImageUrl}
                                    alt="Aperçu de la destination"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 672px"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadedImageUrl(null);
                                        form.setValue('imageUrl', null);
                                    }}
                                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-red-600 hover:bg-white transition-all duration-150"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center hover:border-slate-400 transition-colors duration-150">
                                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-600 mb-1">
                                    Glissez une image ici ou cliquez pour télécharger
                                </p>
                                <p className="text-xs text-slate-400 mb-4">
                                    800×600px recommandé, max 4 Mo
                                </p>
                                <UploadButton<OurFileRouter, "destinationImage">
                                    endpoint="destinationImage"
                                    onClientUploadComplete={(res) => {
                                        if (res && res[0]) {
                                            setUploadedImageUrl(res[0].url);
                                            form.setValue('imageUrl', res[0].url);
                                            toast.success('Image téléchargée');
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Erreur: ${error.message}`);
                                    }}
                                    appearance={{
                                        button: 'bg-slate-900 hover:bg-slate-800 text-white px-4 h-9 rounded-lg text-sm font-medium transition-colors',
                                        allowedContent: 'text-xs text-slate-500',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Name + Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Nom de la ville</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Paris"
                                                className="pl-9 h-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Pays</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="France"
                                                className="pl-9 h-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ville lumière et romance..."
                                        className="min-h-[100px] resize-none"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Décrivez ce qui rend cette destination attractive
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price + Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-slate-700">Prix (à partir de)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                                                {form.watch('currency') === 'FCFA' ? 'FCFA' : '€'}
                                            </span>
                                            <Input
                                                type="number"
                                                placeholder="450 000"
                                                className="pl-12 h-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Devise</FormLabel>
                                    <FormControl>
                                        <Input placeholder="FCFA" className="h-10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="emoji"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Emoji</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="🗼"
                                            className="h-10"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Fallback si pas d&apos;image
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="badge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Badge</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Populaire"
                                            className="h-10"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Ordre</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Plus petit en premier
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-6 pt-2">
                        <FormField
                            control={form.control}
                            name="isPopular"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5 text-slate-400" />
                                        <FormLabel className="!mt-0 text-sm text-slate-600">
                                            Populaire
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="!mt-0 text-sm text-slate-600">
                                        Active
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push('/admin/destinations')}
                            disabled={isSubmitting}
                            className="text-slate-600"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === 'create' ? 'Créer' : 'Mettre à jour'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
