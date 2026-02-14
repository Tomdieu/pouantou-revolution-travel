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
            <section className="section-padding bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                </div>
            </section>
        );
    }

    if (error || destinations.length === 0) {
        return null;
    }

    return (
        <section id="destinations" className="section-padding bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
                        <Plane className="w-4 h-4" />
                        <span className="text-sm font-semibold">Voyagez avec nous</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        Destinations <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Populaires</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Découvrez nos destinations les plus prisées avec des tarifs exceptionnels
                    </p>
                </div>

                {/* Destinations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((destination, index) => (
                        <Card
                            key={destination.id}
                            className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
                            style={{
                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                            }}
                        >
                            {/* Image Section */}
                            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                                {destination.imageUrl ? (
                                    <Image
                                        src={destination.imageUrl}
                                        alt={destination.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-8xl group-hover:scale-110 transition-transform duration-500">
                                            {destination.emoji || '🌍'}
                                        </span>
                                    </div>
                                )}

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                {/* Badge */}
                                {destination.badge && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-red-500 text-white border-0 shadow-lg">
                                            {destination.badge}
                                        </Badge>
                                    </div>
                                )}

                                {/* Location indicator */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">{destination.country}</span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {destination.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {destination.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">À partir de</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {destination.price.toLocaleString('fr-FR')} <span className="text-sm font-normal">{destination.currency}</span>
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="group-hover:bg-blue-600 group-hover:text-white transition-all"
                                        onClick={() => {
                                            // Scroll to quote form
                                            document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Réserver
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <p className="text-gray-600 mb-6">
                        🌟 Plus de 50 destinations disponibles !
                    </p>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        onClick={() => {
                            document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <Plane className="w-5 h-5 mr-2" />
                        Voir Toutes les Destinations
                    </Button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
}
