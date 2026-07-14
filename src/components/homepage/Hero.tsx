'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';

interface HeroProps {
    scrollToSection: (id: string) => void;
}

export default function Hero({ scrollToSection }: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

            tl.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.6 })
                .from('.hero-title', { y: 40, opacity: 0 }, '-=0.4')
                .from('.hero-desc', { y: 24, opacity: 0 }, '-=0.5')
                .from('.hero-actions', { y: 20, opacity: 0 }, '-=0.5')
                .from('.hero-stats', { y: 20, opacity: 0 }, '-=0.4')
                .from('.hero-image', { scale: 1.05, opacity: 0, duration: 1.2 }, '-=0.8');
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            id="accueil"
            className="relative min-h-screen flex items-center bg-slate-50 overflow-hidden"
        >
            {/* Subtle background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(15,23,42,0.03),transparent_50%)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div className="hero-eyebrow">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                <span className="w-8 h-px bg-slate-300" />
                                Agence de voyage — Yaoundé
                            </span>
                        </div>

                        <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05]">
                            Voyagez sans
                            <br />
                            <span className="text-slate-900">compromis.</span>
                        </h1>

                        <p className="hero-desc text-lg sm:text-xl text-slate-500 max-w-lg leading-relaxed">
                            Spécialistes en billets d&apos;avion et réservations d&apos:hôtels.
                            Les meilleurs tarifs, service client disponible 24h/24.
                        </p>

                        <div className="hero-actions flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors duration-200 group"
                                onClick={() => scrollToSection('quote-form')}
                            >
                                Obtenir un devis
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-semibold border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl transition-all duration-200"
                                onClick={() => scrollToSection('services')}
                            >
                                Découvrir nos offres
                            </Button>
                        </div>

                        <div className="hero-stats flex items-center gap-10 pt-8">
                            {[
                                { value: '1 000+', label: 'Voyageurs' },
                                { value: '100+', label: 'Destinations' },
                                { value: '4.9/5', label: 'Avis clients' },
                            ].map((stat, i) => (
                                <div key={stat.label} className="flex flex-col">
                                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="hero-image relative hidden lg:block">
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                                alt="Destination de voyage"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Minimal overlay for text legibility if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                        </div>

                        {/* Floating stat card */}
                        {/* <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg shadow-slate-900/5 p-5 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">✈️</span>
                                </div>
                                <div>
                                    <span className="block text-lg font-bold text-slate-900">-40%</span>
                                    <span className="text-xs font-medium text-slate-400">Sur les vols internationaux</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <button
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => scrollToSection('quote-form')}
                aria-label="Défiler vers le formulaire"
            >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                    Dérouler
                </span>
                <ArrowDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors animate-bounce" />
            </button>
        </section>
    );
}
