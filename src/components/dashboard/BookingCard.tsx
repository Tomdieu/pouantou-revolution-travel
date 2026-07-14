'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingType, BookingStatus } from '@prisma/client';
import { Plane, Building, Car, Calendar, User, Mail, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { convertCurrency } from '@/lib/utils';

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

const statusStyles: Record<BookingStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
    COMPLETED: 'bg-slate-100 text-slate-600 border border-slate-200',
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
    const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchConvertedPrice = async () => {
            if (!booking.price) return;
            setIsLoadingRate(true);
            try {
                if (booking.currency === 'XAF') {
                    const converted = await convertCurrency(booking.price, 'XAF', 'EUR');
                    setConvertedPrice(converted);
                } else if (booking.currency === 'EUR') {
                    const converted = await convertCurrency(booking.price, 'EUR', 'XAF');
                    setConvertedPrice(converted);
                }
            } catch (error) {
                console.error('Error converting currency:', error);
            } finally {
                setIsLoadingRate(false);
            }
        };
        fetchConvertedPrice();
    }, [booking.price, booking.currency]);

    const Icon = typeIcons[booking.type];

    const handleCancel = async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) return;
        setIsCancelling(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erreur lors de l\'annulation');
            toast.success('Réservation annulée avec succès');
            router.refresh();
        } catch (error) {
            toast.error('Erreur lors de l\'annulation de la réservation');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Main */}
            <div className="p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{typeLabels[booking.type]}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[booking.status]}`}>
                                {statusLabels[booking.status]}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(booking.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 md:items-end">
                    {booking.price && (
                        <div className="text-right">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-bold text-slate-900 tabular-nums">
                                    {booking.price.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-xs font-medium text-slate-500">{booking.currency || 'XAF'}</span>
                            </div>
                            {convertedPrice && !isLoadingRate && (
                                <p className="text-xs text-slate-400">
                                    ≈ {convertedPrice.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {booking.currency === 'XAF' ? 'EUR' : 'XAF'}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {booking.contactName}
                    </div>
                </div>
            </div>

            {/* Info bar */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 items-center text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{booking.contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {booking.contactPhone}
                </div>
                <span className="ml-auto font-mono text-slate-400">{booking.id.slice(-8)}</span>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    {booking.type === 'FLIGHT' ? (
                        <FlightDetails details={booking.searchDetails} />
                    ) : (
                        <>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                Détails de la demande
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(booking.searchDetails)
                                    .filter(([key]) => typeof booking.searchDetails[key] !== 'object')
                                    .map(([key, value]) => (
                                        <div key={key} className="bg-white border border-slate-200 p-3 rounded-lg">
                                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="text-sm font-medium text-slate-900">{String(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}

                    {booking.notes && (
                        <div className="mt-4">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Notes
                            </h4>
                            <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-lg italic">
                                &ldquo;{booking.notes}&rdquo;
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Fermer' : 'Détails'}
                </button>

                {booking.status === 'PENDING' && (
                    <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="ml-auto flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        {isCancelling ? 'Annulation...' : 'Annuler'}
                    </button>
                )}
            </div>
        </div>
    );
}

function FlightDetails({ details }: { details: any }) {
    const flight = details.selectedFlight;
    if (!flight) return <p className="text-sm text-slate-500">Détails du vol non disponibles</p>;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatDuration = (duration: string) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        if (!match) return duration;
        const hours = match[1] ? match[1].replace('H', 'h ') : '';
        const minutes = match[2] ? match[2].replace('M', 'min') : '';
        return `${hours}${minutes}`.trim();
    };

    return (
        <div className="space-y-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itinéraire</h4>

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">{formatTime(flight.departure.time)}</p>
                        <p className="text-sm font-medium text-slate-600 mt-1">{flight.departure.airport}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(flight.departure.time)}</p>
                    </div>
                    <div className="flex-1 mx-6 relative flex flex-col items-center">
                        <div className="w-full h-px bg-slate-200 absolute top-1/2 -translate-y-1/2" />
                        <div className="relative bg-white px-3 py-1 flex flex-col items-center border border-slate-200 rounded-md">
                            <Plane className="w-4 h-4 text-slate-400 mb-0.5" />
                            <p className="text-[10px] font-medium text-slate-500 uppercase">
                                {flight.duration ? formatDuration(flight.duration) : 'DIRECT'}
                            </p>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">{formatTime(flight.arrival.time)}</p>
                        <p className="text-sm font-medium text-slate-600 mt-1">{flight.arrival.airport}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(flight.arrival.time)}</p>
                    </div>
                </div>
            </div>

            {/* Segments */}
            {flight.segments && (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Segments</p>
                    {flight.segments.map((segment: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-semibold text-slate-600">{segment.airline}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{segment.airline} {segment.flightNumber}</p>
                                    <p className="text-xs text-slate-400">{segment.aircraft}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">{formatTime(segment.departure.at)}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{segment.departure.iataCode}</p>
                                </div>
                                <span className="text-slate-300">→</span>
                                <div>
                                    <p className="font-medium text-slate-900">{formatTime(segment.arrival.at)}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{segment.arrival.iataCode}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-2">{formatDuration(segment.duration)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { label: 'Passagers', value: `${details.adults} adulte${details.adults > 1 ? 's' : ''}${details.children > 0 ? `, ${details.children} enfant${details.children > 1 ? 's' : ''}` : ''}` },
                    { label: 'Classe', value: details.travelClass === 'ECONOMY' ? 'Économique' : details.travelClass },
                    { label: 'Type', value: flight.instantTicketing ? 'Instantané' : 'Sur réservation' },
                    ...(flight.lastTicketingDate ? [{ label: 'Délai', value: formatDate(flight.lastTicketingDate) }] : []),
                ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-200 p-3 rounded-lg">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-slate-900">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
