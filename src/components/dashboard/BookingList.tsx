'use client';

import { useState } from 'react';
import { Plane, Building2, Car, Clock, CheckCircle2, XCircle, PartyPopper, Filter, Inbox } from "lucide-react";
import { BookingCard } from './BookingCard';
import { Button } from '@/components/ui/button';
import { BookingType, BookingStatus } from '@prisma/client';

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
}

interface BookingListProps {
    bookings: Booking[];
}

const typeConfig = {
    ALL: { label: 'Tous', icon: Filter },
    FLIGHT: { label: 'Vols', icon: Plane },
    HOTEL: { label: 'Hôtels', icon: Building2 },
    CAR_RENTAL: { label: 'Voitures', icon: Car },
};

const statusConfig = {
    ALL: { label: 'Tous', color: 'bg-stone-100 text-stone-700' },
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Confirmée', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    CANCELLED: { label: 'Annulée', color: 'bg-red-50 text-red-700 border-red-200' },
    COMPLETED: { label: 'Terminée', color: 'bg-green-50 text-green-700 border-green-200' },
};

export function BookingList({ bookings }: BookingListProps) {
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const filteredBookings = bookings.filter(booking => {
        const typeMatch = filterType === 'ALL' || booking.type === filterType;
        const statusMatch = filterStatus === 'ALL' || booking.status === filterStatus;
        return typeMatch && statusMatch;
    });

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6 border border-blue-100">
                    <Inbox className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune réservation
                </h3>
                <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                    Vous n'avez pas encore de demandes en cours. Commencez votre voyage dès aujourd'hui.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
                {/* Type Filter */}
                <div>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-3">
                        Type de réservation
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(typeConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            const isActive = filterType === key;
                            return (
                                <Button
                                    key={key}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilterType(key)}
                                    className={`h-9 gap-2 text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-3">
                        Statut
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => {
                            const isActive = filterStatus === key;
                            return (
                                <Button
                                    key={key}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilterStatus(key)}
                                    className={`h-9 text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {config.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <div className="text-sm px-4">
                    <span className="font-semibold text-gray-900">{filteredBookings.length}</span>
                    <span className="text-gray-600 ml-1">réservation{filteredBookings.length > 1 ? 's' : ''}</span>
                </div>
                {(filterType !== 'ALL' || filterStatus !== 'ALL') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); }}
                        className="text-xs text-gray-500 hover:text-gray-900 h-8"
                    >
                        Réinitialiser les filtres
                    </Button>
                )}
            </div>

            {/* List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Aucun résultat correspondant à vos critères</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            )}
        </div>
    );
}
