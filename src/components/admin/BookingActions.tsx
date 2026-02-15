"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, PlayCircle } from "lucide-react";
import { BookingDetailsDialog } from "@/components/admin/BookingDetailsDialog";
import { updateBookingStatus } from "@/actions/booking-actions";
import { toast } from "sonner";
import { BookingStatus } from "@prisma/client";

interface BookingActionsProps {
    booking: any; // We can improve typing later
}

export function BookingActions({ booking }: BookingActionsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (status: BookingStatus) => {
        setIsLoading(true);
        try {
            const result = await updateBookingStatus(booking.id, status as any); // Cast for now if needed due to import issues
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <BookingDetailsDialog booking={booking}>
                    <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 w-full cursor-pointer">
                        Voir détails
                    </div>
                </BookingDetailsDialog>

                <DropdownMenuSeparator />

                {booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('CONFIRMED')}
                        disabled={isLoading}
                    >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Confirmer
                    </DropdownMenuItem>
                )}

                {booking.status === 'CONFIRMED' && (
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('COMPLETED')}
                        disabled={isLoading}
                    >
                        <PlayCircle className="mr-2 h-4 w-4 text-blue-600" /> Terminer
                    </DropdownMenuItem>
                )}

                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('CANCELLED')}
                        disabled={isLoading}
                        className="text-red-600 focus:text-red-600"
                    >
                        <XCircle className="mr-2 h-4 w-4" /> Annuler
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
