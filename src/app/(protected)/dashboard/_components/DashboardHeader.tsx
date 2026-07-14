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
            className={`sticky top-0 w-full z-50 transition-all duration-200 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
                    : 'bg-white border-b border-slate-100'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <Image
                            src="/logo-image.png"
                            alt="Revolution Travel"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg"
                            priority
                        />
                        <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">
                            Revolution{' '}
                            <span className="font-normal text-slate-500">Travel</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {user.role === 'ADMIN' && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="hidden md:flex rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 h-9"
                            >
                                <Link href="/admin">Administration</Link>
                            </Button>
                        )}

                        <div className="hidden sm:block">
                            <NewDemandButton userId={user.id} />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-100 transition-colors ml-1"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.image || undefined} />
                                        <AvatarFallback className="bg-slate-900 text-white text-sm font-medium">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 rounded-xl border-slate-200 shadow-lg mt-2 p-2"
                            >
                                <DropdownMenuLabel className="font-normal px-3 py-2.5">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {user.name || 'Utilisateur'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user.email}
                                        </p>
                                        {user.role === 'ADMIN' && (
                                            <Badge className="w-fit mt-1 bg-slate-100 text-slate-700 hover:bg-slate-100 font-medium text-xs rounded-md px-2 py-0.5 border-0">
                                                Administrateur
                                            </Badge>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 my-2" />
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                    <Link href="/dashboard/profile" className="flex items-center">
                                        <User className="mr-3 h-4 w-4 text-slate-400" />
                                        Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                    <Link href="/" className="flex items-center">
                                        <Home className="mr-3 h-4 w-4 text-slate-400" />
                                        Accueil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 my-2" />
                                <DropdownMenuItem
                                    onClick={() => signOut({ redirectTo: "/" })}
                                    className="rounded-lg cursor-pointer focus:bg-red-50 px-3 py-2.5 text-sm text-red-600 focus:text-red-700"
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
