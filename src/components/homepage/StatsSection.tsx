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
        value: "150+",
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
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center text-center space-y-6 group"
                        >
                            <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-2xl">
                                {stat.icon}
                            </div>
                            <div className="space-y-1">
                                <span className="block text-5xl font-black text-white tracking-tight">{stat.value}</span>
                                <h4 className="text-lg font-bold text-blue-400 uppercase tracking-widest">{stat.label}</h4>
                                <p className="text-slate-400 font-medium">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
