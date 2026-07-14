import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/UserActions";
import { Users as UsersIcon } from "lucide-react";

async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            bookings: { orderBy: { createdAt: "desc" } },
            reviews: { orderBy: { createdAt: "desc" } },
        },
    });
    return users;
}

export default async function UsersPage() {
    const users = await getUsers();
    const admins = users.filter((u) => u.role === "ADMIN").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Utilisateurs
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {users.length} compte{users.length !== 1 ? "s" : ""}
                    {" · "}
                    {admins} admin{admins !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Utilisateur
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Rôle
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Réservations
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Inscrit le
                            </TableHead>
                            <TableHead className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-32 text-center"
                                >
                                    <UsersIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">
                                        Aucun utilisateur
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user.image || ""}
                                                    alt={user.name || ""}
                                                />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                                                    {user.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {user.name || "Sans nom"}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-medium ${
                                                user.role === "ADMIN"
                                                    ? "bg-violet-50 text-violet-700 border-violet-200"
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                            }`}
                                        >
                                            {user.role === "ADMIN"
                                                ? "Admin"
                                                : "Utilisateur"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600 tabular-nums">
                                            {user.bookings.length}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-500">
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <UserActions user={user} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
