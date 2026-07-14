'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Building,
  Car,
  ArrowRight,
} from 'lucide-react';
import FlightSearchDialog from '@/components/FlightSearchDialog';
import HotelSearchDialog from '@/components/HotelSearchDialog';
import CarRentalDialog from '@/components/CarRentalDialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface ServicesSectionProps {
  isDashboard?: boolean;
  userId?: string;
}

function ConseilVoyageForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Votre demande de conseil a été envoyée ! Un expert vous contactera sous peu.");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto p-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nom Complet</label>
            <Input placeholder="Votre nom" required className="h-11 rounded-lg border-slate-200 focus:border-slate-900 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Téléphone</label>
            <InputPhone defaultCountry="CM" required className="h-11 rounded-lg border-slate-200 focus:border-slate-900 transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Sujet de consultation</label>
          <Textarea
            placeholder="Décrivez votre projet de voyage ou vos questions..."
            className="min-h-[140px] rounded-lg border-slate-200 focus:border-slate-900 transition-colors p-3 resize-none"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
      >
        {isSubmitting ? "Envoi en cours..." : "Demander un Conseil Expert"}
      </Button>
    </form>
  );
}

export default function ServicesSection({ isDashboard = false, userId }: ServicesSectionProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const services = [
    {
      id: 'flights',
      title: 'Recherche de Billets',
      description: 'Comparez les meilleurs tarifs aériens parmi plus de 500 compagnies.',
      icon: Plane,
      href: '/services/flights',
      component: FlightSearchDialog,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 'hotels',
      title: 'Réservation Hôtel',
      description: 'Dénichez le séjour parfait parmi une sélection d\'établissements premium.',
      icon: Building,
      href: '/services/hotels',
      component: HotelSearchDialog,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 'cars',
      title: 'Location de Voitures',
      description: 'Large choix de véhicules récents pour vos déplacements en toute liberté.',
      icon: Car,
      href: '/services/cars',
      component: CarRentalDialog,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
  ] as const;

  return (
    <section id='services' className={isDashboard ? 'py-6' : 'py-24 bg-white relative'}>
      <div className={isDashboard ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className={isDashboard ? 'mb-6' : 'mb-16'}>
          {isDashboard ? (
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nouvelle Demande</h2>
              <p className="text-sm text-slate-500 mt-1">Sélectionnez le service dont vous avez besoin</p>
            </div>
          ) : (
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                Nos Services
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                De la réservation de billets à l&apos;organisation complète de votre séjour,
                Revolution Travel vous accompagne avec des solutions sur mesure.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;

            if (isDashboard) {
              const Component = service.component;
              const isOpen = openModal === service.id;

              return (
                <div key={service.id}>
                  <Card
                    className="group relative cursor-pointer border-slate-200 hover:border-slate-300 transition-all duration-300 rounded-xl h-full"
                    onClick={() => setOpenModal(service.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-10 h-10 rounded-lg ${service.iconBg} ${service.iconColor} flex items-center justify-center mb-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500 leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        Explorer
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </div>
                    </CardContent>
                  </Card>

                  {isOpen && (
                    <Component
                      isOpen={isOpen}
                      onOpenChange={(open) => setOpenModal(open ? service.id : null)}
                      userId={userId}
                    />
                  )}
                </div>
              );
            }

            return (
              <Link key={service.id} href={service.href}>
                <Card className="group relative cursor-pointer border-slate-200 hover:border-slate-300 transition-all duration-300 rounded-xl h-full">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${service.iconBg} ${service.iconColor} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                      En savoir plus
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {!isDashboard && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-slate-100">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Prix Transparents</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Aucun frais caché. Nos tarifs sont négociés directement avec nos partenaires.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Support 24/7</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Une assistance permanente pour gérer les imprévus durant tout votre voyage.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Flexibilité Totale</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Modifiez ou annulez vos réservations en toute sérénité grâce à nos options.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
