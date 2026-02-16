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
import { Button } from "@/components/ui/button";
import { BookingActions } from "@/components/admin/BookingActions";
import { BookingPriceCell } from "@/components/admin/BookingPriceCell";

async function getBookings() {
    const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
        },
    });
    return bookings;
}

export default async function BookingsPage() {
    const bookings = await getBookings();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-500 hover:bg-green-600';
            case 'PENDING': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'CANCELLED': return 'bg-red-500 hover:bg-red-600';
            case 'COMPLETED': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Réservations</h1>
                    <p className="text-slate-500 mt-2">Suivez et gérez les réservations ({bookings.length}).</p>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Aucune réservation trouvée.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        {booking.type}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {booking.user ? (
                                                <>
                                                    <span className="font-medium">{booking.user.name || 'Utilisateur'}</span>
                                                    <span className="text-xs text-muted-foreground">{booking.user.email}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium italic text-slate-500">Invité</span>
                                                    <span className="text-xs text-slate-400">Non enregistré</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{booking.contactName}</span>
                                            <span className="text-xs text-muted-foreground">{booking.contactEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(booking.status)}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <BookingPriceCell
                                            bookingId={booking.id}
                                            initialPrice={booking.price}
                                            currency={booking.currency}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(booking.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell className="text-right">
                                        <BookingActions booking={booking} />
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
