'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityCombobox } from "@/components/ui/city-combobox";
import { MobileLocationSelector } from "@/components/MobileLocationSelector";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDownIcon, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { InputPhone } from "@/components/ui/input-phone";
import { useMediaQuery } from 'usehooks-ts';
import airports from '@/constants/airports.json';

const formSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Adresse email invalide"),
  departureCity: z.string().min(2, "Ville de départ requise"),
  destination: z.string().min(2, "Destination requise"),
  departureDate: z.date({ required_error: "Date de départ requise" }),
  returnDate: z.date().optional(),
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
  if (data.infants > data.adults) return false;
  return true;
}, {
  message: `Le nombre de bébés ne peut pas dépasser le nombre d'adultes`,
  path: ["infants"]
}).refine((data) => {
  if (data.adults + data.children > 9) return false;
  return true;
}, {
  message: `Le nombre total d'adultes et d'enfants ne peut pas dépasser 9`,
  path: ["children"]
}).refine((data) => {
  const today_date = new Date();
  const maxDate = new Date();
  maxDate.setDate(today_date.getDate() + 365);
  if (data.departureDate && data.departureDate > maxDate) return false;
  return true;
}, {
  message: "La date de départ ne peut pas être plus de 365 jours dans le futur",
  path: ["departureDate"]
}).refine((data) => {
  if (data.returnDate && data.departureDate && data.departureDate > data.returnDate) return false;
  return true;
}, {
  message: "La date de retour doit être après la date de départ",
  path: ["returnDate"]
});

type FormData = z.infer<typeof formSchema>;

interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: string;
  lon: string;
}

interface DevisFormProps {
  className?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
}

function getAirportCodeFromName(airportName: string): string {
  const airportList = airports as Airport[];
  const airport = airportList.find(a => a.name === airportName);
  return airport?.code || airportName;
}

