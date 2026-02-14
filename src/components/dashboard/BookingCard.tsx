'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingType, BookingStatus } from '@prisma/client';
import { Plane, Building, Car, Calendar, User, Mail, Phone, Euro, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

interface BookingCardProps {
    booking: Booking;
}

const typeIcons = {
    FLIGHT: Plane,
    HOTEL: Building,
    CAR_RENTAL: Car,
};

const typeLabels = {
    FLIGHT: 'Vol',
    HOTEL: 'Hôtel',
    CAR_RENTAL: 'Location de voiture',
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

export function BookingCard({ booking }: BookingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const router = useRouter();

    const Icon = typeIcons[booking.type];

    const handleCancel = async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'annulation');
            }

            toast.success('Réservation annulée avec succès');
            router.refresh();
        } catch (error) {
            toast.error('Erreur lors de l\'annulation de la réservation');
        } finally {
            setIsCancelling(false);
        }
    };

    const statusConfigs = {
        PENDING: {
            label: 'En attente',
            classes: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        },
        CONFIRMED: {
            label: 'Confirmée',
            classes: 'bg-green-500/10 text-green-600 border-green-500/20',
        },
        CANCELLED: {
            label: 'Annulée',
            classes: 'bg-red-500/10 text-red-600 border-red-500/20',
        },
        COMPLETED: {
            label: 'Terminée',
            classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        },
    };

    const currentStatus = statusConfigs[booking.status];

    return (
        <Card className="glass-premium border border-white/40 shadow-xl rounded-[2rem] overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:border-white/60">
            <CardContent className="p-0">
                {/* Main Visible Area */}
                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 relative">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{typeLabels[booking.type]}</h3>
                                <Badge className={`rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest border ${currentStatus.classes}`}>
                                    {currentStatus.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <p className="text-xs font-bold uppercase tracking-widest font-mono">
                                    {new Date(booking.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-stretch md:self-auto">
                        {booking.price && (
                            <div className="bg-blue-600/5 px-4 py-2 rounded-2xl border border-blue-600/10">
                                <p className="text-2xl font-black text-blue-600">
                                    {booking.price.toLocaleString('fr-FR')} <span className="text-sm opacity-60 font-black">{booking.currency || 'XAF'}</span>
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 pl-2">{booking.contactName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="px-8 py-4 bg-gray-50/50 border-y border-gray-100/50 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{booking.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{booking.contactPhone}</span>
                    </div>
                    <div className="ml-auto">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">ID: {booking.id.slice(-8)}</span>
                    </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                    <div className="p-8 bg-white/20 backdrop-blur-sm animate-fade-in-up">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-600 rounded-full" />
                            Détails de l'itinéraire
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(booking.searchDetails).map(([key, value]) => (
                                <div key={key} className="bg-white/40 border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 transition-all hover:border-blue-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-sm font-bold text-gray-900">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                        {booking.notes && (
                            <div className="mt-6 space-y-2">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Notes Particulières</h4>
                                <p className="text-sm font-medium text-gray-500 bg-white/40 border border-gray-100 rounded-2xl p-4 leading-relaxed italic">
                                    "{booking.notes}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Interactive Footer */}
                <div className="p-4 sm:p-6 bg-white/40 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all group/btn"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-2 group-hover/btn:-translate-y-0.5 transition-transform" />
                                Fermer les Détails
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-2 group-hover/btn:translate-y-0.5 transition-transform" />
                                Explorer la demande
                            </>
                        )}
                    </Button>

                    {booking.status === 'PENDING' && (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] bg-red-100 hover:bg-red-600 text-red-600 hover:text-white border-none transition-all"
                        >
                            {isCancelling ? (
                                'Encours...'
                            ) : (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Annuler
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
