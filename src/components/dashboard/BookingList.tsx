'use client';

import { useState } from 'react';
import { Plane } from "lucide-react";
import { BookingCard } from './BookingCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            <div className="p-16 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Plane className="w-10 h-10 text-blue-600 opacity-50" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Aucune réservation trouvée</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Vous n'avez pas encore de demandes en cours. Commencez votre voyage dès aujourd'hui !</p>
                <Button className="rounded-xl h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" asChild>
                    <a href="#services-hub">Faire ma première demande</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Filter Hub */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/30 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Filtrer par Type</label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="h-12 rounded-2xl border-2 border-white bg-white/50 backdrop-blur-sm shadow-sm hover:border-blue-200 transition-all font-bold text-gray-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/50 backdrop-blur-xl">
                                <SelectItem value="ALL" className="font-bold">Tous les types</SelectItem>
                                <SelectItem value="FLIGHT" className="font-bold">✈️ Vols Internationaux</SelectItem>
                                <SelectItem value="HOTEL" className="font-bold">🏨 Hôtels & Séjours</SelectItem>
                                <SelectItem value="CAR_RENTAL" className="font-bold">🚗 Location de voiture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Filtrer par Statut</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-12 rounded-2xl border-2 border-white bg-white/50 backdrop-blur-sm shadow-sm hover:border-blue-200 transition-all font-bold text-gray-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/50 backdrop-blur-xl">
                                <SelectItem value="ALL" className="font-bold">Tous les statuts</SelectItem>
                                <SelectItem value="PENDING" className="font-bold">⏳ En attente</SelectItem>
                                <SelectItem value="CONFIRMED" className="font-bold">✓ Confirmée</SelectItem>
                                <SelectItem value="CANCELLED" className="font-bold">✗ Annulée</SelectItem>
                                <SelectItem value="COMPLETED" className="font-bold">🎉 Terminée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* List Engine */}
            <div className="p-6 sm:p-8">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-gray-900 font-bold uppercase tracking-widest text-xs">Aucun résultat correspondant</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredBookings.map((booking, idx) => (
                            <div key={booking.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <BookingCard booking={booking} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
