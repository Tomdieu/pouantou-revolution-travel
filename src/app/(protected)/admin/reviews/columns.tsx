"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { ReviewActions } from "@/components/admin/ReviewActions"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
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
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("name")}</span>
                    <span className="text-xs text-muted-foreground">{row.original.jobTitle}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "stars",
        header: "Note",
        cell: ({ row }) => {
            return (
                <div className="flex items-center text-yellow-500">
                    <span className="font-bold mr-1">{row.getValue("stars")}</span>
                    <Star className="h-4 w-4 fill-current" />
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Message",
        cell: ({ row }) => {
            return (
                <div className="truncate py-4 max-w-[400px]">
                    <span title={row.getValue("description")}>{row.getValue("description")}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "isModerated",
        header: "Statut",
        cell: ({ row }) => {
            const isModerated = row.getValue("isModerated")
            return (
                <div className="flex w-[100px] items-center">
                    <Badge variant={isModerated ? 'default' : 'destructive'}>
                        {isModerated ? 'Approuvé' : 'En attente'}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            return (
                <div>
                    {format(new Date(row.getValue("createdAt")), "dd MMM yyyy", { locale: fr })}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const review = row.original
            return <ReviewActions id={review.id} isModerated={review.isModerated} />
        },
    },
]
