"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";

interface UserActionsProps {
    user: any; // Using any for simplicity as the Full user type is complex with relations, but it matches what UserDetailsDialog expects
}

export function UserActions({ user }: UserActionsProps) {
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
                {/* 
                    Using onSelect={(e) => e.preventDefault()} prevents the dropdown 
                    from closing immediately when the dialog trigger is clicked, 
                    allowing the dialog to open.
                */}
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <div className="w-full cursor-pointer p-0 select-none outline-none">
                        <UserDetailsDialog user={user} />
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => {
                        // Implement delete functionality later
                        console.log("Delete user", user.id);
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