export default function DevisForm({ className = "", onSubmitSuccess, onSubmitError }: DevisFormProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data: session } = useSession();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: session?.user?.name || "",
      phone: session?.user?.phone || "",
      email: session?.user?.email || "",
      departureCity: "",
      destination: "",
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: "ECONOMY",
      nonStop: false,
      currencyCode: "XAF",
      additionalInfo: ""
    },
  });

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) form.setValue('fullName', session.user.name);
      if (session.user.email) form.setValue('email', session.user.email);
      if (session.user.phone) form.setValue('phone', session.user.phone);
    }
  }, [session, form]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['departureCity', 'destination', 'departureDate', 'returnDate'];
    } else if (step === 2) {
      fieldsToValidate = ['adults', 'children', 'infants', 'travelClass', 'currencyCode'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 2) {
        // Skip to contact step (no Amadeus search)
        setStep(3);
      } else {
        setStep(prev => Math.min(prev + 1, 3));
      }
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FLIGHT',
        searchDetails: data,
      }),
    }).catch(err => console.error('Failed to log devis search:', err));

    try {
      const formDataForAPI = {
        ...data,
        departureDate: data.departureDate.toISOString().split('T')[0],
        returnDate: data.returnDate?.toISOString().split('T')[0] || '',
        passengersTotal: data.adults + data.children + data.infants,
        adultsCount: data.adults,
        childrenCount: data.children,
        infantsCount: data.infants,
      };

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataForAPI),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Demande envoyée avec succès! Vous recevrez votre devis sous 1h.');
        setSubmitStatus({ type: 'success', message: 'Demande envoyée avec succès!' });
        form.reset();
        setStep(1);
        onSubmitSuccess?.();
      } else {
        const errorMessage = result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.';
        toast.error(errorMessage);
        setSubmitStatus({ type: 'error', message: errorMessage });
        onSubmitError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
      toast.error(errorMessage);
      setSubmitStatus({ type: 'error', message: errorMessage });
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Itinéraire' },
    { id: 2, title: 'Passagers' },
    { id: 3, title: 'Contact' }
  ];

  return (
    <div className={`max-w-4xl mx-auto px-4 ${className}`}>
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Réservation de billet d&apos;avion
        </h2>
        <p className="text-slate-500">
          Recevez votre offre personnalisée en moins de 60 minutes.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 relative">
        <div className="absolute top-4 left-0 w-full h-px bg-slate-200 z-0" />
        <div
          className="absolute top-4 left-0 h-px bg-slate-900 z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
        <div className="flex justify-between relative z-10">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step >= s.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`mt-2.5 text-xs font-medium transition-colors duration-300 ${
                step >= s.id ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200">
        {isHydrated && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* STEP 1: ITINERARY */}
              {step === 1 && (
                <div className="animate-fade-in space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="departureCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Ville de Départ <span className="text-slate-400">*</span></FormLabel>
                          <FormControl>
                            {isMobile ? (
                              <MobileLocationSelector
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="D'où partez-vous ?"
                                label="Ville de Départ"
                              />
                            ) : (
                              <CityCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="D'où partez-vous ?"
                                className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 focus:border-slate-900"
                              />
                            )}
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Destination <span className="text-slate-400">*</span></FormLabel>
                          <FormControl>
                            {isMobile ? (
                              <MobileLocationSelector
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Où allez-vous ?"
                                label="Destination"
                              />
                            ) : (
                              <CityCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Où allez-vous ?"
                                className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 focus:border-slate-900"
                              />
                            )}
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => {
                        const [datePopoverOpen, setDatePopoverOpen] = useState(false);
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Date de Départ <span className="text-slate-400">*</span></FormLabel>
                            <FormControl>
                              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full h-11 justify-between font-medium border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                                  >
                                    {field.value ? field.value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Sélectionner une date"}
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-lg" align="start">
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        field.onChange(date);
                                        setDatePopoverOpen(false);
                                      }
                                    }}
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const maxDate = new Date();
                                      maxDate.setMonth(today.getMonth() + 12);
                                      return date < today || date > maxDate;
                                    }}
                                    defaultMonth={field.value || new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => {
                        const [returnPopoverOpen, setReturnPopoverOpen] = useState(false);
                        const departureDate = form.watch("departureDate");
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Date de Retour <span className="text-slate-400 font-normal">(Optionnel)</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`w-full h-11 justify-between font-medium border-slate-200 rounded-lg hover:border-slate-300 transition-colors ${field.value ? 'pr-14' : 'pr-10'}`}
                                    >
                                      {field.value ? field.value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Aller simple ?"}
                                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-lg" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      captionLayout="dropdown"
                                      onSelect={(date) => {
                                        if (date) {
                                          field.onChange(date);
                                          setReturnPopoverOpen(false);
                                        }
                                      }}
                                      disabled={(date) => {
                                        const minDate = departureDate || new Date();
                                        const maxDate = new Date();
                                        maxDate.setMonth(new Date().getMonth() + 12);
                                        return date < minDate || date > maxDate;
                                      }}
                                      defaultMonth={departureDate || new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {field.value && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      field.onChange(undefined);
                                      setReturnPopoverOpen(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10 hover:bg-slate-100 rounded-md"
                                    aria-label="Supprimer la date de retour"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nonStop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium text-slate-700">
                            Vols directs uniquement
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Masquer les vols avec escales
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
              )}

              {/* STEP 2: PASSENGERS & COMFORT */}
              {step === 2 && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Adultes <span className="text-xs text-slate-400 font-normal">(12+ ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-medium">{num} {num > 1 ? 'Adultes' : 'Adulte'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Enfants <span className="text-xs text-slate-400 font-normal">(2-11 ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              {Array.from({ length: 9 }, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-medium">{num} {num > 1 ? 'Enfants' : 'Enfant'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="infants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Bébés <span className="text-xs text-slate-400 font-normal">(&lt; 2 ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              {Array.from({ length: 9 }, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-medium">{num} {num > 1 ? 'Bébés' : 'Bébé'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Classe de Voyage <span className="text-slate-400">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              <SelectItem value="ECONOMY" className="font-medium">Économique</SelectItem>
                              <SelectItem value="PREMIUM_ECONOMY" className="font-medium">Premium Économie</SelectItem>
                              <SelectItem value="BUSINESS" className="font-medium">Business Class</SelectItem>
                              <SelectItem value="FIRST" className="font-medium">Première Classe</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredAirline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Compagnie Préférée</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue placeholder="Aucune préférence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              <SelectItem value="none" className="font-medium">Aucune préférence</SelectItem>
                              <SelectItem value="AF" className="font-medium">Air France</SelectItem>
                              <SelectItem value="TK" className="font-medium">Turkish Airlines</SelectItem>
                              <SelectItem value="EK" className="font-medium">Emirates</SelectItem>
                              <SelectItem value="LH" className="font-medium">Lufthansa</SelectItem>
                              <SelectItem value="ET" className="font-medium">Ethiopian Airlines</SelectItem>
                              <SelectItem value="AT" className="font-medium">Royal Air Maroc</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Fourchette de Budget</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 border-slate-200 rounded-lg font-medium">
                                <SelectValue placeholder="Votre budget" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-lg shadow-lg border-slate-200">
                              <SelectItem value="50000-200000" className="font-medium">50k - 200k FCFA</SelectItem>
                              <SelectItem value="200000-500000" className="font-medium">200k - 500k FCFA</SelectItem>
                              <SelectItem value="500000-1000000" className="font-medium">500k - 1M FCFA</SelectItem>
                              <SelectItem value="1000000+" className="font-medium">+ 1M FCFA</SelectItem>
                              <SelectItem value="flexible" className="font-medium">Budget flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Prix Max / voyageur</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 500000"
                              className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors font-medium"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT INFO */}
              {step === 3 && (
                <div className="animate-fade-in space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Nom Complet <span className="text-slate-400">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Entrez votre nom complet"
                              className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors font-medium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Email <span className="text-slate-400">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors font-medium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700">Téléphone <span className="text-slate-400">*</span></FormLabel>
                          <FormControl>
                            <InputPhone
                              defaultCountry='CM'
                              placeholder="+237 ..."
                              className="h-11 border-slate-200 rounded-lg focus:ring-slate-900 transition-colors font-medium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Détails Additionnels</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Une demande spéciale ? Un hôtel spécifique ?"
                            className="min-h-[100px] border-slate-200 rounded-lg focus:ring-slate-900 p-3 resize-none transition-colors font-medium text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {submitStatus.message && (
                    <div className={`p-3 rounded-lg border text-sm font-medium ${
                      submitStatus.type === 'success'
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-5 border-t border-slate-100">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded-lg border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Précédent
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {step === 2 ? (
                      'Continuer vers Contact'
                    ) : (
                      'Continuer'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      'Obtenir mon Devis Gratuit'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
