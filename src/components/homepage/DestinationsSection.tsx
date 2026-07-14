'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Destination {
    id: string;
    name: string;
    country: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
    emoji?: string | null;
    badge?: string | null;
    isPopular: boolean;
    order: number;
}

export function DestinationsSection() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDestinations() {
            try {
                const response = await fetch('/api/destinations?popular=true&active=true');
                const data = await response.json();

                if (data.success) {
                    setDestinations(data.destinations);
                } else {
                    setError('Erreur lors du chargement des destinations');
                }
            } catch (err) {
                console.error('Error fetching destinations:', err);
                setError('Erreur de connexion');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDestinations();
    }, []);

    if (isLoading) {
        return (
            <section className="section-padding bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                </div>
            </section>
        );
    }

    if (error || destinations.length === 0) {
        return null;
    }

    return (
        <section id="destinations" className="section-padding bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        Destinations populaires
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                        Découvrez nos destinations les plus prisées avec des tarifs exceptionnels
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map((destination) => (
                        <Card
                            key={destination.id}
                            className="group overflow-hidden border-slate-200 hover:border-slate-300 transition-all duration-300 rounded-xl"
                        >
                            <div className="relative h-52 overflow-hidden bg-slate-100">
                                {destination.imageUrl ? (
                                    <Image
                                        src={destination.imageUrl}
                                        alt={destination.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-6xl">
                                            {destination.emoji || '🌍'}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                {destination.badge && (
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-slate-900 text-white border-0 text-xs font-medium">
                                            {destination.badge}
                                        </Badge>
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">{destination.country}</span>
                                </div>
                            </div>

                            <CardContent className="p-5">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                    {destination.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {destination.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">À partir de</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {destination.price.toLocaleString('fr-FR')}{' '}
                                            <span className="text-xs font-normal text-slate-500">{destination.currency}</span>
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        onClick={() => {
                                            document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Réserver
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        onClick={() => {
                            document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <Plane className="w-4 h-4 mr-2" />
                        Voir toutes les destinations
                    </Button>
                </div>
            </div>
        </section>
    );
}
