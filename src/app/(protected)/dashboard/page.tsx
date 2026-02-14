import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingList } from '@/components/dashboard/BookingList';
import { Button } from '@/components/ui/button';
import { Plane, LogOut, LayoutDashboard, Clock, CheckCircle2, PartyPopper, ArrowRight, User, ShieldCheck, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/auth';
import ServicesSection from '@/components/ServicesSection';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Parse searchDetails JSON
    type Booking = typeof bookings[number];
    const bookingsWithParsedDetails = bookings.map((booking: Booking) => ({
        ...booking,
        searchDetails: JSON.parse(booking.searchDetails),
    }));

    const stats = [
        {
            label: 'Total Réservations',
            value: bookings.length,
            icon: Plane,
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
        },
        {
            label: 'En attente',
            value: bookings.filter((b) => b.status === 'PENDING').length,
            icon: Clock,
            color: 'yellow',
            bgColor: 'bg-yellow-500/10',
            textColor: 'text-yellow-600',
        },
        {
            label: 'Confirmées',
            value: bookings.filter((b) => b.status === 'CONFIRMED').length,
            icon: CheckCircle2,
            color: 'green',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-600',
        },
        {
            label: 'Terminées',
            value: bookings.filter((b) => b.status === 'COMPLETED').length,
            icon: PartyPopper,
            color: 'indigo',
            bgColor: 'bg-indigo-500/10',
            textColor: 'text-indigo-600',
        },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] relative overflow-hidden flex flex-col scroll-smooth">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-blue-50/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Dashboard Header Container */}
            <div className="relative z-10 border-b border-gray-200/50 bg-white/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <LayoutDashboard className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                                    Mon Tableau de Bord
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bienvenue,</span>
                                    <span className="text-sm font-bold text-blue-600">{session.user.name || session.user.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/#services-hub">
                                <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nouvelle Demande
                                </Button>
                            </Link>

                            {session.user.role === 'ADMIN' && (
                                <Button variant="outline" className="h-12 px-6 rounded-2xl border-white bg-white/50 backdrop-blur-sm font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white" asChild>
                                    <Link href="/admin">Administration</Link>
                                </Button>
                            )}
                            <Button variant="outline" className="h-12 px-6 rounded-2xl border-white bg-white/50 backdrop-blur-sm font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white" asChild>
                                <Link href="/" className="flex items-center gap-2">
                                    <Home className="w-3.5 h-3.5" />
                                    Accueil
                                </Link>
                            </Button>
                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/' });
                            }}>
                                <Button type="submit" variant="ghost" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-600 hover:bg-red-50 transition-all">
                                    <LogOut className="w-3.5 h-3.5 mr-2" />
                                    Déconnexion
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <main className="relative z-10 flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="glass-premium p-6 rounded-[2rem] border border-white/40 shadow-xl group hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bgColor} ${stat.textColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Services Hub (New Request Section) */}
                    <div id="services-hub" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <ServicesSection isDashboard />
                    </div>

                    {/* Booking List Container */}
                    <div className="glass-premium rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                                    <Plane className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Mes Réservations</h2>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                                {bookings.length} Demandes
                            </span>
                        </div>
                        <BookingList bookings={bookingsWithParsedDetails} />
                    </div>
                </div>
            </main>

            {/* Subtle glass footer inside dashboard */}
            <footer className="relative z-10 py-8 border-t border-gray-100 bg-white/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Plane className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-900">Revolution Travel</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        &copy; 2024 Voyagez avec excellence. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-4 h-4 text-gray-300" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Données Sécurisées</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
