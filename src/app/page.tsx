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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDownIcon } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Zod schema for form validation
const formSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Adresse email invalide"),
  departureCity: z.string().min(2, "Ville de départ requise"),
  destination: z.string().min(2, "Destination requise"),
  departureDate: z.date({ required_error: "Date de départ requise" }),
  returnDate: z.date().optional(),
  passengers: z.string().min(1, "Nombre de passagers requis"),
  travelClass: z.string().min(1, "Classe de voyage requise"),
  preferredAirline: z.string().min(1, "Compagnie aérienne requise"),
  budget: z.string().min(1, "Budget requis"),
  additionalInfo: z.string().optional()
}).refine((data) => {
  // Validate that departure date is not more than 9 months ahead
  const today_date = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today_date.getMonth() + 9);
  
  if (data.departureDate > maxDate) {
    return false;
  }
  
  // Validate that departure date is not after return date
  if (data.returnDate && data.departureDate > data.returnDate) {
    return false;
  }
  
  return true;
}, {
  message: "Les dates sélectionnées ne sont pas valides",
  path: ["departureDate"]
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
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

  // Form setup with react-hook-form and zod
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      departureCity: '',
      destination: '',
      departureDate: new Date(),
      returnDate: undefined,
      passengers: '1',
      travelClass: 'economy',
      preferredAirline: 'none',
      budget: 'select-budget',
      additionalInfo: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Convert dates to strings for API
      const formDataForAPI = {
        ...data,
        departureDate: data.departureDate.toISOString().split('T')[0],
        returnDate: data.returnDate?.toISOString().split('T')[0] || ''
      };

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataForAPI),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Demande envoyée avec succès! Vous recevrez votre devis sous 24h.'
        });
        // Reset form
        form.reset();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.'
        });
      }
    } catch (_error) {
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion. Veuillez vérifier votre connexion internet.'
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-primary-50">
      {/* Navigation */}
      <nav ref={navRef} className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-700">Revolution Travel & Services</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#accueil" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Accueil</a>
                <a href="#services" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Services</a>
                <a href="#destinations" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Destinations</a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="min-h-screen h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Enhanced background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-sky-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 right-10 w-28 h-28 bg-purple-200/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
          
          {/* Floating icons */}
          <div className="absolute top-32 left-1/4 text-4xl opacity-20 animate-bounce">✈️</div>
          <div className="absolute top-40 right-1/3 text-3xl opacity-15 animate-bounce" style={{animationDelay: '0.5s'}}>🌍</div>
          <div className="absolute bottom-40 left-1/3 text-5xl opacity-10 animate-bounce" style={{animationDelay: '1s'}}>🏖️</div>
          <div className="absolute bottom-32 right-1/4 text-3xl opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}>🎯</div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" 
               style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={heroRef} className="text-center">
            {/* <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-sky-500 rounded-3xl mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </div>
            </div> */}
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-primary-700 to-sky-600 bg-clip-text text-transparent">
                Réservez et Voyagez
              </span>
              <span className="block mt-2 bg-gradient-to-r from-primary-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Partout dans le Monde
              </span>
              <span className="block mt-4 text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent font-black">
                7 JOURS/7
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Spécialistes en recherche et réservation de billets d'avion. 
              <span className="block mt-2 text-primary-700 font-semibold">
                Soumettez votre demande de voyage et recevez les meilleurs tarifs personnalisés sous 24h.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-primary-600 to-sky-600 hover:from-primary-700 hover:to-sky-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl" 
                onClick={() => scrollToSection('quote-form')}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Demander un Devis
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 px-12 text-lg font-bold border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl" 
                onClick={() => scrollToSection('services')}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Nos Services
              </Button>
            </div>
            
            {/* Simple trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                <span className="text-gray-700 font-semibold">Service 7 jours/7</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                <span className="text-gray-700 font-semibold">Réponse sous 24h</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-green-500 mr-2 text-lg">✓</span>
                <span className="text-gray-700 font-semibold">Prix compétitifs</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Demande de Devis
            </h2>
            <p className="text-gray-600">
              Remplissez le formulaire et recevez votre devis personnalisé sous 24h.
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                  const maxDate = new Date();
                                  maxDate.setMonth(today.getMonth() + 9);
                                  return date < today || date > maxDate;
                                }}
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
                                  return date < departureDate || date > maxDate;
                                }}
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

                {/* Passengers and Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passengers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Passagers *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Nombre de passagers" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Passager</SelectItem>
                            <SelectItem value="2">2 Passagers</SelectItem>
                            <SelectItem value="3">3 Passagers</SelectItem>
                            <SelectItem value="4">4 Passagers</SelectItem>
                            <SelectItem value="5">5 Passagers</SelectItem>
                            <SelectItem value="6+">6+ Passagers</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="travelClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Classe de Voyage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choisir une classe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="economy">Économique</SelectItem>
                            <SelectItem value="premium">Premium Economy</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="first">Première Classe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Budget and Airline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Budget (FCFA)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Votre budget" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30000-200000">30,000 - 200,000 FCFA</SelectItem>
                            <SelectItem value="200000-400000">200,000 - 400,000 FCFA</SelectItem>
                            <SelectItem value="400000-600000">400,000 - 600,000 FCFA</SelectItem>
                            <SelectItem value="600000-800000">600,000 - 800,000 FCFA</SelectItem>
                            <SelectItem value="800000-1000000">800,000 - 1,000,000 FCFA</SelectItem>
                            <SelectItem value="1000000+">Plus de 1,000,000 FCFA</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Aucune préférence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Aucune préférence</SelectItem>
                            <SelectItem value="air-france">Air France</SelectItem>
                            <SelectItem value="turkish">Turkish Airlines</SelectItem>
                            <SelectItem value="emirates">Emirates</SelectItem>
                            <SelectItem value="lufthansa">Lufthansa</SelectItem>
                            <SelectItem value="british">British Airways</SelectItem>
                            <SelectItem value="ethiopian">Ethiopian Airlines</SelectItem>
                            <SelectItem value="qatar">Qatar Airways</SelectItem>
                            <SelectItem value="royal-air-maroc">Royal Air Maroc</SelectItem>
                            <SelectItem value="camair">Camair-Co</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information */}
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Informations Supplémentaires</FormLabel>
                      <FormControl>
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
                    className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer ma Demande de Devis'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-sky-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment Ça Marche ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent pour obtenir les meilleurs tarifs aériens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Soumettez Votre Demande</h3>
              <p className="text-gray-600">
                Remplissez notre formulaire avec vos détails de voyage et préférences
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nous Recherchons</h3>
              <p className="text-gray-600">
                Notre équipe compare les tarifs de toutes les compagnies aériennes
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Vous Recevez le Devis</h3>
              <p className="text-gray-600">
                Nous vous contactons sous 24h avec les meilleures options et prix
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Réservation Confirmée</h3>
              <p className="text-gray-600">
                Une fois votre choix fait, nous procédons à la réservation sécurisée
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg inline-block">
              <h3 className="text-2xl font-bold text-primary-600 mb-2">⏱️ Délai de Réponse</h3>
              <p className="text-gray-600 text-lg">Maximum 24 heures pour recevoir votre devis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de services pour faire de votre voyage une expérience inoubliable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recherche de Billets</h3>
              <p className="text-gray-600 mb-6">
                Nous recherchons les meilleurs tarifs auprès de toutes les compagnies aériennes pour vous offrir les prix les plus compétitifs.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Recherche multi-compagnies
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Meilleurs prix garantis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Devis sous 24h
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conseil Personnalisé</h3>
              <p className="text-gray-600 mb-6">
                Nos experts vous accompagnent pour choisir la meilleure option selon vos besoins et votre budget.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Conseillers expérimentés
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Service 24/7
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi personnalisé
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Suivi de Demande</h3>
              <p className="text-gray-600 mb-6">
                Nous vous tenons informés à chaque étape de votre demande et vous accompagnons jusqu'à la réservation finale.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi personnalisé
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Réservation sécurisée
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Documentation complète
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section ref={destinationsRef} id="destinations" className="section-padding bg-gradient-to-br from-gray-900 via-primary-900 to-sky-900 relative overflow-hidden">
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
              Destinations <span className="text-orange-400">Populaires</span>
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Découvrez nos destinations les plus prisées avec des tarifs exceptionnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                city: "Paris", 
                country: "France", 
                price: "À partir de 350,000 FCFA", 
                image: "🗼",
                gradient: "from-purple-500 to-pink-500",
                description: "Ville lumière et romance"
              },
              { 
                city: "New York", 
                country: "États-Unis", 
                price: "À partir de 450,000 FCFA", 
                image: "🗽",
                gradient: "from-blue-500 to-indigo-600",
                description: "La ville qui ne dort jamais"
              },
              { 
                city: "Dubai", 
                country: "Émirats Arabes Unis", 
                price: "À partir de 280,000 FCFA", 
                image: "🕌",
                gradient: "from-yellow-500 to-orange-500",
                description: "Luxe et modernité"
              },
              { 
                city: "Londres", 
                country: "Royaume-Uni", 
                price: "À partir de 320,000 FCFA", 
                image: "🏰",
                gradient: "from-green-500 to-teal-500",
                description: "Histoire et tradition"
              },
              { 
                city: "Istanbul", 
                country: "Turquie", 
                price: "À partir de 250,000 FCFA", 
                image: "🕌",
                gradient: "from-red-500 to-pink-500",
                description: "Pont entre deux continents"
              },
              { 
                city: "Casablanca", 
                country: "Maroc", 
                price: "À partir de 180,000 FCFA", 
                image: "🏛️",
                gradient: "from-amber-500 to-yellow-500",
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
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                        {destination.city}
                      </h3>
                      <p className="text-gray-600 font-medium">{destination.country}</p>
                    </div>
                    <div className="bg-primary-50 rounded-full p-2">
                      <span className="text-primary-600 text-sm">✈️</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 italic">{destination.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">{destination.price}</span>
                      <p className="text-xs text-gray-500">par personne</p>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-primary-600 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-sky-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
              <p className="text-gray-200 mb-6">
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
      <section ref={statsRef} className="bg-primary-600 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-bounce-slow">
              <div className="stat-number text-4xl font-bold mb-2" data-count="200">0</div>
              <div className="text-primary-100">Clients Satisfaits</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.2s'}}>
              <div className="stat-number text-4xl font-bold mb-2" data-count="50">0</div>
              <div className="text-primary-100">Destinations</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold mb-2">8/7</div>
              <div className="text-primary-100">Support Client</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold mb-2">5★</div>
              <div className="text-primary-100">Note Moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce Que Disent Nos Clients</h2>
            <p className="text-xl text-gray-600">Témoignages authentiques de voyageurs satisfaits</p>
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
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-sky-600 section-padding">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à Partir à l'Aventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous dès aujourd'hui et commencez à planifier votre prochain voyage de rêve
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              onClick={() => scrollToSection('quote-form')}
            >
              Demander un Devis
            </Button>
            <a 
              href="tel:677916832"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 text-center"
            >
              Appelez-nous: 6 77 91 68 32
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Revolution Travel & Services</h3>
              <p className="text-gray-300 mb-4">
                Votre partenaire de confiance pour tous vos voyages en avion.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <span className="text-sm font-bold">f</span>
                </a>
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#quote-form" className="hover:text-white transition-colors">Demande de Devis</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Recherche de Billets</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Conseil Voyage</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Suivi de Demande</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Destinations</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Europe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Amérique</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asie</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Afrique</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <span className="mr-3">📞</span>
                  <a href="tel:677916832" className="hover:text-white transition-colors">6 77 91 68 32</a>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">✉️</span>
                  <a href="mailto:p.revolutiontravel@yahoo.com" className="hover:text-white transition-colors">p.revolutiontravel@yahoo.com</a>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">📍</span>
                  <span>Cameroun</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Revolution Travel & Services. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO */}
      <StructuredData />
    </div>
  );
}
