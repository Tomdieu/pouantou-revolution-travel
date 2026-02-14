'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Building, Car, ArrowRight } from 'lucide-react';
import FlightSearchForm from '@/components/FlightSearchForm';
import HotelSearchForm from '@/components/HotelSearchForm';
import CarRentalForm from '@/components/CarRentalForm';
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza';

interface ServicesSectionProps {
  isDashboard?: boolean;
  userId?: string;
}

export default function ServicesSection({ isDashboard = false, userId }: ServicesSectionProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const services = [
    {
      id: 'flights',
      title: 'Recherche de Vols',
      description: 'Trouvez et comparez les meilleurs tarifs aériens en temps réel',
      icon: Plane,
      form: <FlightSearchForm userId={userId} />
    },
    {
      id: 'hotels',
      title: 'Recherche d\'Hôtels',
      description: 'Découvrez les meilleurs hôtels dans votre destination',
      icon: Building,
      form: <HotelSearchForm userId={userId} />
    },
    {
      id: 'cars',
      title: 'Location de Voitures',
      description: 'Réservez la voiture parfaite pour votre voyage',
      icon: Car,
      form: <CarRentalForm userId={userId} />
    }
  ] as const;

  return (
    <section className={isDashboard ? 'py-6' : 'py-16 bg-white'}>
      <div className={isDashboard ? 'w-full' : 'max-w-6xl mx-auto px-6'}>

        <div className={isDashboard ? 'mb-6' : 'mb-12'}>
          {isDashboard ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Nouvelle Demande</h2>
                <p className="text-sm text-stone-500 mt-1">Réservez vols, hôtels ou voitures</p>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-semibold text-stone-900 mb-3">
                Recherchez et Réservez
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Une suite complète de services pour organiser votre voyage mémorable en quelques clics.
                Nous comparons les prix parmi des centaines de fournisseurs pour vous trouver les meilleures offres.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            const isOpen = openModal === service.id;

            return (
              <Credenza
                key={service.id}
                open={isOpen}
                onOpenChange={(open) => setOpenModal(open ? service.id : null)}
              >
                <CredenzaTrigger asChild>
                  <Card className="cursor-pointer hover:border-stone-300 transition-colors group h-full">
                    <CardHeader className="pb-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-stone-200 transition-colors">
                        <Icon className="w-5 h-5 text-stone-700" />
                      </div>
                      <CardTitle className="text-base font-semibold text-stone-900">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-stone-600 leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-sm font-medium text-stone-900 hover:text-stone-700 hover:bg-transparent group/btn"
                      >
                        Rechercher
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </CredenzaTrigger>

                <CredenzaContent className="sm:max-w-2xl">
                  <CredenzaHeader className="space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-stone-700" />
                      </div>
                      <CredenzaTitle className="text-lg font-semibold text-stone-900">
                        {service.title}
                      </CredenzaTitle>
                    </div>
                    <CredenzaDescription className="text-sm text-stone-600">
                      {service.description}
                    </CredenzaDescription>
                  </CredenzaHeader>
                  <CredenzaBody className="mt-6 pt-6 border-t border-stone-100 pb-10">
                    {service.form}
                  </CredenzaBody>
                </CredenzaContent>
              </Credenza>
            );
          })}
        </div>

        {/* {!isDashboard && (
          <div className="mt-16 pt-16 border-t border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2">Prix Transparents</h3>
                <p className="text-sm text-stone-600">Aucun frais caché. Ce que vous voyez est ce que vous payez.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2">Support Dédié</h3>
                <p className="text-sm text-stone-600">Une équipe d'experts à votre écoute 24h/24 et 7j/7.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-2">Flexibilité Totale</h3>
                <p className="text-sm text-stone-600">Modifiez vos plans facilement avec nos options flexibles.</p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
}