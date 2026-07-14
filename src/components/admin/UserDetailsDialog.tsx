"use client";

import { useState } from "react";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Eye,
    Mail,
    Phone,
    Calendar,
    Shield,
    Star,
    Plane,
    Hotel,
    Car,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BookingDetailsDialog } from "@/components/admin/BookingDetailsDialog";

interface Booking {
    id: string;
    type: string;
    status: string;
    createdAt: Date;
    price: number | null;
    currency: string | null;
    searchDetails: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string | null;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

interface Review {
    id: string;
    stars: number;
    description: string;
    createdAt: Date;
    isModerated: boolean;
}

interface UserDetailsDialogProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        role: string;
        createdAt: Date;
        phone: string | null;
        bookings: Booking[];
        reviews: Review[];
    };
}

const typeIcons: any = {
    FLIGHT: Plane,
    HOTEL: Hotel,
    CAR_RENTAL: Car,
};

const statusVariants: any = {
    PENDING: "secondary",
    CONFIRMED: "default",
    CANCELLED: "destructive",
    COMPLETED: "outline",
};

export function UserDetailsDialog({ user }: UserDetailsDialogProps) {
    const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("ALL");
    const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");

    const filteredBookings = user.bookings.filter((booking) => {
        const typeMatch = bookingTypeFilter === "ALL" || booking.type === bookingTypeFilter;
        const statusMatch = bookingStatusFilter === "ALL" || booking.status === bookingStatusFilter;
        return typeMatch && statusMatch;
    });

    const formatCurrency = (amount: number | null, currency: string | null) => {
        if (amount === null) return "N/A";
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency || "EUR",
        }).format(amount);
    };

    return (
        <Credenza>
            <CredenzaTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 w-full">
                    <Eye className="mr-2 h-4 w-4" /> Voir détails
                </div>
            </CredenzaTrigger>
            <CredenzaContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <CredenzaHeader className="p-6 bg-slate-50 border-b shrink-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                            <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CredenzaTitle className="text-xl font-bold text-slate-900">{user.name || "Utilisateur"}</CredenzaTitle>
                            <CredenzaDescription className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-slate-500 text-sm">
                                    <Mail className="h-3.5 w-3.5" /> {user.email}
                                </span>
                                {user.phone && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                                            <Phone className="h-3.5 w-3.5" /> {user.phone}
                                        </span>
                                    </>
                                )}
                            </CredenzaDescription>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" /> {user.role}
                                </Badge>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                </span>
                            </div>
                        </div>
                    </div>
                </CredenzaHeader>

                <Tabs defaultValue="bookings" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 border-b shrink-0 bg-white z-10">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none space-x-6">
                            <TabsTrigger
                                value="bookings"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Réservations ({user.bookings.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Avis ({user.reviews.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="bookings" className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col">

                        <div className="p-4 border-b bg-stone-50 flex flex-wrap gap-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">Type:</span>
                                <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white">
                                        <SelectValue placeholder="Tous les types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les types</SelectItem>
                                        <SelectItem value="FLIGHT">Vols</SelectItem>
                                        <SelectItem value="HOTEL">Hôtels</SelectItem>
                                        <SelectItem value="CAR_RENTAL">Location de voiture</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">Statut:</span>
                                <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white">
                                        <SelectValue placeholder="Tous les statuts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                                        <SelectItem value="PENDING">En attente</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-4">
                                {filteredBookings.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>Aucune réservation trouvée pour ces critères.</p>
                                    </div>
                                ) : (
                                    filteredBookings.map((booking) => {
                                        const Icon = typeIcons[booking.type] || Eye;
                                        let detailsParse = {};
                                        try { detailsParse = JSON.parse(booking.searchDetails); } catch (e) { }

                                        // Ensure booking object has user property needed for BookingDetailsDialog
                                        const bookingWithUser = {
                                            ...booking,
                                            user: user // Pass full user object or ensure it matches schema
                                        } as any;

                                        return (
                                            <BookingDetailsDialog key={booking.id} booking={bookingWithUser}>
                                                <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200 group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold text-slate-900 capitalize">
                                                                        {booking.type.replace('_', ' ').toLowerCase()}
                                                                    </h4>
                                                                    <span className="text-xs text-slate-400">•</span>
                                                                    <span className="text-xs text-slate-500">{new Date(booking.createdAt).toLocaleDateString('fr-FR')}</span>
                                                                </div>
                                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                                    ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">{booking.id}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="mb-2">
                                                                <Badge variant={statusVariants[booking.status]}>
                                                                    {booking.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="font-bold text-slate-900">{formatCurrency(booking.price, booking.currency)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </BookingDetailsDialog>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="reviews" className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col">
                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-4">
                                {user.reviews.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>Cet utilisateur n&apos;a pas encore laissé d&apos;avis.</p>
                                    </div>
                                ) : (
                                    user.reviews.map((review) => (
                                        <div key={review.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center text-yellow-500 gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.stars ? 'fill-current' : 'text-slate-200'}`}
                                                        />
                                                    ))}
                                                    <span className="text-sm font-semibold text-slate-700 ml-2">{review.stars}/5</span>
                                                </div>
                                                <Badge variant={review.isModerated ? "default" : "destructive"}>
                                                    {review.isModerated ? "Approuvé" : "En attente"}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 text-sm mb-3 italic">"{review.description}"</p>
                                            <p className="text-xs text-slate-400 text-right">
                                                Posté le {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <div className="p-4 border-t bg-slate-50 flex justify-end shrink-0">
                    <Button variant="outline" onClick={() => document.getElementById('close-user-dialog')?.click()}>
                        Fermer
                    </Button>
                </div>
            </CredenzaContent>
        </Credenza>
    );
}
