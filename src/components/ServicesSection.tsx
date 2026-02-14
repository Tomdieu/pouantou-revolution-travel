'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Building, Car, Search, Calendar, MapPin, Users } from 'lucide-react';
import FlightSearchForm from '@/components/FlightSearchForm';
import HotelSearchForm from '@/components/HotelSearchForm';
import CarRentalForm from '@/components/CarRentalForm';
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaClose,
} from '@/components/ui/credenza';

interface ServicesSectionProps {
  isDashboard?: boolean;
}

export default function ServicesSection({ isDashboard = false }: ServicesSectionProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const services = [
    {
      id: 'flights',
      title: 'Recherche de Vols',
      description: 'Trouvez et comparez les meilleurs tarifs aériens en temps réel',
      icon: Plane,
      gradient: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50/50',
      features: ['Prix compétitifs', 'Compagnies majeures', 'Vols directs & escales'],
      form: <FlightSearchForm />
    },
    {
      id: 'hotels',
      title: 'Recherche d\'Hôtels',
      description: 'Découvrez les meilleurs hôtels dans votre destination',
      icon: Building,
      gradient: 'from-violet-600 to-indigo-600',
      bgColor: 'bg-indigo-50/50',
      features: ['Étoiles et avis', 'Photos détaillées', 'Prix exclusifs'],
      form: <HotelSearchForm />
    },
    {
      id: 'cars',
      title: 'Location de Voitures',
      description: 'Réservez la voiture parfaite pour votre voyage',
      icon: Car,
      gradient: 'from-blue-500 to-blue-700',
      bgColor: 'bg-sky-50/50',
      features: ['Toutes marques', 'Assurance incluse', 'Kilométrage illimité'],
      form: <CarRentalForm />
    }
  ];

  return (
    <section id="services-forms" className={`${isDashboard ? 'py-8' : 'py-24 relative overflow-hidden bg-slate-50/50'}`}>
      {/* Decorative Background Elements - Only for Landing */}
      {!isDashboard && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full" />
        </div>
      )}

      <div className={`${isDashboard ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        {/* Header - Different for Dashboard */}
        {!isDashboard ? (
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tight animate-fade-in-up">
              Recherchez et <span className="text-gradient">Réservez</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up animate-stagger-1">
              Une suite complète de services pour organiser votre voyage mémorable en quelques clics.
            </p>
          </div>
        ) : (
          <div className="mb-8 pl-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
              Nouvelle Demande
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              Organisez votre prochain voyage en un instant
            </p>
          </div>
        )}

        {/* Service Cards */}
        <div className={`grid grid-cols-1 ${isDashboard ? 'sm:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-3'} gap-6 lg:gap-8 mb-12`}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Credenza key={service.id} open={openModal === service.id} onOpenChange={(open) => setOpenModal(open ? service.id : null)}>
                <CredenzaTrigger asChild>
                  <div
                    className={`group cursor-pointer glass-premium rounded-[2rem] ${isDashboard ? 'p-6' : 'p-8'} border border-white/40 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 transition-all duration-500 animate-scale-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Icon Container */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-blue-500/20`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className={`${isDashboard ? 'text-xs' : 'text-sm'} text-gray-500 mb-6 leading-relaxed font-bold`}>
                      {service.description}
                    </p>

                    {/* Features List - Only for Landing or if enough space */}
                    {!isDashboard && (
                      <div className="space-y-3 mb-8">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm font-semibold text-gray-700">
                            <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-3 shadow-sm`}></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button className={`w-full h-12 bg-gradient-to-r ${service.gradient} hover:shadow-blue-500/40 transform active:scale-95 transition-all duration-300 text-white font-black rounded-2xl border-none text-xs uppercase tracking-widest`}>
                      <Search className="w-4 h-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                </CredenzaTrigger>

                <CredenzaContent className="max-w-3xl glass-premium border-none p-0 overflow-hidden rounded-[2.5rem]">
                  <div className="p-1">
                    <CredenzaHeader className="p-8 pb-4">
                      <CredenzaTitle className="flex items-center gap-4 text-3xl font-black">
                        <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          {service.title}
                        </span>
                      </CredenzaTitle>
                      <CredenzaDescription className="text-gray-500 text-lg font-bold mt-2">
                        {service.description}
                      </CredenzaDescription>
                    </CredenzaHeader>

                    <CredenzaBody className="p-8 pt-2 overflow-y-auto max-h-[80vh]">
                      <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-1 border border-white/40 shadow-inner">
                        {service.form}
                      </div>
                    </CredenzaBody>
                  </div>
                </CredenzaContent>
              </Credenza>
            );
          })}
        </div>

        {/* Benefits Section - Only for Landing */}
        {!isDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Plane,
                title: "Prix Transparents",
                desc: "Aucun frais caché. Ce que vous voyez est ce que vous payez.",
                color: "from-blue-600 to-indigo-600"
              },
              {
                icon: Users,
                title: "Support Dédié",
                desc: "Une équipe d'experts à votre écoute 24h/24 et 7j/7.",
                color: "from-violet-600 to-purple-600"
              },
              {
                icon: Calendar,
                title: "Flexibilité Totale",
                desc: "Modifiez vos plans facilement avec nos options flexibles.",
                color: "from-blue-400 to-blue-600"
              }
            ].map((benefit, i) => {
              const BIcon = benefit.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/40 transition-colors duration-500 group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <BIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed italic opacity-80">
                    "{benefit.desc}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
