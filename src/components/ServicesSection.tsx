'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Building,
  Car,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import FlightSearchDialog from '@/components/FlightSearchDialog';
import HotelSearchDialog from '@/components/HotelSearchDialog';
import CarRentalDialog from '@/components/CarRentalDialog';
import DevisForm from '@/components/DevisForm';
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { toast } from 'sonner';

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
            <Input placeholder="Votre nom" required className="h-12 rounded-xl bg-white/50 border-gray-100 focus:border-blue-500 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
            <InputPhone defaultCountry="CM" required className="h-12 rounded-xl bg-white/50 border-gray-100 focus:border-blue-500 transition-all font-medium" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Sujet de consultation</label>
          <Textarea
            placeholder="Décrivez votre projet de voyage ou vos questions..."
            className="min-h-[150px] rounded-2xl bg-white/50 border-gray-100 focus:border-blue-500 transition-all font-medium p-4 resize-none"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-stone-200"
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
      component: FlightSearchDialog,
      gradient: 'from-sky-500/10 to-blue-500/10',
      iconColor: 'text-sky-600'
    },
    {
      id: 'hotels',
      title: 'Réservation Hôtel',
      description: 'Dénichez le séjour parfait parmi une sélection d\'établissements premium.',
      icon: Building,
      component: HotelSearchDialog,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'cars',
      title: 'Location de Voitures',
      description: 'Large choix de véhicules récents pour vos déplacements en toute liberté.',
      icon: Car,
      component: CarRentalDialog,
      gradient: 'from-orange-500/10 to-amber-500/10',
      iconColor: 'text-orange-600'
    },
  ] as const;

  return (
    <section id='services' className={isDashboard ? 'py-6' : 'py-24 bg-stone-50/50 relative overflow-hidden'}>
      {/* Decorative gradients */}
      {!isDashboard && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px] -z-10" />
        </>
      )}

      <div className={isDashboard ? 'w-full' : 'max-w-7xl mx-auto px-6'}>
        <div className={isDashboard ? 'mb-6' : 'mb-16'}>
          {isDashboard ? (
            <div>
              <h2 className="text-xl font-black text-stone-900 italic tracking-tight">Nouvelle Demande</h2>
              <p className="text-sm text-stone-500 mt-1 font-medium">Sélectionnez le service dont vous avez besoin</p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Services Premium</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 italic tracking-tight">
                Une Expertise Complète <br />
                <span className="text-blue-600">Pour Vos Voyages</span>
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed font-medium">
                De la réservation de billets à l'organisation complète de votre séjour,
                Pouantou Revolution Travel vous accompagne avec des solutions sur mesure et un support dédié.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const Component = service.component;
            const isOpen = openModal === service.id;

            return (
              <div key={service.id}>
                <Card 
                  className="group relative overflow-hidden cursor-pointer border-stone-200 bg-white hover:bg-stone-50 transition-all duration-300 hover:-translate-y-1 rounded-xl h-full"
                  onClick={() => setOpenModal(service.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <CardHeader className="pb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${service.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-black text-stone-900 mb-2 italic tracking-tight">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-stone-500 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    <div className="flex items-center gap-2 text-stone-900 font-black text-sm uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                      Explorer
                      <ArrowRight className="w-4 h-4" />
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
          })}
        </div>

        {!isDashboard && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-stone-200/60 pt-16">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-2 italic">Prix Transparents</h3>
                <p className="text-sm text-stone-500 font-medium">Aucun frais caché. Nos tarifs sont négociés directement avec nos partenaires.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-2 italic">Support 24/7</h3>
                <p className="text-sm text-stone-500 font-medium">Une assistance permanente pour gérer les imprévus durant tout votre voyage.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-2 italic">Flexibilité Totale</h3>
                <p className="text-sm text-stone-500 font-medium">Modifiez ou annulez vos réservations en toute sérénité grâce à nos options.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}