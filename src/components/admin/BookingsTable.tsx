'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingType, BookingStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Building, Car, User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
    id: string;
    type: BookingType;
    status: BookingStatus;
    searchDetails: any;
    price?: number | null;
    currency?: string | null;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface BookingsTableProps {
    bookings: Booking[];
}

const typeIcons = {
    FLIGHT: Plane,
    HOTEL: Building,
    CAR_RENTAL: Car,
};

const typeLabels = {
    FLIGHT: '✈️ Vol',
    HOTEL: '🏨 Hôtel',
    CAR_RENTAL: '🚗 Voiture',
};

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    CANCELLED: 'Annulée',
    COMPLETED: 'Terminée',
};

export function BookingsTable({ bookings }: BookingsTableProps) {
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const router = useRouter();

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const typeMatch = filterType === 'ALL' || booking.type === filterType;
        const statusMatch = filterStatus === 'ALL' || booking.status === filterStatus;
        return typeMatch && statusMatch;
    });

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        setUpdatingStatus(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            toast.success('Statut mis à jour avec succès');
            router.refresh();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="p-12 text-center">
                <p className="text-gray-600">Aucune réservation pour le moment.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous les types</SelectItem>
                                <SelectItem value="FLIGHT">✈️ Vols</SelectItem>
                                <SelectItem value="HOTEL">🏨 Hôtels</SelectItem>
                                <SelectItem value="CAR_RENTAL">🚗 Voitures</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous les statuts</SelectItem>
                                <SelectItem value="PENDING">⏳ En attente</SelectItem>
                                <SelectItem value="CONFIRMED">✓ Confirmée</SelectItem>
                                <SelectItem value="CANCELLED">✗ Annulée</SelectItem>
                                <SelectItem value="COMPLETED">🎉 Terminée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prix
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                                    Aucune réservation ne correspond aux filtres sélectionnés.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{typeLabels[booking.type]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{booking.user.name || 'N/A'}</div>
                                            <div className="text-gray-500">{booking.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="text-gray-900">{booking.contactName}</div>
                                            <div className="text-gray-500">{booking.contactPhone}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.price ? `${booking.price.toFixed(2)} ${booking.currency || 'EUR'}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Select
                                            value={booking.status}
                                            onValueChange={(value) => handleStatusChange(booking.id, value as BookingStatus)}
                                            disabled={updatingStatus === booking.id}
                                        >
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">⏳ En attente</SelectItem>
                                                <SelectItem value="CONFIRMED">✓ Confirmée</SelectItem>
                                                <SelectItem value="COMPLETED">🎉 Terminée</SelectItem>
                                                <SelectItem value="CANCELLED">✗ Annulée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
