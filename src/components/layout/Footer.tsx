'use client';

import React from "react";
import Link from "next/link";
import { Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer id="contact" className="bg-black text-white section-padding">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Revolution Travel & Services</h3>
                        <p className="text-white mb-4">
                            Votre partenaire de confiance pour tous vos voyages en avion.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                            >
                                <Facebook />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6">Services</h4>
                        <ul className="space-y-3 text-white">
                            <li><Link href="/#services" className="hover:text-blue-500 transition-colors">Recherche de Billets</Link></li>
                            <li><Link href="/#services" className="hover:text-blue-500 transition-colors">Réservation Hôtel</Link></li>
                            <li><Link href="/#services" className="hover:text-blue-500 transition-colors">Location de Voitures</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6">Destinations</h4>
                        <ul className="space-y-3 text-white">
                            <li><Link href="/#destinations" className="hover:text-blue-500 transition-colors">Europe</Link></li>
                            <li><Link href="/#destinations" className="hover:text-blue-500 transition-colors">Amérique</Link></li>
                            <li><Link href="/#destinations" className="hover:text-blue-500 transition-colors">Asie</Link></li>
                            <li><Link href="/#destinations" className="hover:text-blue-500 transition-colors">Afrique</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6">Contact</h4>
                        <div className="space-y-3 text-white">
                            <div className="flex items-center gap-2">
                                <Phone className="size-4" />
                                <a href="tel:677916832" className="hover:text-blue-500 transition-colors">6 77 91 68 32</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="size-4" />
                                <a href="mailto:p.revolutiontravel@yahoo.com" className="hover:text-blue-500 transition-colors">p.revolutiontravel@yahoo.com</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4" />
                                <span>Cameroun</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-white">
                    <p className="mb-4">&copy; {new Date().getFullYear()} Revolution Travel & Services. Tous droits réservés.</p>
                    <p className="text-sm text-gray-400 flex items-center justify-center gap-2 developer-credit">
                        Made with <span className="text-red-500 animate-heartbeat">❤️</span> by{" "}
                        <a
                            href="https://github.com/Tomdieu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
                        >
                            Tomdieu Ivan
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
