'use client';

import React from 'react';
import { Users, Globe, Award, Headphones } from 'lucide-react';

const stats = [
    {
        icon: <Users className="w-8 h-8" />,
        value: "1,000+",
        label: "Clients Satisfaits",
        desc: "Voyageurs heureux"
    },
    {
        icon: <Globe className="w-8 h-8" />,
        value: "100+",
        label: "Destinations",
        desc: "Partout dans le monde"
    },
    {
        icon: <Headphones className="w-8 h-8" />,
        value: "24/7",
        label: "Support Client",
        desc: "Toujours à l'écoute"
    },
    {
        icon: <Award className="w-8 h-8" />,
        value: "12 Ans",
        label: "D'Expérience",
        desc: "Expertise reconnue"
    }
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-slate-900 relative overflow-hidden">
            {/* Subtle background blur */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center text-center space-y-4 group"
                        >
                            <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 group-hover:text-blue-300 transition-all duration-300">
                                {stat.icon}
                            </div>
                            <div className="space-y-2">
                                <span className="block text-4xl font-black text-white tracking-tight">{stat.value}</span>
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{stat.label}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
