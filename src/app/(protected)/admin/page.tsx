import { VisitorChart } from "@/components/admin/VisitorChart";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
    Users,
    CalendarDays,
    TrendingUp,
    Eye,
    Star,
    ArrowRight,
    Plane,
    MapPin,
} from "lucide-react";

async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        userCount,
        bookingCount,
        reviewCount,
        bookings,
        recentBookings,
        recentReviews,
        destinationCount,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.booking.count(),
        prisma.review.count({ where: { isModerated: false } }),
        prisma.booking.findMany({
            select: { price: true, status: true },
        }),
        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: true },
        }),
        prisma.review.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
        prisma.destination.count(),
    ]);

    const revenue = bookings
        .filter((b) => b.status !== "CANCELLED" && b.price)
        .reduce((acc, curr) => acc + (curr.price || 0), 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawVisitors = await prisma.visitor.findMany({
        where: { visitedAt: { gte: sevenDaysAgo } },
        orderBy: { visitedAt: "asc" },
    });

    const visitorsByDay: Record<string, number> = {};
    const last7Days: string[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        visitorsByDay[dateStr] = 0;
        last7Days.unshift(dateStr);
    }

    rawVisitors.forEach((v) => {
        const dateStr = v.visitedAt.toISOString().split("T")[0];
        if (visitorsByDay[dateStr] !== undefined) {
            visitorsByDay[dateStr]++;
        }
    });

    const visitorChartData = last7Days.map((date) => ({
        date: new Date(date).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
        }),
        count: visitorsByDay[date],
    }));

    const totalVisitors = Object.values(visitorsByDay).reduce(
        (a, b) => a + b,
        0
    );

    return {
        userCount,
        bookingCount,
        reviewCount,
        revenue,
        visitorChartData,
        totalVisitors,
        destinationCount,
        recentActivity: [
            ...recentBookings.map((b) => ({
                id: b.id,
                type: "BOOKING" as const,
                title: `${b.contactName || "Client"} — ${b.type === "FLIGHT" ? "Vol" : b.type === "HOTEL" ? "Hôtel" : "Voiture"}`,
                subtitle: b.status,
                date: b.createdAt,
            })),
            ...recentReviews.map((r) => ({
                id: r.id,
                type: "REVIEW" as const,
                title: `${r.name} — ${r.stars} étoile${r.stars > 1 ? "s" : ""}`,
                subtitle: r.description?.slice(0, 60) || "",
                date: r.createdAt,
            })),
        ]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 6),
    };
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const formatCurrency = (amountInEur: number) => {
        const amountInXaf = amountInEur * 655.957;
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            maximumFractionDigits: 0,
        }).format(amountInXaf);
    };

    const statItems = [
        {
            label: "Réservations",
            value: stats.bookingCount,
            icon: CalendarDays,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Revenus",
            value: formatCurrency(stats.revenue),
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Utilisateurs",
            value: stats.userCount,
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            label: "Visiteurs (7j)",
            value: stats.totalVisitors,
            icon: Eye,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    const statusColor: Record<string, string> = {
        PENDING: "bg-amber-50 text-amber-700",
        CONFIRMED: "bg-emerald-50 text-emerald-700",
        CANCELLED: "bg-red-50 text-red-600",
        COMPLETED: "bg-slate-100 text-slate-500",
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Tableau de bord
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Vue d&apos;ensemble de votre activité
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white border border-slate-200"
                    >
                        <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                        >
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500 truncate">
                                {stat.label}
                            </p>
                            <p className="text-lg font-semibold text-slate-900 tabular-nums">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Chart */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">
                        Visiteurs
                    </h2>
                    <VisitorChart data={stats.visitorChartData} />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Activité récente
                        </h2>
                    </div>
                    <div className="space-y-0">
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-400 py-8 text-center">
                                Aucune activité
                            </p>
                        ) : (
                            stats.recentActivity.map((activity, i) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
                                >
                                    <div
                                        className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                                            activity.type === "BOOKING"
                                                ? "bg-blue-50"
                                                : "bg-amber-50"
                                        }`}
                                    >
                                        {activity.type === "BOOKING" ? (
                                            <Plane
                                                className={`w-3.5 h-3.5 ${
                                                    activity.type === "BOOKING"
                                                        ? "text-blue-600"
                                                        : "text-amber-600"
                                                }`}
                                            />
                                        ) : (
                                            <Star className="w-3.5 h-3.5 text-amber-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">
                                            {activity.subtitle}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                                        {formatDistanceToNow(activity.date, {
                                            addSuffix: true,
                                            locale: fr,
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: "Réservations",
                        href: "/admin/bookings",
                        icon: CalendarDays,
                        count: stats.bookingCount,
                    },
                    {
                        label: "Destinations",
                        href: "/admin/destinations",
                        icon: MapPin,
                        count: stats.destinationCount,
                    },
                    {
                        label: "Avis en attente",
                        href: "/admin/reviews",
                        icon: Star,
                        count: stats.reviewCount,
                    },
                ].map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <link.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            <span className="text-sm font-medium text-slate-700">
                                {link.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                                {link.count}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
