'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Send, Briefcase, Play, ArrowRight, ArrowDown, Plane } from 'lucide-react';
import { gsap } from 'gsap';

interface HeroProps {
    scrollToSection: (id: string) => void;
}

export default function Hero({ scrollToSection }: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const visualsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

            tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.8 })
                .from('.hero-title span', { y: 100, opacity: 0, stagger: 0.2 }, '-=0.4')
                .from('.hero-desc', { y: 30, opacity: 0 }, '-=0.6')
                .from('.hero-btns', { y: 20, opacity: 0 }, '-=0.6')
                .from('.hero-visual', { scale: 0.8, opacity: 0, duration: 1.5 }, '-=1')
                .from('.video-btn', { scale: 0, opacity: 0 }, '-=0.8');

            // Floating icons animation
            gsap.to('.floating-icon', {
                y: -15,
                duration: 2,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: -1,
                stagger: {
                    each: 0.5,
                    from: 'random'
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            id="accueil"
            className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-white"
        >
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Text Content */}
                    <div ref={textRef} className="space-y-8 text-center lg:text-left">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Votre Voyage Commence Ici
                        </div>

                        <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] text-slate-900 tracking-tight">
                            <span className="block italic font-light text-blue-600 mb-2">Explorez le</span>
                            <span className="block">Monde avec</span>
                            <span className="block text-gradient">Revolution Travel</span>
                        </h1>

                        <p className="hero-desc text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Spécialistes en <span className="text-blue-600 font-bold">billets d'avion</span> et <span className="text-indigo-600 font-bold">réservations d'hôtels</span>.
                            Obtenez les meilleurs tarifs et un service client exceptionnel 24h/24 et 7j/7.
                        </p>

                        <div className="hero-btns flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <Button
                                size="lg"
                                className="h-16 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 group"
                                onClick={() => scrollToSection('quote-form')}
                            >
                                Planifier un Voyage
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 px-10 text-lg font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl transition-all hover:-translate-y-1"
                                onClick={() => scrollToSection('services')}
                            >
                                Découvrir nos offres
                            </Button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="hero-btns flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black text-slate-900 line-clamp-1">1k+</span>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Voyageurs</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black text-slate-900 line-clamp-1">100+</span>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Destinations</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black text-slate-900 line-clamp-1">4.9/5</span>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avis Clients</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div ref={visualsRef} className="hero-visual relative hidden lg:block">
                        <div className="relative z-10 w-full aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl group">
                            <Image
                                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                                alt="Beautiful Travel Destination"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            {/* Overlay Content */}
                            <div className="absolute bottom-10 left-10 right-10 p-8 glass-premium rounded-3xl border border-white/30 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <h3 className="text-2xl font-bold mb-2">Découvrez les Maldives</h3>
                                <p className="text-sm opacity-90 leading-relaxed font-medium">Profitez de nos offres exclusives pour des vacances inoubliables au paradis.</p>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        {/* <div className="floating-icon absolute -top-10 -right-10 w-48 h-48 glass-premium p-6 rounded-[30px] border border-white/40 shadow-2xl flex flex-col justify-center gap-4 z-20">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Plane className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <span className="block text-2xl font-black text-slate-900 line-clamp-1">-40% Off</span>
                                <span className="text-xs font-bold text-slate-500 uppercase">Vols Internationaux</span>
                            </div>
                        </div> */}

                        {/* <div className="floating-icon absolute -bottom-8 -left-12 w-56 p-6 glass-premium rounded-[30px] border border-white/40 shadow-2xl flex items-center gap-4 z-20" style={{ animationDelay: '0.8s' }}>
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Traveler" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <span className="block text-lg font-black text-slate-900 leading-none">2k+</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Voyageurs ce mois</span>
                            </div>
                        </div> */}

                        {/* Decoration Orbs */}
                        <div className="absolute -z-10 -top-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
                        <div className="absolute -z-10 -bottom-20 -right-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px]" />
                    </div>

                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => scrollToSection('quote-form')}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Dérouler</span>
                <div className="w-6 h-10 rounded-full border-2 border-slate-200 flex justify-center p-1">
                    <div className="w-1 h-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
            </div>
        </section>
    );
}
