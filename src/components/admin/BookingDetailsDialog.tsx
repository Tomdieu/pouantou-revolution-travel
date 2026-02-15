"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Plane, Hotel, Car, Calendar, User, Mail, Phone, Clock, CheckCircle, XCircle, PlayCircle, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateBookingStatus, updateBookingPrice } from "@/actions/booking-actions";
import { toast } from "sonner";
import { BookingStatus } from "@prisma/client";

interface BookingDetailsDialogProps {
    booking: {
        id: string;
        type: string;
        status: string;
        searchDetails: string;
        price: number | null;
        currency: string | null;
        contactName: string;
        contactEmail: string;
        contactPhone: string;
        notes: string | null;
        createdAt: Date;
        user: {
            name: string | null;
            email: string | null;
        } | null;
    };
    children?: React.ReactNode;
}

const typeIcons: any = {
    FLIGHT: Plane,
    HOTEL: Hotel,
    CAR_RENTAL: Car,
};

const statusVariants: any = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    CANCELLED: 'destructive',
    COMPLETED: 'outline',
};

export function BookingDetailsDialog({ booking, children }: BookingDetailsDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [priceValue, setPriceValue] = useState(booking.price?.toString() || '');

    const handlePriceUpdate = async () => {
        setIsLoading(true);
        try {
            const price = parseFloat(priceValue);
            if (isNaN(price)) {
                toast.error("Prix invalide");
                setIsLoading(false);
                return;
            }

            const result = await updateBookingPrice(booking.id, price);
            if (result.success) {
                toast.success("Prix mis à jour");
                setIsEditingPrice(false);
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    let details: any = {};
    try {
        details = JSON.parse(booking.searchDetails);
    } catch (e) {
        console.error("Failed to parse search details", e);
        details = { error: "Invalid data" };
    }

    const Icon = typeIcons[booking.type] || Eye;

    const formatCurrency = (amount: number | null, currency: string | null) => {
        if (amount === null) return "N/A";
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency || "EUR",
        }).format(amount);
    };

    const handleStatusChange = async (status: BookingStatus) => {
        setIsLoading(true);
        try {
            const result = await updateBookingStatus(booking.id, status);
            if (result.success) {
                toast.success("Statut mis à jour", {
                    description: `La réservation est maintenant ${status.toLowerCase()}.`,
                });
            } else {
                toast.error("Erreur", {
                    description: "Impossible de mettre à jour le statut.",
                });
            }
        } catch (error) {
            toast.error("Erreur", {
                description: "Une erreur est survenue.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 w-full">
                        <Eye className="mr-2 h-4 w-4" /> Voir détails
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-slate-50 border-b">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Détails de la réservation</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(booking.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant={statusVariants[booking.status]}>
                            {booking.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[600px]">
                    <div className="p-6 space-y-8">

                        {/* Price & Primary Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wide">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {booking.contactName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{booking.contactName}</p>
                                        <p className="text-xs text-slate-500">Compte: {booking.user?.name || 'Invité'}</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail className="w-3.5 h-3.5" /> {booking.contactEmail || 'Non fourni'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="w-3.5 h-3.5" /> {booking.contactPhone}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                                <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wide">Montant Total</p>
                                {isEditingPrice ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={priceValue}
                                                onChange={(e) => setPriceValue(e.target.value)}
                                                className="h-8 text-lg font-bold"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                                                {booking.currency || 'EUR'}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={handlePriceUpdate}
                                            disabled={isLoading}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setIsEditingPrice(false);
                                                setPriceValue(booking.price?.toString() || '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2 group">
                                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(booking.price, booking.currency)}</p>
                                        <span className="text-sm font-medium text-slate-500">{booking.currency || 'EUR'}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                            onClick={() => setIsEditingPrice(true)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
                                        </Button>
                                    </div>
                                )}
                                {booking.status === 'PENDING' && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> En attente de confirmation
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Booking Specific Details */}
                        <div>
                            {booking.type === 'FLIGHT' ? (
                                <FlightDetails details={details} />
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Icon className="w-5 h-5" /> Détails de la demande
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(details)
                                            .filter(([key, value]) => typeof value !== 'object' && value !== null)
                                            .map(([key, value]) => (
                                                <div key={key} className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-900 break-words">
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                    {/* Fallback for complex objects (JSON dump) */}
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-400 mb-1">Données brutes</p>
                                        <div className="bg-slate-900 text-slate-50 p-4 rounded-md text-xs font-mono overflow-auto max-h-40">
                                            <pre>{JSON.stringify(details, null, 2)}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {booking.notes && (
                            <>
                                <Separator />
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                                    <h3 className="font-semibold text-yellow-800 mb-1 text-sm uppercase">Notes</h3>
                                    <p className="text-sm text-yellow-900 italic">"{booking.notes}"</p>
                                </div>
                            </>
                        )}

                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                    {booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange('CONFIRMED')}
                            disabled={isLoading}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirmer
                        </Button>
                    )}

                    {booking.status === 'CONFIRMED' && (
                        <Button
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusChange('COMPLETED')}
                            disabled={isLoading}
                        >
                            <PlayCircle className="mr-2 h-4 w-4" /> Terminer
                        </Button>
                    )}

                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusChange('CANCELLED')}
                            disabled={isLoading}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Annuler
                        </Button>
                    )}

                    <Button variant="outline" onClick={() => document.getElementById('close-dialog')?.click()}>
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}

function FlightDetails({ details }: { details: any }) {
    const flight = details.selectedFlight;
    if (!flight) return <p className="text-sm text-slate-500">Détails du vol non disponibles</p>;

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
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Itinéraire Complet</h4>

            {/* Timeline View */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{formatTime(flight.departure.time)}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-2">{flight.departure.airport}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{formatDate(flight.departure.time)}</p>
                    </div>

                    <div className="flex-1 mx-6 relative flex flex-col items-center">
                        <div className="w-full h-0.5 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200 absolute top-1/2 -translate-y-1/2"></div>
                        <div className="relative bg-white px-3 py-1 flex flex-col items-center border border-blue-100 rounded-lg shadow-sm">
                            <Plane className="w-5 h-5 text-blue-600 mb-0.5" />
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                                {flight.duration ? formatDuration(flight.duration) : 'DIRECT'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival.time)}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-2">{flight.arrival.airport}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{formatDate(flight.arrival.time)}</p>
                    </div>
                </div>
            </div>

            {/* Segments */}
            {flight.segments && (
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider pl-1">Segments</p>
                    {flight.segments.map((segment: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                                    <span className="text-xs font-semibold text-slate-900">{segment.airline}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{segment.airline} {segment.flightNumber}</p>
                                    <p className="text-xs text-slate-500 font-medium">{segment.aircraft}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                                <span>{segment.departure.iataCode} {formatTime(segment.departure.at)}</span>
                                <span className="text-slate-300">→</span>
                                <span>{segment.arrival.iataCode} {formatTime(segment.arrival.at)}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-600">{formatDuration(segment.duration)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Other Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Passagers</p>
                    <p className="text-sm font-bold text-slate-900">
                        {details.adults} Adulte{details.adults > 1 ? 's' : ''}
                        {details.children > 0 && `, ${details.children} Enfant${details.children > 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Classe</p>
                    <p className="text-sm font-bold text-slate-900">{details.travelClass === 'ECONOMY' ? 'Éco' : details.travelClass}</p>
                </div>
            </div>
        </div>
    );
}
