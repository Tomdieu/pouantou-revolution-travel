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
import { ChevronDownIcon, Loader2, AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { InputPhone } from "@/components/ui/input-phone";
import { useMediaQuery } from 'usehooks-ts';
import airports from '@/constants/airports.json';

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

// Helper function to get airport code from airport name
function getAirportCodeFromName(airportName: string): string {
  const airportList = airports as Airport[];
  const airport = airportList.find(a => a.name === airportName);
  return airport?.code || airportName;
}

export default function DevisForm({ className = "", onSubmitSuccess, onSubmitError }: DevisFormProps) {
  // Add hydration state to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data: session } = useSession();

  // Form setup with react-hook-form and zod - Updated for Amadeus API
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

  // Pre-populate form when session data becomes available
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) {
        form.setValue('fullName', session.user.name);
      }
      if (session.user.email) {
        form.setValue('email', session.user.email);
      }
      if (session.user.phone) {
        form.setValue('phone', session.user.phone);
      }
    }
  }, [session, form]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['departureCity', 'destination', 'departureDate', 'returnDate'];
    } else if (step === 2) {
      fieldsToValidate = ['adults', 'children', 'infants', 'travelClass', 'preferredAirline', 'budget', 'currencyCode', 'maxPrice'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      // After step 2, fetch flight results before moving to step 3
      if (step === 2) {
        await fetchFlightResults();
      } else {
        setStep(prev => Math.min(prev + 1, 4));
      }
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  // Fetch flight results from Amadeus API
  const fetchFlightResults = async () => {
    setIsFetchingResults(true);
    try {
      // Get airport codes from airport names
      const originCode = getAirportCodeFromName(form.getValues('departureCity'));
      const destinationCode = getAirportCodeFromName(form.getValues('destination'));

      const formDataForAPI = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: form.getValues('departureDate').toISOString().split('T')[0],
        returnDate: form.getValues('returnDate')?.toISOString().split('T')[0] || '',
        adults: form.getValues('adults'),
        children: form.getValues('children') || 0,
        infants: form.getValues('infants') || 0,
        travelClass: form.getValues('travelClass'),
        nonStop: form.getValues('nonStop'),
        currencyCode: form.getValues('currencyCode'),
        maxPrice: form.getValues('maxPrice'),
      };

      console.log('Fetching flights with params:', formDataForAPI);

      const response = await fetch('/api/amadeus/flight-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataForAPI),
      });

      const result = await response.json();
      console.log('Flight search response:', result);

      if (response.ok && result.success && result.data?.offers) {
        setFlightResults(result.data.offers || []);
        setStep(3);
        toast.success(`${result.data.offers.length} vol(s) trouvé(s)! Sélectionnez un vol.`);
      } else {
        toast.error(result.error || 'Erreur lors de la recherche. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    } finally {
      setIsFetchingResults(false);
    }
  };

  const prevStep = () => {
    // If coming back from results, clear flight selection
    if (step === 3) {
      setFlightResults([]);
      setSelectedFlight(null);
    }
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission - only on step 4 (after flight selection)
  const onSubmit = async (data: FormData) => {
    console.log('Form submission started', data);
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    // Analytics logging
    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FLIGHT',
        searchDetails: data,
        selectedFlight: selectedFlight
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
        selectedFlightId: selectedFlight?.id
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
        setFlightResults([]);
        setSelectedFlight(null);
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
    { id: 1, title: 'Itinéraire', icon: '✈️' },
    { id: 2, title: 'Passagers', icon: '👥' },
    { id: 3, title: 'Résultats', icon: '🔍' },
    { id: 4, title: 'Contact', icon: '👤' }
  ];

  return (
    <div className={`max-w-4xl mx-auto px-4 ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reservation de billet d'avion</span>
        </h2>
        <p className="text-gray-600 font-medium">
          Recevez votre offre personnalisée en moins de 60 minutes.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
        <div className="flex justify-between relative z-10">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${step >= s.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                  : 'bg-white border-gray-200 text-gray-400'
                  }`}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= s.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl p-6 sm:p-10 border border-stone-200 shadow-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
          <span className="text-8xl">{steps[step - 1].icon}</span>
        </div>

        {isHydrated && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* STEP 1: ITINERARY */}
              {step === 1 && (
                <div className="animate-fade-in-up space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="departureCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Ville de Départ <span className="text-red-500">*</span></FormLabel>
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
                                className="h-12 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                              />
                            )}
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Destination <span className="text-red-500">*</span></FormLabel>
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
                                className="h-12 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                              />
                            )}
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => {
                        const [datePopoverOpen, setDatePopoverOpen] = useState(false);
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700">Date de Départ <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full h-12 justify-between font-semibold border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:border-blue-500 transition-all"
                                  >
                                    {field.value ? field.value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Sélectionner une date"}
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
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
                                    className="rounded-2xl"
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage className="font-bold text-xs" />
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
                            <FormLabel className="text-sm font-bold text-gray-700">Date de Retour <span className="text-gray-400 font-normal">(Optionnel)</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`w-full h-12 justify-between font-semibold border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:border-blue-500 transition-all ${field.value ? 'pr-14' : 'pr-10'}`}
                                    >
                                      {field.value ? field.value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Aller simple ?"}
                                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
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
                                      className="rounded-2xl"
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1.5 z-100 hover:bg-red-50 rounded-lg"
                                    aria-label="Supprimer la date de retour"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className="font-bold text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nonStop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/30 p-4 transition-all hover:bg-blue-50/50">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            Vols directs uniquement
                          </FormLabel>
                          <p className="text-xs font-medium text-slate-500">
                            Masquer les vols avec escales
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="bg-blue-100 data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 2: PASSENGERS & COMFORT */}
              {step === 2 && (
                <div className="animate-fade-in-up space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Adults */}
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Adultes <span className="text-xs font-normal text-gray-400">(12+ ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none">
                              {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-semibold py-3">{num} {num > 1 ? 'Adultes' : 'Adulte'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    {/* Children */}
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Enfants <span className="text-xs font-normal text-gray-400">(2-11 ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none">
                              {Array.from({ length: 9 }, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-semibold py-3">{num} {num > 1 ? 'Enfants' : 'Enfant'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    {/* Infants */}
                    <FormField
                      control={form.control}
                      name="infants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Bébés <span className="text-xs font-normal text-gray-400">(&lt; 2 ans)</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none">
                              {Array.from({ length: 9 }, (_, i) => i).map(num => (
                                <SelectItem key={num} value={num.toString()} className="font-semibold py-3">{num} {num > 1 ? 'Bébés' : 'Bébé'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Classe de Voyage <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none">
                              <SelectItem value="ECONOMY" className="font-semibold py-3">Économique</SelectItem>
                              <SelectItem value="PREMIUM_ECONOMY" className="font-semibold py-3">Premium Économie</SelectItem>
                              <SelectItem value="BUSINESS" className="font-semibold py-3">Business Class</SelectItem>
                              <SelectItem value="FIRST" className="font-semibold py-3">Première Classe</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredAirline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Compagnie Préférée</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue placeholder="Aucune préférence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none h-60">
                              <SelectItem value="none" className="font-semibold py-3">Aucune préférence</SelectItem>
                              <SelectItem value="AF" className="font-semibold py-3">Air France</SelectItem>
                              <SelectItem value="TK" className="font-semibold py-3">Turkish Airlines</SelectItem>
                              <SelectItem value="EK" className="font-semibold py-3">Emirates</SelectItem>
                              <SelectItem value="LH" className="font-semibold py-3">Lufthansa</SelectItem>
                              <SelectItem value="ET" className="font-semibold py-3">Ethiopian Airlines</SelectItem>
                              <SelectItem value="AT" className="font-semibold py-3">Royal Air Maroc</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Fourchette de Budget</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-white/50 font-bold">
                                <SelectValue placeholder="Votre budget" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white rounded-xl shadow-xl border-none">
                              <SelectItem value="50000-200000" className="font-semibold py-3">50k - 200k FCFA</SelectItem>
                              <SelectItem value="200000-500000" className="font-semibold py-3">200k - 500k FCFA</SelectItem>
                              <SelectItem value="500000-1000000" className="font-semibold py-3">500k - 1M FCFA</SelectItem>
                              <SelectItem value="1000000+" className="font-semibold py-3">+ 1M FCFA</SelectItem>
                              <SelectItem value="flexible" className="font-semibold py-3">Budget flexible</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Prix Max / voyageur</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 500000"
                              className="h-12 border-gray-200 rounded-xl bg-white/50 focus:ring-blue-500 transition-all font-bold"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: FLIGHT RESULTS */}
              {step === 3 && (
                <div className="animate-fade-in-up space-y-6">
                  {isFetchingResults ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold">Recherche des meilleurs vols...</p>
                      </div>
                    </div>
                  ) : flightResults.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 font-medium mb-4">
                        Sélectionnez le vol qui vous intéresse parmi les {flightResults.length} résultats trouvés.
                      </p>
                      {flightResults.map((flight, index) => (
                        <button
                          key={flight.id || index}
                          onClick={() => {
                            setSelectedFlight(flight);
                            setStep(4);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedFlight?.id === flight.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-900">{flight.airline || 'Vol'}</p>
                              <p className="text-sm text-gray-600">
                                {flight.isNonStop ? '✈️ Vol direct' : `${flight.stops} escale(s)`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-blue-600">
                                {flight.price?.displayTotal || `${flight.price?.total} ${flight.price?.currency || 'XAF'}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ⚠️ Le prix peut changer
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Départ</p>
                              <p className="font-semibold text-gray-900">{flight.departure?.airport}</p>
                              <p className="text-xs text-gray-500">{new Date(flight.departure?.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <p className="text-xs text-gray-500">Durée</p>
                              <p className="font-semibold text-gray-700 text-sm">{flight.duration}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Arrivée</p>
                              <p className="font-semibold text-gray-900">{flight.arrival?.airport}</p>
                              <p className="text-xs text-gray-500">{new Date(flight.arrival?.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          {selectedFlight?.id === flight.id && (
                            <div className="flex items-center gap-2 mt-3 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="text-sm font-semibold">Sélectionné</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 bg-red-50 rounded-xl border border-red-200">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                        <p className="text-red-700 font-semibold">Aucun vol trouvé</p>
                        <p className="text-red-600 text-sm mt-1">Veuillez modifier vos critères de recherche</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: CONTACT INFO (Previously STEP 3) */}
              {step === 4 && (
                <div className="animate-fade-in-up space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">Nom Complet <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Entrez votre nom complet"
                            className="h-12 border-gray-200 rounded-xl bg-white/50 focus:ring-blue-500 transition-all font-semibold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              className="h-12 border-gray-200 rounded-xl bg-white/50 focus:ring-blue-500 transition-all font-semibold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Téléphone <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <InputPhone
                              defaultCountry='CM'
                              placeholder="+237 ..."
                              className="h-12 border-gray-200 rounded-xl bg-white/50 focus:ring-blue-500 transition-all font-semibold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">Détails Additionnels</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Une demande spéciale ? Un hôtel spécifique ?"
                            className="min-h-[120px] border-gray-200 rounded-2xl bg-white/50 focus:ring-blue-500 p-4 resize-none transition-all font-medium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  {submitStatus.message && (
                    <div className={`p-4 rounded-xl border font-bold text-sm animate-pulse-glow ${submitStatus.type === 'success' ? 'bg-green-50/50 border-green-200 text-green-700' : 'bg-red-50/50 border-red-200 text-red-700'
                      }`}>
                      {submitStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting || isFetchingResults}
                    className="flex-1 h-14 rounded-2xl border-2 border-gray-100 font-bold hover:bg-gray-50 transition-all"
                  >
                    Précédent
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isFetchingResults}
                    className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {isFetchingResults ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Recherche...
                      </>
                    ) : step === 3 ? (
                      'Continuer vers Contact'
                    ) : (
                      'Continuer'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-green-200 transition-all hover:-translate-y-1 active:scale-95 disabled:grayscale disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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