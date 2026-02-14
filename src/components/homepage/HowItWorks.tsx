'use client';

import React from 'react';
import { Smartphone, ShieldCheck, Zap, Heart } from 'lucide-react';

const steps = [
    {
        icon: <Smartphone className="w-8 h-8" />,
        title: "Soumettez votre demande",
        desc: "Remplissez notre formulaire simple avec vos préférences de voyage.",
        color: "bg-blue-500",
        light: "bg-blue-50",
        text: "text-blue-600"
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Recherche instantanée",
        desc: "Notre équipe compare les meilleurs tarifs parmi 500+ compagnies.",
        color: "bg-indigo-500",
        light: "bg-indigo-50",
        text: "text-indigo-600"
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "Recevez votre devis",
        desc: "Obtenez une proposition détaillée sous 1 heure maximum.",
        color: "bg-purple-500",
        light: "bg-purple-50",
        text: "text-purple-600"
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Voyagez sereinement",
        desc: "Confirmation sécurisée et support 24/7 pendant votre séjour.",
        color: "bg-pink-500",
        light: "bg-pink-50",
        text: "text-pink-600"
    }
];

export default function HowItWorks() {
    return (
        <section className="section-padding bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm">Simplifiez vos voyages</h2>
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                        Comment Ça <span className="text-gradient">Marche</span> ?
                    </h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Un processus fluide et transparent pour transformer vos rêves de voyage en réalité en quelques clics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="group card-modern p-10 space-y-8 bg-white"
                        >
                            <div className={`w-20 h-20 rounded-[24px] ${step.light} ${step.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                {step.icon}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">{idx + 1}</span>
                                    <h4 className="text-xl font-bold text-slate-900">{step.title}</h4>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Animation bar */}
                            <div className="h-1 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-700 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px]" />
            </div>
        </section>
    );
}
