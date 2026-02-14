'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Home, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { NewDemandButton } from '@/components/dashboard/NewDemandButton';

interface DashboardHeaderProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const userInitials = user.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : user.email?.[0].toUpperCase() || 'U';

    return (
        <header
            className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? 'glass-premium shadow-glow bg-white/80 backdrop-blur-md border-b border-white/20 py-2'
                : 'bg-white border-b border-gray-100 py-3'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo - Identical to Landing Page */}
                    <Link href="/dashboard" className="flex items-center group transition-all duration-300">
                        <div className="relative">
                            <Image
                                src="/logo-image.png"
                                alt="Revolution Travel Logo"
                                width={32}
                                height={32}
                                className="mr-2 rounded-lg w-8 h-8 shadow-sm group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105"
                                priority
                            />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight hidden sm:block">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Revolution
                            </span>
                            <span className="text-gray-900 ml-1">Travel</span>
                        </h1>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user.role === 'ADMIN' && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="hidden md:flex rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors h-9"
                            >
                                <Link href="/admin">Administration</Link>
                            </Button>
                        )}

                        <div className="hidden sm:block">
                            <NewDemandButton userId={user.id} />
                        </div>

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full p-0 hover:bg-gray-100 transition-colors ml-1"
                                >
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src={user.image || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-medium">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 glass-premium rounded-2xl border border-white/40 shadow-2xl mt-2 p-2"
                            >
                                <DropdownMenuLabel className="font-normal px-3 py-2.5">
                                    <div className="flex flex-col space-y-1.5">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {user.name || 'Utilisateur'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                        {user.role === 'ADMIN' && (
                                            <Badge className="w-fit mt-1 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 font-medium text-xs rounded-md px-2 py-0.5">
                                                Administrateur
                                            </Badge>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                                <DropdownMenuItem asChild className="rounded-xl cursor-pointer focus:bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                                    <Link href="/dashboard/profile" className="flex items-center">
                                        <User className="mr-3 h-4 w-4 text-gray-500" />
                                        Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl cursor-pointer focus:bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                                    <Link href="/" className="flex items-center">
                                        <Home className="mr-3 h-4 w-4 text-gray-500" />
                                        Accueil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                                <DropdownMenuItem
                                    onClick={() => signOut({ redirectTo: "/" })}
                                    className="rounded-xl cursor-pointer focus:bg-red-50 px-3 py-2.5 text-sm text-red-600 focus:text-red-700"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}