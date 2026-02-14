'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePasswordModal() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: PasswordFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Une erreur est survenue');
            }

            toast.success('Mot de passe mis à jour avec succès');
            setOpen(false);
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Échec de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVisibility = (key: keyof typeof showPassword) => {
        setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                    Changer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden border-0 shadow-lg ring-1 ring-stone-200">
                <DialogHeader className="p-6 pb-4 space-y-3">
                    <DialogTitle className="text-base font-semibold tracking-tight">
                        Changer le mot de passe
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-stone-500">
                        Pour votre sécurité, entrez votre mot de passe actuel avant de choisir un nouveau.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 bg-stone-50/50 border-y border-stone-100">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-stone-700">
                                            Mot de passe actuel
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword.current ? 'text' : 'password'}
                                                    className="h-10 pr-10 border-stone-200 focus:border-stone-400 focus:ring-0 bg-white"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVisibility('current')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                                >
                                                    {showPassword.current ? (
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

                            <div className="space-y-4 pt-2">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-stone-700">
                                                Nouveau mot de passe
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        className="h-10 pr-10 border-stone-200 focus:border-stone-400 focus:ring-0 bg-white"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleVisibility('new')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                                    >
                                                        {showPassword.new ? (
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
                                            <FormLabel className="text-sm font-medium text-stone-700">
                                                Confirmer le nouveau mot de passe
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        className="h-10 pr-10 border-stone-200 focus:border-stone-400 focus:ring-0 bg-white"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleVisibility('confirm')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                                    >
                                                        {showPassword.confirm ? (
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
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="p-4 bg-stone-50 flex flex-row justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="h-9 px-4 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        onClick={form.handleSubmit(onSubmit)}
                        className="h-9 px-4 bg-stone-900 hover:bg-stone-800 text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Mettre à jour'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}