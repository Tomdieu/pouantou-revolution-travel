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
import { StructuredData } from "@/components/StructuredData";
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
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

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
    // Only run animations after hydration to prevent SSR/client mismatch
    if (!isHydrated) return;

    // Hero section animations
    const tl = gsap.timeline();
    
    if (navRef.current) {
      tl.fromTo(navRef.current, 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
    
    if (heroRef.current) {
      const heroTitle = heroRef.current.querySelector('h1');
      const heroText = heroRef.current.querySelector('p');
      const heroButtons = heroRef.current.querySelectorAll('button');
      
      if (heroTitle) {
        tl.fromTo(heroTitle, 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
          "-=0.5"
        );
      }
      
      if (heroText) {
        tl.fromTo(heroText, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 
          "-=0.3"
        );
      }
      
      if (heroButtons.length > 0) {
        tl.fromTo(heroButtons, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power3.out" }, 
          "-=0.2"
        );
      }
    }

    // Services animation on scroll
    if (servicesRef.current) {
      const serviceCards = servicesRef.current.querySelectorAll('.service-card');
      if (serviceCards.length > 0) {
        gsap.fromTo(serviceCards, 
          { y: 80, opacity: 0, scale: 0.8 }, 
          { 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.8, 
            stagger: 0.2, 
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: servicesRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    // Destinations cards animation
    if (destinationsRef.current) {
      const destinationCards = destinationsRef.current.querySelectorAll('.destination-card');
      if (destinationCards.length > 0) {
        gsap.fromTo(destinationCards, 
          { y: 100, opacity: 0, rotationY: -15 }, 
          { 
            y: 0, 
            opacity: 1, 
            rotationY: 0, 
            duration: 1, 
            stagger: 0.15, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: destinationsRef.current,
              start: "top 75%",
              end: "bottom 25%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    // Stats counter animation
    if (statsRef.current) {
      const statNumbers = statsRef.current.querySelectorAll('.stat-number');
      if (statNumbers.length > 0) {
        gsap.fromTo(statNumbers, 
          { innerText: 0, opacity: 0 }, 
          { 
            innerText: (_i: number, el: any) => el.getAttribute('data-count'),
            opacity: 1,
            duration: 2, 
            ease: "power2.out",
            snap: { innerText: 1 },
            stagger: 0.2,
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    // Testimonials animation
    if (testimonialsRef.current) {
      const testimonialCards = testimonialsRef.current.querySelectorAll('.testimonial-card');
      if (testimonialCards.length > 0) {
        gsap.fromTo(testimonialCards, 
          { x: -50, opacity: 0, rotation: -5 }, 
          { 
            x: 0, 
            opacity: 1, 
            rotation: 0, 
            duration: 0.8, 
            stagger: 0.3, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    // Floating animation for background elements
    const floatingElements = document.querySelectorAll(".floating-element");
    if (floatingElements.length > 0) {
      gsap.to(floatingElements, {
        y: -20,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
    }

    // Parallax effect for destination section background
    if (destinationsRef.current) {
      const bgDecoration = destinationsRef.current.querySelector('.bg-decoration');
      if (bgDecoration) {
        gsap.to(bgDecoration, {
          yPercent: -50,
          ease: "none",
          scrollTrigger: {
            trigger: destinationsRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }

    // Cleanup ScrollTrigger on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };

  }, [isHydrated]);

  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-br from-sky-50 to-primary-50">
      {/* Navigation */}
      <nav ref={navRef} className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo-image.png"
                  alt="Revolution Travel & Services Logo"
                  width={40}
                  height={40}
                  className="mr-2 sm:mr-3 rounded-lg w-8 h-8 sm:w-10 sm:h-10"
                  priority
                />
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-blue-500">
                  <span className="hidden sm:inline">Revolution Travel & Services</span>
                  <span className="sm:hidden">Revolution Travel</span>
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#accueil" className="text-black hover:text-blue-500 font-medium transition-colors">Accueil</a>
                <a href="#services" className="text-black hover:text-blue-500 font-medium transition-colors">Services</a>
                <a href="#destinations" className="text-black hover:text-blue-500 font-medium transition-colors">Destinations</a>
                <a href="#contact" className="text-black hover:text-blue-500 font-medium transition-colors">Contact</a>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-500 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors p-2"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) {
                    menu.classList.toggle('hidden');
                  }
                }}
              >
                <span className="sr-only">Open menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div id="mobile-menu" className="hidden md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <a 
                href="#accueil" 
                className="block px-3 py-2 text-black hover:text-blue-500 font-medium transition-colors"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) menu.classList.add('hidden');
                }}
              >
                Accueil
              </a>
              <a 
                href="#services" 
                className="block px-3 py-2 text-black hover:text-blue-500 font-medium transition-colors"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) menu.classList.add('hidden');
                }}
              >
                Services
              </a>
              <a 
                href="#destinations" 
                className="block px-3 py-2 text-black hover:text-blue-500 font-medium transition-colors"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) menu.classList.add('hidden');
                }}
              >
                Destinations
              </a>
              <a 
                href="#quote-form" 
                className="block px-3 py-2 text-black hover:text-blue-500 font-medium transition-colors"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) menu.classList.add('hidden');
                }}
              >
                Demander un Devis
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 overflow-hidden py-16 sm:py-20">
        {/* Enhanced background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-5 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-5 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 sm:w-40 sm:h-40 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 right-5 sm:right-10 w-20 h-20 sm:w-28 sm:h-28 bg-blue-500/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
          
          {/* Animated Plane - Hidden on mobile for better performance */}
          <div className="hidden sm:block absolute top-1/2 left-0 transform -translate-y-1/2 w-64 sm:w-96 h-32 sm:h-48 opacity-10 animate-plane-fly">
            <Image 
              src="/plane.png" 
              alt="Airplane" 
              width={500}
              height={500}
              className="w-full h-full object-contain filter brightness-0 invert opacity-30"
            />
          </div>
          
          {/* Floating icons - Reduced on mobile */}
          <div className="absolute top-20 sm:top-32 left-1/4 text-2xl sm:text-4xl opacity-20 animate-bounce">✈️</div>
          <div className="absolute top-32 sm:top-40 right-1/3 text-xl sm:text-3xl opacity-15 animate-bounce" style={{animationDelay: '0.5s'}}>🌍</div>
          <div className="absolute bottom-32 sm:bottom-40 left-1/3 text-3xl sm:text-5xl opacity-10 animate-bounce" style={{animationDelay: '1s'}}>🏖️</div>
          <div className="absolute bottom-24 sm:bottom-32 right-1/4 text-xl sm:text-3xl opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}>🎯</div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" 
               style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div ref={heroRef} className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 sm:mb-8 leading-tight">
                <span className="bg-gradient-to-r from-black via-blue-500 to-blue-500 bg-clip-text text-transparent">
                  Réservez et Voyagez
                </span>
                <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 bg-clip-text text-transparent">
                  Partout dans le Monde
                </span>
                <span className="block mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-500 bg-clip-text text-transparent font-black">
                  7 JOURS/7
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-black mb-8 sm:mb-12 max-w-4xl leading-relaxed">
                Spécialistes en <span className="font-semibold text-blue-600">réservation et vente de billets d'avion</span> - <span className="font-semibold text-purple-600">réservation hôtel</span>
                <span className="block mt-2 text-blue-500 font-semibold">
                  Soumettez votre demande de voyage et recevez les meilleurs tarifs personnalisés sous 1h.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center mb-8 sm:mb-12">
                <Button 
                  size="default" 
                  className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl" 
                  onClick={() => scrollToSection('quote-form')}
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Demander un Devis
                </Button>
                <Button  
                  size="default" 
                  className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl" 
                  onClick={() => scrollToSection('services')}
                >
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Nos Services
                </Button>
              </div>
              
              {/* Simple trust indicators - Better mobile layout */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-6 mt-6 sm:mt-8">
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
                  <Clock className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-black font-semibold text-sm sm:text-base">Service 7 jours/7</span>
                </div>
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-black font-semibold text-sm sm:text-base">Réponse sous 1h</span>
                </div>
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
                  <Award className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-black font-semibold text-sm sm:text-base">Prix compétitifs</span>
                </div>
              </div>
            </div>

            {/* Plane Image - Better mobile handling */}
            <div className="order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
                <Image 
                  src="/plane.png" 
                  alt="Airplane - Revolution Travel Services" 
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain opacity-60 sm:opacity-80 animate-float"
                  priority
                />
                {/* Decorative elements around the plane - Smaller on mobile */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/30 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -left-4 sm:-left-8 text-lg sm:text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>✈️</div>
                <div className="absolute bottom-1/4 -right-4 sm:-right-8 text-lg sm:text-2xl animate-bounce" style={{animationDelay: '1s'}}>🌍</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced scroll indicator */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center mb-2 bg-white/20 backdrop-blur-sm">
              <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">Découvrir nos services</p>
            <svg className="w-4 h-4 text-gray-400 mt-1 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div> */}
      </section>

      {/* Quote Request Form */}
      <section id="quote-form" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Demande de Devis
            </h2>
            <p className="text-black">
              Remplissez le formulaire et recevez votre devis personnalisé sous 1h.
            </p>
          </div>

          {/* Status Message */}
          {submitStatus.message && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-xl">
                    {submitStatus.type === 'success' ? '✅' : '❌'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {submitStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            {isHydrated && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log('Form validation errors:', errors);
                  toast.error("Veuillez corriger les erreurs dans le formulaire");
                  
                  // Focus on first error field
                  const firstErrorField = Object.keys(errors)[0];
                  if (firstErrorField) {
                    const element = document.querySelector(`[name="${firstErrorField}"]`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      (element as HTMLElement).focus();
                    }
                  }
                })} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nom Complet *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Votre nom et prénom" 
                            className="h-10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="votre.email@exemple.com" 
                            className="h-10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Téléphone *</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+237 6XX XXX XXX" 
                          className="h-10" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departureCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Ville de Départ *</FormLabel>
                        <FormControl>
                          <CityCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Ex: Douala, Yaoundé..."
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Destination *</FormLabel>
                        <FormControl>
                          <CityCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Ex: Paris, New York..."
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Date de Départ *</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-10 justify-between font-normal"
                              >
                                {field.value ? field.value.toLocaleDateString() : "Sélectionner une date"}
                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) field.onChange(date);
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0); // Reset time to start of day
                                  const maxDate = new Date();
                                  maxDate.setMonth(today.getMonth() + 9);
                                  maxDate.setHours(23, 59, 59, 999); // Set to end of day
                                  return date < today || date > maxDate;
                                }}
                                defaultMonth={field.value || new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Date de Retour</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-10 justify-between font-normal"
                              >
                                {field.value ? field.value.toLocaleDateString() : "Optionnel pour aller simple"}
                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                captionLayout="dropdown"
                                onSelect={(date) => field.onChange(date)}
                                disabled={(date) => {
                                  const departureDate = form.watch("departureDate");
                                  const maxDate = new Date();
                                  maxDate.setMonth(new Date().getMonth() + 9);
                                  
                                  if (!departureDate) {
                                    return date < new Date() || date > maxDate;
                                  }
                                  
                                  const departureDateStart = new Date(departureDate);
                                  departureDateStart.setHours(0, 0, 0, 0);
                                  
                                  return date < departureDateStart || date > maxDate;
                                }}
                                defaultMonth={field.value || form.watch("departureDate") || new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Passengers - Updated for Amadeus API */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Passagers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Adults */}
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Adultes (12+ ans) *</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Nombre d'adultes" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {Array.from({length: 9}, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Adulte{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Children */}
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Enfants (2-11 ans)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Nombre d'enfants" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {Array.from({length: 10}, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Enfant{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Infants */}
                    <FormField
                      control={form.control}
                      name="infants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Bébés (0-2 ans)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Nombre de bébés" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {Array.from({length: 10}, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Bébé{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-gray-500">
                            Les bébés voyagent sur les genoux d'un adulte
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Travel Class and Flight Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="travelClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Classe de Voyage *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl className="w-full">
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choisir une classe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="ECONOMY">Économique</SelectItem>
                            <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                            <SelectItem value="BUSINESS">Business</SelectItem>
                            <SelectItem value="FIRST">Première Classe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Non-Stop Preference */}
                  <FormField
                    control={form.control}
                    name="nonStop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border px-4 py-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            Vols directs uniquement
                          </FormLabel>
                          <p className="text-xs text-gray-500">
                            Rechercher seulement les vols sans escale
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Budget and Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Budget estimé (FCFA)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl className="w-full">
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Votre budget approximatif" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="50000-200000">50,000 - 200,000 FCFA</SelectItem>
                            <SelectItem value="200000-400000">200,000 - 400,000 FCFA</SelectItem>
                            <SelectItem value="400000-600000">400,000 - 600,000 FCFA</SelectItem>
                            <SelectItem value="600000-800000">600,000 - 800,000 FCFA</SelectItem>
                            <SelectItem value="800000-1000000">800,000 - 1,000,000 FCFA</SelectItem>
                            <SelectItem value="1000000+">Plus de 1,000,000 FCFA</SelectItem>
                            <SelectItem value="flexible">Budget flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredAirline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Compagnie Préférée</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl className="w-full">
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Aucune préférence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="none">Aucune préférence</SelectItem>
                            <SelectItem value="AF">Air France</SelectItem>
                            <SelectItem value="TK">Turkish Airlines</SelectItem>
                            <SelectItem value="EK">Emirates</SelectItem>
                            <SelectItem value="LH">Lufthansa</SelectItem>
                            <SelectItem value="BA">British Airways</SelectItem>
                            <SelectItem value="ET">Ethiopian Airlines</SelectItem>
                            <SelectItem value="QR">Qatar Airways</SelectItem>
                            <SelectItem value="AT">Royal Air Maroc</SelectItem>
                            <SelectItem value="QC">Camair-Co</SelectItem>
                            <SelectItem value="KL">KLM</SelectItem>
                            <SelectItem value="SN">Brussels Airlines</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Currency and Max Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currencyCode"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-ful">
                        <FormLabel className="text-sm font-medium">Devise Préférée</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl className="w-full">
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choisir une devise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            <SelectItem value="USD">Dollar US (USD)</SelectItem>
                            <SelectItem value="GBP">Livre Sterling (GBP)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Prix Maximum (par personne)</FormLabel>
                        <FormControl className="w-full">
                          <Input 
                            type="number"
                            placeholder="Ex: 500000 (optionnel)" 
                            className="h-10"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseInt(value) : undefined);
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">
                          Prix limite par voyageur dans la devise sélectionnée
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Informations Supplémentaires</FormLabel>
                      <FormControl className="w-full">
                        <Textarea 
                          placeholder="Exigences particulières, restrictions alimentaires, assistance spéciale..."
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log('Submit button clicked!');
                      console.log('Current form values:', form.getValues());
                      console.log('Form errors:', form.formState.errors);
                    }}
                    className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer ma Demande de Devis'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Comment Ça Marche ?</h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Un processus simple et transparent pour obtenir les meilleurs tarifs aériens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Soumettez Votre Demande</h3>
              <p className="text-black">
                Remplissez notre formulaire avec vos détails de voyage et préférences
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Nous Recherchons</h3>
              <p className="text-black">
                Notre équipe compare les tarifs de toutes les compagnies aériennes
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Vous Recevez le Devis</h3>
              <p className="text-black">
                Nous vous contactons sous 1h avec les meilleures options et prix
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Réservation Confirmée</h3>
              <p className="text-black">
                Une fois votre choix fait, nous procédons à la réservation sécurisée
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg inline-block">
              <h3 className="text-2xl font-bold text-blue-500 mb-2">⏱️ Délai de Réponse</h3>
              <p className="text-black text-lg">Maximum 24 heures pour recevoir votre devis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Nos Services</h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Une gamme complète de services pour faire de votre voyage une expérience inoubliable : billets d'avion, réservations d'hôtels et accompagnement personnalisé
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Plane className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Recherche de Billets</h3>
              <p className="text-black mb-6">
                Nous recherchons les meilleurs tarifs auprès de toutes les compagnies aériennes pour vous offrir les prix les plus compétitifs.
              </p>
              <ul className="text-black space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Recherche multi-compagnies
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Meilleurs prix garantis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Devis sous 1h
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Réservation Hôtel</h3>
              <p className="text-black mb-6">
                Trouvez et réservez les meilleurs hébergements selon votre budget et vos préférences partout dans le monde.
              </p>
              <ul className="text-black space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Hôtels de qualité
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Prix négociés
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Toutes catégories
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Conseil Personnalisé</h3>
              <p className="text-black mb-6">
                Nos experts vous accompagnent pour choisir la meilleure option selon vos besoins et votre budget.
              </p>
              <ul className="text-black space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Conseillers expérimentés
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Service 24/7
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Suivi personnalisé
                </li>
              </ul>
            </div>

            {/* Service 4 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Suivi de Demande</h3>
              <p className="text-black mb-6">
                Nous vous tenons informés à chaque étape de votre demande et vous accompagnons jusqu'à la réservation finale.
              </p>
              <ul className="text-black space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Suivi personnalisé
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Réservation sécurisée
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                  Documentation complète
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section ref={destinationsRef} id="destinations" className="section-padding bg-gradient-to-br from-black via-black to-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="bg-decoration absolute inset-0 opacity-10">
          <div className="floating-element absolute top-10 left-10 text-6xl">✈️</div>
          <div className="floating-element absolute top-32 right-20 text-4xl">🌍</div>
          <div className="floating-element absolute bottom-20 left-1/4 text-5xl">🏛️</div>
          <div className="floating-element absolute bottom-10 right-10 text-3xl">🗽</div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Destinations <span className="text-orange-500">Populaires</span>
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Découvrez nos destinations les plus prisées avec des tarifs exceptionnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                city: "Paris", 
                country: "France", 
                price: "À partir de 450,000 FCFA", 
                image: "🗼",
                gradient: "from-blue-500 to-blue-500",
                description: "Ville lumière et romance"
              },
              { 
                city: "New York", 
                country: "États-Unis", 
                price: "À partir de 650,000 FCFA", 
                image: "🗽",
                gradient: "from-orange-500 to-orange-500",
                description: "La ville qui ne dort jamais"
              },
              { 
                city: "Dubai", 
                country: "Émirats Arabes Unis", 
                price: "À partir de 380,000 FCFA", 
                image: "🕌",
                gradient: "from-green-500 to-green-500",
                description: "Luxe et modernité"
              },
              { 
                city: "Londres", 
                country: "Royaume-Uni", 
                price: "À partir de 420,000 FCFA", 
                image: "🏰",
                gradient: "from-blue-500 to-blue-500",
                description: "Histoire et tradition"
              },
              { 
                city: "Istanbul", 
                country: "Turquie", 
                price: "À partir de 350,000 FCFA", 
                image: "🕌",
                gradient: "from-orange-500 to-orange-500",
                description: "Pont entre deux continents"
              },
              { 
                city: "Casablanca", 
                country: "Maroc", 
                price: "À partir de 280,000 FCFA", 
                image: "🏛️",
                gradient: "from-green-500 to-green-500",
                description: "Perle du Maghreb"
              },
            ].map((destination, index) => (
              <div 
                key={index} 
                className="destination-card group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-3 transition-all duration-500 hover:shadow-3xl"
              >
                {/* Image Section with Gradient */}
                <div className={`h-56 bg-gradient-to-br ${destination.gradient} relative flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                    {destination.image}
                  </div>
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-white text-xs font-semibold">Populaire</span>
                  </div>
                  {/* Animated border */}
                  <div className="absolute inset-0 border-2 border-white border-opacity-20 rounded-t-2xl group-hover:border-opacity-40 transition-all duration-300"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-black group-hover:text-blue-500 transition-colors duration-300">
                        {destination.city}
                      </h3>
                      <p className="text-black font-medium">{destination.country}</p>
                    </div>
                    <div className="bg-blue-50 rounded-full p-2">
                      <span className="text-blue-500 text-sm">✈️</span>
                    </div>
                  </div>
                  
                  <p className="text-black text-sm mb-4 italic">{destination.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-500">{destination.price}</span>
                      <p className="text-xs text-black">par personne</p>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => scrollToSection('quote-form')}
                    >
                      Demander Prix
                    </Button>
                  </div>
                  
                  {/* Special offer badge */}
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Offre Spéciale!
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to Action at bottom */}
          <div className="text-center mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-4">
                🌟 Plus de 50 destinations disponibles !
              </h3>
              <p className="text-white mb-6">
                Vous ne trouvez pas votre destination? Contactez-nous pour un devis personnalisé.
              </p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => scrollToSection('quote-form')}
              >
                Voir Toutes les Destinations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-blue-500 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-bounce-slow">
              <div className="stat-number text-4xl font-bold mb-2" data-count="200">0</div>
              <div className="text-blue-100">Clients Satisfaits</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.2s'}}>
              <div className="stat-number text-4xl font-bold mb-2" data-count="50">0</div>
              <div className="text-blue-100">Destinations</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Client</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold mb-2">5★</div>
              <div className="text-blue-100">Note Moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Ce Que Disent Nos Clients</h2>
            <p className="text-xl text-black">Témoignages authentiques de voyageurs satisfaits</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Chantal Ngozi",
                role: "Femme d'Affaires",
                content: "Service exceptionnel! L'équipe m'a trouvé un excellent tarif pour mon voyage d'affaires à Paris. Processus très professionnel.",
                rating: 5
              },
              {
                name: "Paul Mbarga",
                role: "Étudiant",
                content: "Parfait pour mon voyage d'études. Ils ont trouvé un vol abordable et m'ont aidé avec toute la documentation. Je recommande!",
                rating: 5
              },
              {
                name: "Grace Fotso",
                role: "Famille",
                content: "Excellent service pour organiser nos vacances familiales à Dubai. Prix compétitifs et service client très à l'écoute.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card bg-white rounded-xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-black mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-black">{testimonial.name}</div>
                  <div className="text-sm text-black">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-500 section-padding">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à Partir à l'Aventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous dès aujourd'hui et commencez à planifier votre prochain voyage de rêve
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
            size={"lg"}
              className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
              onClick={() => scrollToSection('quote-form')}
            >
              <Send className="w-4 h-4 mr-2" />
              Demander un Devis
            </Button>
            <a
              href="tel:677916832"
              className="border-2 border-white text-white px-8 py-1 rounded-lg font-semibold hover:bg-white hover:text-blue-500 transition-all duration-300 text-center flex items-center justify-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appelez-nous: 6 77 91 68 32
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black text-white section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Revolution Travel & Services</h3>
              <p className="text-white mb-4">
                Votre partenaire de confiance pour tous vos voyages en avion.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Facebook/>
                  {/* <span className="text-sm font-bold">f</span> */}
                </a>
                {/* <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div> */}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-white">
                <li><a href="#quote-form" className="hover:text-blue-500 transition-colors">Demande de Devis</a></li>
                <li><a href="#services" className="hover:text-blue-500 transition-colors">Recherche de Billets</a></li>
                <li><a href="#services" className="hover:text-blue-500 transition-colors">Réservation Hôtel</a></li>
                <li><a href="#services" className="hover:text-blue-500 transition-colors">Conseil Voyage</a></li>
                <li><a href="#services" className="hover:text-blue-500 transition-colors">Suivi de Demande</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Destinations</h4>
              <ul className="space-y-3 text-white">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Europe</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Amérique</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Asie</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Afrique</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-white">
                <div className="flex items-center gap-2">
                  <Phone className="size-4"/>
                  <a href="tel:677916832" className="hover:text-blue-500 transition-colors">6 77 91 68 32</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4"/>
                  <a href="mailto:p.revolutiontravel@yahoo.com" className="hover:text-blue-500 transition-colors">p.revolutiontravel@yahoo.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4"/>
                  <span>Cameroun</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-white">
            <p className="mb-4">&copy; 2025 Revolution Travel & Services. Tous droits réservés.</p>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2 developer-credit">
              Made with <span className="text-red-500 animate-heartbeat">❤️</span> by{" "}
              <a 
                href="https://github.com/Tomdieu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
              >
                Tomdieu Ivan
              </a>
            </p>
          </div>
        </div>
      </footer>

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
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
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

      {/* Structured Data for SEO */}
      <StructuredData />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
