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
        <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'glass-premium shadow-glow py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center group transition-all duration-300">
                            <div className="relative">
                                <Image
                                    src="/logo-image.png"
                                    alt="Revolution Travel Logo"
                                    width={32}
                                    height={32}
                                    className="mr-2 rounded-lg w-8 h-8 sm:w-9 sm:h-9 shadow-md group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                    priority
                                />
                                <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/10 transition-all duration-500" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Revolution</span>
                                <span className="text-gray-900 ml-1">Travel</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Centered Navigation Links */}
                    <div className="hidden lg:flex items-center justify-center flex-1">
                        <div className="flex space-x-1 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm">
                            <Link href="/#accueil" className="px-4 py-1 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50">Accueil</Link>
                            <Link href="/#services" className="px-4 py-1 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50">Services</Link>
                            <Link href="/#destinations" className="px-4 py-1 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50">Destinations</Link>
                            <Link href="/#contact" className="px-4 py-1 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50">Contact</Link>
                        </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Tableau de bord
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Créer un compte
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-blue-600 focus:outline-none transition-all duration-300 p-2 hover:bg-blue-50 rounded-xl"
                            onClick={toggleMenu}
                        >
                            <span className="sr-only">Open menu</span>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
                    <div className="p-4 glass-premium rounded-2xl border border-white/40 shadow-2xl space-y-2 animate-fade-in-up">
                        <Link href="/#accueil" className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-xl transition-all" onClick={closeMenu}>Accueil</Link>
                        <Link href="/#services" className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-xl transition-all" onClick={closeMenu}>Services</Link>
                        <Link href="/#destinations" className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-xl transition-all" onClick={closeMenu}>Destinations</Link>
                        <Link href="/#contact" className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-xl transition-all" onClick={closeMenu}>Contact</Link>
                        <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-2">
                            {isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all"
                                    onClick={closeMenu}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Tableau de bord
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                                        onClick={closeMenu}
                                    >
                                        <LogIn className="h-5 w-5" />
                                        Connexion
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all"
                                        onClick={closeMenu}
                                    >
                                        <UserPlus className="h-5 w-5" />
                                        Créer un compte
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
