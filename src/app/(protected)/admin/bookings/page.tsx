import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/admin/BookingActions";
import { BookingPriceCell } from "@/components/admin/BookingPriceCell";
import { CalendarDays, Plane, Hotel, Car } from "lucide-react";

async function getBookings() {
    const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true },
    });
    return bookings;
}

const typeConfig: Record<
    string,
    { label: string; icon: typeof Plane; color: string }
> = {
    FLIGHT: { label: "Vol", icon: Plane, color: "text-blue-600" },
    HOTEL: { label: "Hôtel", icon: Hotel, color: "text-violet-600" },
    CAR_RENTAL: { label: "Voiture", icon: Car, color: "text-amber-600" },
};

const statusStyles: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    COMPLETED: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabels: Record<string, string> = {
    CONFIRMED: "Confirmé",
    PENDING: "En attente",
    CANCELLED: "Annulé",
    COMPLETED: "Terminé",
};

export default async function BookingsPage() {
    const bookings = await getBookings();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                        Réservations
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {bookings.length} réservation{bookings.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Type
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Client
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Contact
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Statut
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Prix
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Date
                            </TableHead>
                            <TableHead className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-32 text-center"
                                >
                                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">
                                        Aucune réservation
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => {
                                const typeInfo =
                                    typeConfig[booking.type] || typeConfig.FLIGHT;
                                const TypeIcon = typeInfo.icon;

                                return (
                                    <TableRow
                                        key={booking.id}
                                        className="group"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TypeIcon
                                                    className={`w-4 h-4 ${typeInfo.color}`}
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {booking.user ? (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {booking.user.name ||
                                                            "Utilisateur"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {booking.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-slate-500 italic">
                                                        Invité
                                                    </p>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm text-slate-700">
                                                    {booking.contactName}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {booking.contactEmail ||
                                                        booking.contactPhone ||
                                                        "—"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs font-medium ${
                                                    statusStyles[
                                                        booking.status
                                                    ] || statusStyles.PENDING
                                                }`}
                                            >
                                                {statusLabels[
                                                    booking.status
                                                ] || booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <BookingPriceCell
                                                bookingId={booking.id}
                                                initialPrice={booking.price}
                                                currency={booking.currency}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-500">
                                                {new Date(
                                                    booking.createdAt
                                                ).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <BookingActions
                                                booking={booking}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
