import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitorChart } from "@/components/admin/VisitorChart";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Users, Star, TrendingUp, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
        dailyVisitors
    ] = await Promise.all([
        prisma.user.count(),
        prisma.booking.count(),
        prisma.review.count({ where: { isModerated: false } }),
        prisma.booking.findMany({
            select: { price: true, status: true }
        }),
        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        }),
        prisma.review.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.visitor.groupBy({
            by: ['visitedAt'],
            _count: {
                ip: true
            },
            take: 7,
            orderBy: {
                visitedAt: 'desc'
            }
        })
    ]);

    // Calculate revenue (excluding cancelled)
    const revenue = bookings
        .filter(b => b.status !== 'CANCELLED' && b.price)
        .reduce((acc, curr) => acc + (curr.price || 0), 0);

    // Process visitor data for chart (group by day) - Simplified for now since groupBy date part in Prisma is tricky without raw query
    // We will do a raw query for better date grouping or just use the last 7 days count
    // Switching to findMany for visitors in last 7 days and grouping manually in JS for accuracy
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawVisitors = await prisma.visitor.findMany({
        where: {
            visitedAt: {
                gte: sevenDaysAgo
            }
        },
        orderBy: {
            visitedAt: 'asc'
        }
    });

    const visitorsByDay: Record<string, number> = {};
    const last7Days: string[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        visitorsByDay[dateStr] = 0;
        last7Days.unshift(dateStr);
    }

    rawVisitors.forEach(v => {
        const dateStr = v.visitedAt.toISOString().split('T')[0];
        if (visitorsByDay[dateStr] !== undefined) {
            visitorsByDay[dateStr]++;
        }
    });

    const visitorChartData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        count: visitorsByDay[date]
    }));

    const totalVisitors = Object.values(visitorsByDay).reduce((a, b) => a + b, 0);

    return {
        userCount,
        bookingCount,
        reviewCount,
        revenue,
        visitorChartData,
        totalVisitors,
        recentActivity: [
            ...recentBookings.map(b => ({
                id: b.id,
                type: 'BOOKING',
                title: `${b.contactName || 'Client'} a réservé ${b.type}`,
                subtitle: b.status,
                date: b.createdAt
            })),
            ...recentReviews.map(r => ({
                id: r.id,
                type: 'REVIEW',
                title: `${r.name} a laissé un avis`,
                subtitle: `${r.stars} étoiles`,
                date: r.createdAt
            }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7)
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
                <p className="text-slate-500 mt-2">Vue d&apos;ensemble de votre activité en temps réel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.userCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Réservations</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus (Est. XAF)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visiteurs (7j)</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                        <p className="text-xs text-muted-foreground">Uniques par jour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <VisitorChart data={stats.visitorChartData} />

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-500">Aucune activité récente.</p>
                            ) : (
                                stats.recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-slate-400">
                                            {formatDistanceToNow(activity.date, { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
