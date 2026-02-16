"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateBookingPrice } from "@/actions/booking-actions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface BookingPriceCellProps {
    bookingId: string;
    initialPrice: number | null;
    currency: string | null;
}

export function BookingPriceCell({ bookingId, initialPrice, currency }: BookingPriceCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [priceValue, setPriceValue] = useState(initialPrice?.toString() || '');
    const [currentPrice, setCurrentPrice] = useState(initialPrice);

    const handleSave = async () => {
        const price = parseFloat(priceValue);
        if (isNaN(price)) {
            toast.error("Prix invalide");
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateBookingPrice(bookingId, price);
            if (result.success) {
                toast.success("Prix mis à jour");
                setCurrentPrice(price);
                setIsEditing(false);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setPriceValue(currentPrice?.toString() || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1 min-w-[120px]">
                <div className="relative flex-1">
                    <Input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        className="h-8 text-sm font-medium pr-8"
                        autoFocus
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium pointer-events-none">
                        {currency || 'EUR'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group min-h-[32px]">
            <span className="text-sm font-medium text-slate-900">
                {currentPrice !== null ? formatCurrency(currentPrice, currency || 'EUR') : '-'}
            </span>
            <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
            >
                <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
            </Button>
        </div>
    );
}
