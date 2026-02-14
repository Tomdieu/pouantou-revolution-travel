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
import { Card, CardContent } from '@/components/ui/card';
import { UploadButton } from '@uploadthing/react';
import { Loader2, X, Upload } from 'lucide-react';
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

type DestinationFormData = z.infer<typeof destinationSchema>;

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
            // Use uploaded image URL if available
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
                toast.success(result.message || 'Destination enregistrée avec succès');
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Section */}
                <Card>
                    <CardContent className="pt-6">
                        <FormLabel>Image de la destination</FormLabel>
                        <FormDescription className="mb-4">
                            Téléchargez une image pour la destination (recommandé: 800x600px, max 4MB)
                        </FormDescription>

                        {uploadedImageUrl ? (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                <Image
                                    src={uploadedImageUrl}
                                    alt="Destination preview"
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setUploadedImageUrl(null);
                                        form.setValue('imageUrl', null);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <UploadButton<OurFileRouter, "destinationImage">
                                    endpoint="destinationImage"
                                    onClientUploadComplete={(res) => {
                                        if (res && res[0]) {
                                            setUploadedImageUrl(res[0].url);
                                            form.setValue('imageUrl', res[0].url);
                                            toast.success('Image téléchargée avec succès');
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Erreur: ${error.message}`);
                                    }}
                                    appearance={{
                                        button: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
                                        allowedContent: 'text-sm text-gray-600',
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de la ville *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Paris" {...field} />
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
                                        <FormLabel>Pays *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="France" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ville lumière et romance"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prix (à partir de) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="450000" {...field} />
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
                                        <FormLabel>Devise</FormLabel>
                                        <FormControl>
                                            <Input placeholder="FCFA" {...field} />
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
                                        <FormLabel>Ordre d'affichage</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="1" {...field} />
                                        </FormControl>
                                        <FormDescription>Plus petit = affiché en premier</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="emoji"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emoji (fallback si pas d'image)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="🗼" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="badge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Badge</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Plus Populaire" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="isPopular"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Afficher sur la page d'accueil</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Destination active</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/destinations')}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {mode === 'create' ? 'Créer la destination' : 'Mettre à jour'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
