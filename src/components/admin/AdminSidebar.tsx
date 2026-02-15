'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Star,
    Settings,
    Menu,
    X,
    LogOut,
    Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AdminSidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [pathname, isMobile]);

    // Handle window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const routes = [
        {
            href: '/admin',
            label: 'Tableau de bord',
            icon: LayoutDashboard,
            active: pathname === '/admin',
        },
        {
            href: '/admin/users',
            label: 'Utilisateurs',
            icon: Users,
            active: pathname.startsWith('/admin/users'),
        },
        {
            href: '/admin/bookings',
            label: 'Réservations',
            icon: CalendarDays,
            active: pathname.startsWith('/admin/bookings'),
        },
        {
            href: '/admin/reviews',
            label: 'Avis & Témoignages',
            icon: Star,
            active: pathname.startsWith('/admin/reviews'),
        },
        {
            href: '/admin/destinations',
            label: 'Destinations',
            icon: Plane,
            active: pathname.startsWith('/admin/destinations'),
        },
        {
            href: '/admin/settings',
            label: 'Paramètres',
            icon: Settings,
            active: pathname.startsWith('/admin/settings'),
        },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                variant="ghost"
                className="lg:hidden fixed top-4 left-4 z-50 p-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Sidebar Overlay for Mobile */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-slate-800 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    className
                )}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo-image.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-xl tracking-wide text-blue-400">Revolution<span className="text-white">Admin</span></span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                                route.active
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <route.icon className={cn("h-5 w-5", route.active ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            {route.label}
                        </Link>
                    ))}
                </div>

                {/* User / Footer Area */}
                <div className="p-4 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-x-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Déconnexion</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
