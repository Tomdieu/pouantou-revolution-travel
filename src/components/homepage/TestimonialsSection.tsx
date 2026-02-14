'use client';

import React from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';

const testimonials = [
    {
        name: "Chantal Ngozi",
        role: "Femme d'Affaires",
        image: "https://i.pravatar.cc/150?u=chantal",
        content: "Service exceptionnel! L'équipe m'a trouvé un excellent tarif pour mon voyage d'affaires à Paris. Processus très professionnel et rapide.",
        rating: 5
    },
    {
        name: "Paul Mbarga",
        role: "Ingénieur IT",
        image: "https://i.pravatar.cc/150?u=paul",
        content: "Parfait pour mon voyage d'études. Ils ont trouvé un vol abordable et m'ont aidé avec toute la documentation. Je recommande vivement!",
        rating: 5
    },
    {
        name: "Grace Fotso",
        role: "Mère de famille",
        image: "https://i.pravatar.cc/150?u=grace",
        content: "Excellent service pour organiser nos vacances familiales à Dubai. Prix compétitifs et service client très à l'écoute de nos besoins.",
        rating: 5
    }
];

export default function TestimonialsSection() {
    return (
        <section className="section-padding bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 text-center lg:text-left">
                    <div className="space-y-4">
                        <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm">Avis de nos clients</h2>
                        <h3 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                            Ce Que Disent <br className="hidden lg:block" />
                            Nos <span className="text-gradient">Voyageurs</span>
                        </h3>
                    </div>
                    <p className="text-lg text-slate-600 max-w-xl font-medium">
                        Découvrez pourquoi des milliers de voyageurs font confiance à Revolution Travel pour leurs déplacements internationaux.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className="group card-modern p-10 bg-slate-50 border-none shadow-none hover:bg-white hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="flex gap-1 mb-8">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <div className="relative mb-8">
                                <MessageSquareQuote className="absolute -top-4 -left-4 w-12 h-12 text-blue-100 -z-10" />
                                <p className="text-lg text-slate-700 leading-relaxed italic font-medium">
                                    "{t.content}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mt-auto pt-8 border-t border-slate-200/60">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">{t.name}</h4>
                                    <p className="text-sm font-bold text-blue-500 uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
