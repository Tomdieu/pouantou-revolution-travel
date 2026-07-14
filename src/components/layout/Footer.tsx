'use client';

import React from "react";
import Link from "next/link";
import { Facebook, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
    return (
        <footer id="contact" className="bg-slate-950 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                            Revolution Travel
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-400 mb-6 max-w-xs">
                            Votre partenaire de confiance pour tous vos voyages en avion.
                            Billets, hôtels et locations de voitures.
                        </p>
                        <a
                            href="https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
                        >
                            <Facebook className="h-4 w-4" />
                            Facebook
                        </a>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                            Services
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Recherche de Billets', href: '/#services' },
                                { label: 'Réservation Hôtel', href: '/#services' },
                                { label: 'Location de Voitures', href: '/#services' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Destinations */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                            Destinations
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Europe', href: '/#destinations' },
                                { label: 'Amérique', href: '/#destinations' },
                                { label: 'Asie', href: '/#destinations' },
                                { label: 'Afrique', href: '/#destinations' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                            Contact
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="tel:677916832"
                                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    6 77 91 68 32
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:p.revolutiontravel@yahoo.com"
                                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    p.revolutiontravel@yahoo.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <MapPin className="h-4 w-4 shrink-0" />
                                Yaoundé, Cameroun
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Revolution Travel & Services. Tous droits réservés.
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                        Développé par{' '}
                        <a
                            href="https://github.com/Tomdieu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-0.5 font-medium"
                        >
                            Tomdieu Ivan
                            <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
