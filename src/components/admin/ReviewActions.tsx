'use client';

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTransition } from "react";
import { deleteReview, toggleReviewStatus } from "@/actions/review-actions";
import { Loader2 } from "lucide-react";

interface ReviewActionsProps {
    id: string;
    isModerated: boolean;
}

export function ReviewActions({ id, isModerated }: ReviewActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggleStatus = () => {
        startTransition(async () => {
            const result = await toggleReviewStatus(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

        startTransition(async () => {
            const result = await deleteReview(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Ouvrir menu</span>
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    className={isModerated ? "text-orange-600 focus:text-orange-600 focus:bg-orange-50" : "text-green-600 focus:text-green-600 focus:bg-green-50"}
                >
                    {isModerated ? (
                        <>
                            <X className="mr-2 h-4 w-4" /> Retirer approbation
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Approuver
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
