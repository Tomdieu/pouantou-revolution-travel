"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { ReviewActions } from "@/components/admin/ReviewActions"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export type Review = {
    id: string
    name: string
    jobTitle: string
    description: string
    stars: number
    isModerated: boolean
    createdAt: Date
}

export const columns: ColumnDef<Review>[] = [
    {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
            <div>
                <p className="text-sm font-medium text-slate-900">
                    {row.getValue("name")}
                </p>
                {row.original.jobTitle && (
                    <p className="text-xs text-slate-400">
                        {row.original.jobTitle}
                    </p>
                )}
            </div>
        ),
    },
    {
        accessorKey: "stars",
        header: "Note",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-slate-700 tabular-nums">
                    {row.getValue("stars")}
                </span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Message",
        cell: ({ row }) => (
            <p
                className="text-sm text-slate-600 truncate max-w-[360px]"
                title={row.getValue("description")}
            >
                {row.getValue("description")}
            </p>
        ),
    },
    {
        accessorKey: "isModerated",
        header: "Statut",
        cell: ({ row }) => {
            const isModerated = row.getValue("isModerated")
            return (
                <Badge
                    variant="outline"
                    className={`text-xs font-medium ${
                        isModerated
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                >
                    {isModerated ? "Approuvé" : "En attente"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                {format(new Date(row.getValue("createdAt")), "dd MMM yyyy", {
                    locale: fr,
                })}
            </span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const review = row.original
            return (
                <ReviewActions
                    id={review.id}
                    isModerated={review.isModerated}
                />
            )
        },
    },
]
