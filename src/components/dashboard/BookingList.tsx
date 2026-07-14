'use client';

import { useState } from 'react';
import { Plane, Building2, Car, Filter, Inbox } from "lucide-react";
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
    ALL: { label: 'Tous' },
    PENDING: { label: 'En attente' },
    CONFIRMED: { label: 'Confirmée' },
    CANCELLED: { label: 'Annulée' },
    COMPLETED: { label: 'Terminée' },
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
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Aucune réservation
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                    Vous n&apos;avez pas encore de demandes. Commencez votre voyage dès aujourd&apos;hui.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(typeConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        const isActive = filterType === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterType(key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {config.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(statusConfig).map(([key, config]) => {
                        const isActive = filterStatus === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {config.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    {filteredBookings.length} résultat{filteredBookings.length !== 1 ? 's' : ''}
                </span>
                {(filterType !== 'ALL' || filterStatus !== 'ALL') && (
                    <button
                        onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); }}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500">Aucun résultat correspondant à vos critères</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            )}
        </div>
    );
}
