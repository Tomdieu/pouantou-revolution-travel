'use client';

import React from 'react';

const stats = [
    {
        value: "1 000+",
        label: "Clients satisfaits",
    },
    {
        value: "100+",
        label: "Destinations",
    },
    {
        value: "24/7",
        label: "Support client",
    },
    {
        value: "12 ans",
        label: "D'expérience",
    }
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <span className="block text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
                                {stat.value}
                            </span>
                            <span className="block mt-2 text-sm text-slate-400">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
