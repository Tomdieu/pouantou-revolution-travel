'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookingType, BookingStatus } from '@prisma/client';
import { Plane, Building, Car, Calendar, User, Mail, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { convertCurrency, formatCurrency } from '@/lib/utils';

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

const statusVariants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    CANCELLED: 'destructive',
    COMPLETED: 'outline',
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

    // Fetch exchange rate and convert price
    useEffect(() => {
        const fetchConvertedPrice = async () => {
            if (!booking.price) return;

            setIsLoadingRate(true);
            try {
                // If price is in XAF, convert to EUR
                if (booking.currency === 'XAF') {
                    const converted = await convertCurrency(booking.price, 'XAF', 'EUR');
                    setConvertedPrice(converted);
                } else if (booking.currency === 'EUR') {
                    // If price is in EUR, convert to XAF
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

    return (
        <Card className='border-none'>
            <CardContent className="p-0">
                {/* Main Visible Area */}
                <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Icon className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">{typeLabels[booking.type]}</h3>
                                <Badge variant={statusVariants[booking.status]} className="text-xs font-medium">
                                    {statusLabels[booking.status]}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <p>
                                    {new Date(booking.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 md:items-end">
                        {booking.price && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200 shadow-sm min-w-max">
                                <div className="flex flex-col items-end gap-1.5">
                                    {/* Primary Currency */}
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-lg font-bold text-blue-700">
                                            {booking.price.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <span className="text-sm font-semibold text-blue-600">{booking.currency || 'XAF'}</span>
                                    </div>

                                    {/* Converted Currency */}
                                    {convertedPrice && !isLoadingRate && (
                                        <div className="flex items-baseline gap-2 text-sm">
                                            <p className="text-base font-semibold text-gray-600">
                                                {convertedPrice.toLocaleString('fr-FR', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                            <span className="text-xs font-medium text-gray-500">
                                                {booking.currency === 'XAF' ? 'EUR' : 'XAF'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Loading state */}
                                    {isLoadingRate && (
                                        <p className="text-xs text-gray-400">Conversion...</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{booking.contactName}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Info Bar */}
                <div className="px-6 py-4 bg-gray-50/50 flex flex-wrap gap-4 md:gap-8 items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-sm">{booking.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{booking.contactPhone}</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-400 font-mono">
                        ID: {booking.id.slice(-8)}
                    </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                    <>
                        <Separator />
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50">
                            {booking.type === 'FLIGHT' ? (
                                <FlightDetails details={booking.searchDetails} />
                            ) : (
                                <>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                                        Détails de la demande
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(booking.searchDetails)
                                            .filter(([key]) => typeof booking.searchDetails[key] !== 'object')
                                            .map(([key, value]) => (
                                                <div key={key} className="bg-white border border-gray-200 p-4 rounded-lg flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}

                            {booking.notes && (
                                <div className="mt-6 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Notes Particulières</h4>
                                    <p className="text-sm text-gray-600 bg-white border border-gray-200 p-4 rounded-lg italic shadow-sm">
                                        "{booking.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <Separator />

                {/* Interactive Footer */}
                <div className="p-4 bg-white flex items-center gap-3 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 min-w-[150px] gap-2 font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Fermer les détails
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Voir les détails
                            </>
                        )}
                    </Button>

                    {booking.status === 'PENDING' && (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="gap-2 font-medium transition-colors"
                        >
                            {isCancelling ? (
                                'Annulation...'
                            ) : (
                                <>
                                    <X className="w-4 h-4" />
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

function FlightDetails({ details }: { details: any }) {
    const flight = details.selectedFlight;
    if (!flight) return <p className="text-sm text-gray-500">Détails du vol non disponibles</p>;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDuration = (duration: string) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        if (!match) return duration;
        const hours = match[1] ? match[1].replace('H', 'h ') : '';
        const minutes = match[2] ? match[2].replace('M', 'min') : '';
        return `${hours}${minutes}`.trim();
    };

    return (
        <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Itinéraire Complet</h4>

            {/* Timeline View */}
            <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatTime(flight.departure.time)}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-2">{flight.departure.airport}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{formatDate(flight.departure.time)}</p>
                    </div>

                    <div className="flex-1 mx-6 md:mx-8 relative flex flex-col items-center">
                        <div className="w-full h-0.5 bg-gradient-to-r from-gray-200 via-blue-300 to-gray-200 absolute top-1/2 -translate-y-1/2"></div>
                        <div className="relative bg-white px-3 py-1 flex flex-col items-center border border-blue-100 rounded-lg shadow-sm">
                            <Plane className="w-5 h-5 text-blue-600 mb-0.5" />
                            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                                {flight.duration ? formatDuration(flight.duration) : 'DIRECT'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatTime(flight.arrival.time)}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-2">{flight.arrival.airport}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{formatDate(flight.arrival.time)}</p>
                    </div>
                </div>
            </div>

            {/* Segments */}
            {flight.segments && (
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider pl-1">Détails des segments</p>
                    {flight.segments.map((segment: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200 flex-shrink-0">
                                    <span className="text-xs font-semibold text-gray-900">{segment.airline}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{segment.airline} {segment.flightNumber}</p>
                                    <p className="text-xs text-gray-500 font-medium">{segment.aircraft}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="flex flex-col items-start md:items-end">
                                    <p className="text-sm font-bold text-gray-900">{formatTime(segment.departure.at)}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">{segment.departure.iataCode}</p>
                                </div>
                                <div className="text-gray-300 font-bold">→</div>
                                <div className="flex flex-col items-start">
                                    <p className="text-sm font-bold text-gray-900">{formatTime(segment.arrival.at)}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">{segment.arrival.iataCode}</p>
                                </div>
                            </div>

                            <div className="text-right md:min-w-fit">
                                <p className="text-xs font-semibold text-gray-600">{formatDuration(segment.duration)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Other Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase mb-2 tracking-wider">Passagers</p>
                    <p className="text-sm font-bold text-gray-900">
                        {details.adults} Adulte{details.adults > 1 ? 's' : ''}
                        {details.children > 0 && `, ${details.children} Enfant${details.children > 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase mb-2 tracking-wider">Classe</p>
                    <p className="text-sm font-bold text-gray-900">{details.travelClass === 'ECONOMY' ? 'Économique' : details.travelClass}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase mb-2 tracking-wider">Type</p>
                    <p className="text-sm font-bold text-gray-900">{flight.instantTicketing ? 'Instantané' : 'Sur réservation'}</p>
                </div>
                {flight.lastTicketingDate && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                        <p className="text-[10px] font-semibold text-gray-600 uppercase mb-2 tracking-wider">Délai réservation</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(flight.lastTicketingDate)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
