'use client';

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityCombobox } from "@/components/ui/city-combobox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDownIcon, Facebook } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import the LocationMap component to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  ),
});
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { toast } from "sonner";
import {
  Menu,
  Send,
  FileText,
  Loader2,
  Home,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Download,
  CheckCircle,
  Clock,
  Star,
  Plane,
  Globe,
  Shield,
  Award,
  Users,
  ArrowDown
} from "lucide-react";
import Image from "next/image";
import { DestinationsSection } from "@/components/homepage/DestinationsSection";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/homepage/Hero";
import HowItWorks from "@/components/homepage/HowItWorks";
import StatsSection from "@/components/homepage/StatsSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";
import DevisForm from "@/components/DevisForm";
import ServicesSection from "@/components/ServicesSection";
import { ReviewsSection } from "@/components/homepage/ReviewsSection";
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Zod schema for form validation - Updated to match Amadeus API
const formSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Adresse email invalide"),
  departureCity: z.string().min(2, "Ville de départ requise"),
  destination: z.string().min(2, "Destination requise"),
  departureDate: z.date({ required_error: "Date de départ requise" }),
  returnDate: z.date().optional(),
  // Updated passenger fields to match Amadeus API
  adults: z.number().min(1, "Au moins 1 adulte requis").max(9, "Maximum 9 adultes"),
  children: z.number().min(0, "Nombre d'enfants invalide").max(9, "Maximum 9 enfants"),
  infants: z.number().min(0, "Nombre de bébés invalide").max(9, "Maximum 9 bébés"),
  travelClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"], {
    required_error: "Classe de voyage requise"
  }),
  preferredAirline: z.string().optional(),
  nonStop: z.boolean(),
  budget: z.string().optional(),
  currencyCode: z.string().length(3, "Code devise invalide"),
  maxPrice: z.number().optional(),
  additionalInfo: z.string().optional()
}).refine((data) => {
  // Validate that infants don't exceed adults (Amadeus requirement)
  if (data.infants > data.adults) {
    return false;
  }
  return true;
}, {
  message: `Le nombre de bébés ne peut pas dépasser le nombre d'adultes`,
  path: ["infants"]
}).refine((data) => {
  // Validate total seated travelers (adults + children) doesn't exceed 9
  if (data.adults + data.children > 9) {
    return false;
  }
  return true;
}, {
  message: `Le nombre total d'adultes et d'enfants ne peut pas dépasser 9`,
  path: ["children"]
}).refine((data) => {
  // Validate that departure date is not more than 365 days ahead (Amadeus limit)
  const today_date = new Date();
  const maxDate = new Date();
  maxDate.setDate(today_date.getDate() + 365);

  if (data.departureDate && data.departureDate > maxDate) {
    return false;
  }
  return true;
}, {
  message: "La date de départ ne peut pas être plus de 365 jours dans le futur",
  path: ["departureDate"]
}).refine((data) => {
  // Validate that departure date is not after return date
  if (data.returnDate && data.departureDate && data.departureDate > data.returnDate) {
    return false;
  }
  return true;
}, {
  message: "La date de retour doit être après la date de départ",
  path: ["returnDate"]
});

type FormData = z.infer<typeof formSchema>;

export default function LandingPage() {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Add hydration state to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Safe scroll function that only works after hydration
  const scrollToSection = (sectionId: string) => {
    if (!isHydrated) return;
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Form setup with react-hook-form and zod - Updated for Amadeus API
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      departureCity: '',
      destination: '',
      departureDate: (() => {
        // Set default date to tomorrow to avoid timezone issues
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        return tomorrow;
      })(),
      returnDate: undefined,
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY' as const,
      preferredAirline: 'none', // Changed to 'none' to match SelectItem value
      nonStop: false,
      budget: '',
      currencyCode: 'XAF',
      maxPrice: undefined,
      additionalInfo: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    console.log('Form submission started', data);
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Validate form data
      if (!data.departureCity || !data.destination) {
        toast.error("Veuillez sélectionner une ville de départ et une destination");
        return;
      }

      const formDataForAPI = {
        ...data,
        departureDate: data.departureDate.toISOString().split('T')[0],
        returnDate: data.returnDate?.toISOString().split('T')[0] || '',
        // Convert numbers to strings for backwards compatibility with email templates
        passengersTotal: data.adults + data.children + data.infants,
        adultsCount: data.adults,
        childrenCount: data.children,
        infantsCount: data.infants
      };

      console.log('Sending form data to API:', formDataForAPI);

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataForAPI),
      });

      const result = await response.json();
      console.log('API response:', { status: response.status, result });

      if (response.ok && result.success) {
        toast.success('Demande envoyée avec succès! Vous recevrez votre devis sous 1h.');
        setSubmitStatus({
          type: 'success',
          message: 'Demande envoyée avec succès! Vous recevrez votre devis sous 1h.'
        });
        // Reset form
        form.reset({
          fullName: '',
          phone: '',
          email: '',
          departureCity: '',
          destination: '',
          departureDate: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            return tomorrow;
          })(),
          returnDate: undefined,
          adults: 1,
          children: 0,
          infants: 0,
          travelClass: 'ECONOMY' as const,
          preferredAirline: 'none',
          nonStop: false,
          budget: '',
          currencyCode: 'XAF',
          maxPrice: undefined,
          additionalInfo: ''
        });
      } else {
        const errorMessage = result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.';
        toast.error(errorMessage);
        setSubmitStatus({
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
      toast.error(errorMessage);
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-white selection:bg-blue-100 selection:text-blue-600">
      <Header />
      <Hero scrollToSection={scrollToSection} />

      {/* Quote Request Form */}
      <section id="quote-form" className="py-16 bg-white">
        <DevisForm
        />
      </section>

      {/* New Services Section with Search Forms */}
      <ServicesSection />

      {/* Location Map Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Notre Localisation</h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Retrouvez notre agence à Yaoundé pour un service personnalisé
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <LocationMap />
            <div className="mt-8 text-center">
              <p className="text-lg text-gray-600">
                <MapPin className="inline-block w-5 h-5 mr-2 text-blue-500" />
                Revolution Travel & Services - Yaoundé, Cameroun
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Horaires d&apos;ouverture: Lundi - Samedi, 8h00 - 18h00
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <StatsSection />

      <DestinationsSection />

      <ReviewsSection />

      {/* Final CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
            Prêt à Décoller vers votre <span className="text-sky-300 italic">Prochaine Aventure</span>?
          </h2>
          <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed font-semibold">
            Rejoignez des milliers de clients satisfaits et profitez d'une expérience de voyage premium et sans stress.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="h-16 px-12 text-lg font-bold bg-white text-blue-600 hover:bg-slate-50 rounded-2xl shadow-2xl transition-all hover:-translate-y-1"
              onClick={() => scrollToSection('quote-form')}
            >
              <Send className="mr-3 w-6 h-6" />
              Obtenir un Devis Gratuit
            </Button>
            <a
              href="tel:677916832"
              className="h-16 px-12 text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 rounded-2xl transition-all hover:-translate-y-1 flex items-center justify-center"
            >
              <Phone className="mr-3 w-6 h-6" />
              Parler à un Expert
            </a>
          </div>

          <p className="text-blue-100/60 text-sm font-bold uppercase tracking-[0.2em]">
            ✈️ Plus de 500 compagnies aériennes partenaires
          </p>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://wa.me/237697281827"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Contactez-nous sur WhatsApp"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
          </svg>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Contactez-nous sur WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>

          {/* Pulse animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        </a>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
