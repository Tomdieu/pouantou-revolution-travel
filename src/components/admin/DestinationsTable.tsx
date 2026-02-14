'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Destination } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DestinationsTableProps {
    destinations: Destination[];
}

export function DestinationsTable({ destinations }: DestinationsTableProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleToggle = async (id: string, field: 'isPopular' | 'isActive', currentValue: boolean) => {
        setIsUpdating(id);
        try {
            const response = await fetch(`/api/destinations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !currentValue }),
            });

            if (response.ok) {
                toast.success('Destination mise à jour');
                router.refresh();
            } else {
                toast.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating destination:', error);
            toast.error('Erreur de connexion');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/destinations/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Destination supprimée');
                router.refresh();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting destination:', error);
            toast.error('Erreur de connexion');
        }
    };

    if (destinations.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                <p>Aucune destination pour le moment</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ordre</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Badge</TableHead>
                        <TableHead>Populaire</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {destinations.map((destination) => (
                        <TableRow key={destination.id}>
                            <TableCell className="font-medium">{destination.order}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{destination.emoji || '🌍'}</div>
                                    <div>
                                        <div className="font-semibold">{destination.name}</div>
                                        <div className="text-sm text-gray-500">{destination.country}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold">
                                    {destination.price.toLocaleString('fr-FR')} {destination.currency}
                                </div>
                            </TableCell>
                            <TableCell>
                                {destination.badge && (
                                    <Badge variant="secondary">{destination.badge}</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={destination.isPopular}
                                    onCheckedChange={() => handleToggle(destination.id, 'isPopular', destination.isPopular)}
                                    disabled={isUpdating === destination.id}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={destination.isActive}
                                        onCheckedChange={() => handleToggle(destination.id, 'isActive', destination.isActive)}
                                        disabled={isUpdating === destination.id}
                                    />
                                    {destination.isActive ? (
                                        <Eye className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/admin/destinations/${destination.id}/edit`}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(destination.id, destination.name)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
