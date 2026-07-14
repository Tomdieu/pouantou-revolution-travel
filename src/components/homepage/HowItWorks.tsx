'use client';

import React from 'react';
import { Smartphone, ShieldCheck, Zap, Heart } from 'lucide-react';

const steps = [
    {
        icon: Smartphone,
        title: "Soumettez votre demande",
        desc: "Remplissez notre formulaire simple avec vos préférences de voyage.",
    },
    {
        icon: Zap,
        title: "Recherche instantanée",
        desc: "Notre équipe compare les meilleurs tarifs parmi 500+ compagnies.",
    },
    {
        icon: ShieldCheck,
        title: "Recevez votre devis",
        desc: "Obtenez une proposition détaillée sous 1 heure maximum.",
    },
    {
        icon: Heart,
        title: "Voyagez sereinement",
        desc: "Confirmation sécurisée et support 24/7 pendant votre séjour.",
    }
];

export default function HowItWorks() {
    return (
        <section className="section-padding bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        Comment ça marche
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                        Un processus fluide et transparent pour transformer vos rêves de voyage en réalité.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={idx}
                                className="relative p-6 bg-white border border-slate-100 rounded-xl transition-all duration-300 hover:border-slate-200 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-sm font-semibold text-slate-400 tabular-nums">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <Icon className="w-5 h-5 text-slate-600" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
