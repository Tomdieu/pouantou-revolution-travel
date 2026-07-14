'use client';

import Link from 'next/link';
import { Building, ArrowRight, Check, Clock, Globe, Shield, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HotelSearchDialog from '@/components/HotelSearchDialog';
import { useState } from 'react';

export default function HotelsPageContent() {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors mb-8">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Tous les services
                    </Link>
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Service
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                            Réservation Hôtel
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed mb-8">
                            Dénichez le séjour parfait parmi une sélection d&apos;établissements premium
                            dans le monde entier. Tarifs préférentiels garantis.
                        </p>
                        <Button
                            className="h-12 px-8 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors duration-200"
                            onClick={() => setSearchOpen(true)}
                        >
                            Rechercher un hôtel
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
                                Ce que comprend notre service
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    'Sélection d\'hôtels vérifiés et notés par nos soins',
                                    'Tarifs préférentiels négociés directement avec les établissements',
                                    'Annulation gratuite sur la plupart des réservations',
                                    'Chambres, suites et appartements pour tous les budgets',
                                    'Accès aux services VIP et extras sur demande',
                                    'Conseils personnalisés par nos experts voyage',
                                    'Réservation sécurisée avec confirmation instantanée',
                                    'Assistance 24/7 pendant votre séjour',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-slate-900 mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">
                                Comment ça marche
                            </h3>
                            <div className="space-y-6">
                                {[
                                    {
                                        step: '1',
                                        title: 'Indiquez vos critères',
                                        text: 'Destination, dates d\'arrivée et de départ, nombre de voyageurs.',
                                    },
                                    {
                                        step: '2',
                                        title: 'Comparez les offres',
                                        text: 'Parcourez notre sélection d\'hôtels avec les meilleurs tarifs du moment.',
                                    },
                                    {
                                        step: '3',
                                        title: 'Réservez en ligne',
                                        text: 'Finalisez votre réservation en quelques clics, avec confirmation immédiate.',
                                    },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-white">{item.step}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Building, value: '10 000+', label: 'Établissements' },
                            { icon: Globe, value: '100+', label: 'Pays couverts' },
                            { icon: Clock, value: '24/7', label: 'Support disponible' },
                            { icon: Shield, value: '100%', label: 'Sécurisé' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon className="w-5 h-5 text-slate-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-950">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                        Trouvez l&apos;hôtel idéal
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Lancez votre recherche ou contactez un expert pour un séjour sur mesure.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            className="h-12 px-8 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                            onClick={() => setSearchOpen(true)}
                        >
                            Rechercher un hôtel
                        </Button>
                        <a
                            href="tel:677916832"
                            className="h-12 px-8 text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            6 77 91 68 32
                        </a>
                    </div>
                </div>
            </section>

            {/* Related Services */}
            <section className="py-16 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight text-center">
                        Autres services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link
                            href="/services/flights"
                            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-2">Recherche de Billets</h3>
                            <p className="text-sm text-slate-500">Comparez les tarifs aériens parmi 500+ compagnies.</p>
                        </Link>
                        <Link
                            href="/services/cars"
                            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-2">Location de Voitures</h3>
                            <p className="text-sm text-slate-500">Louez un véhicule pour vos déplacements en toute liberté.</p>
                        </Link>
                    </div>
                </div>
            </section>

            <HotelSearchDialog isOpen={searchOpen} onOpenChange={setSearchOpen} />
        </div>
    );
}
