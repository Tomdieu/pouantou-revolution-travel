'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Header() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const isAuthenticated = status === "authenticated";

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <Image
                            src="/logo-image.png"
                            alt="Revolution Travel"
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg transition-transform duration-300 group-hover:scale-105"
                            priority
                        />
                        <span className="text-lg font-bold tracking-tight text-slate-900">
                            Revolution{' '}
                            <span className="font-normal text-slate-500">Travel</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center">
                        <div className="flex items-center gap-1">
                            {[
                                { label: 'Accueil', href: '/#accueil' },
                                { label: 'Services', href: '/#services' },
                                { label: 'Destinations', href: '/#destinations' },
                                { label: 'Contact', href: '/#contact' },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-lg hover:bg-slate-50"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors duration-200"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Tableau de bord
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors duration-200"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Créer un compte
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        type="button"
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${
                    isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-4 pb-4 pt-2 bg-white/95 backdrop-blur-md border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                        {[
                            { label: 'Accueil', href: '/#accueil' },
                            { label: 'Services', href: '/#services' },
                            { label: 'Destinations', href: '/#destinations' },
                            { label: 'Contact', href: '/#contact' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                                onClick={closeMenu}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                                onClick={closeMenu}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Tableau de bord
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                    onClick={closeMenu}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                                    onClick={closeMenu}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Créer un compte
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
