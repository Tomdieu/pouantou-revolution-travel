'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Search, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputPhone } from './ui/input-phone';
import { CityCombobox } from './ui/city-combobox';
import { toast } from 'sonner';

// Form validation schema
const flightSearchSchema = z.object({
  originLocationCode: z.string().min(1, "Origine requise"),
  destinationLocationCode: z.string().min(1, "Destination requise"),
  departureDate: z.date({
    required_error: "Date de départ requise",
  }),
  returnDate: z.date().optional(),
  adults: z.number().min(1, "Au moins 1 adulte requis").max(9, "Maximum 9 adultes"),
  children: z.number().min(0).max(9, "Maximum 9 enfants").optional(),
  infants: z.number().min(0).max(9, "Maximum 9 bébés").optional(),
  travelClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
  nonStop: z.boolean().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: "Email ou téléphone requis",
  path: ["email"],
});

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  airline: string;
  flightNumber: string;
  duration: string;
  aircraft: string;
}

interface FlightOffer {
  id: string;
  price: {
    total: number;
    currency: string;
    formattedTotal: string;
    displayTotal: string; // Price with hidden fee added
  };
  duration?: string;
  stops: number;
  isNonStop: boolean;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  airline: string;
  segments?: FlightSegment[];
  bookableSeats: number;
  instantTicketing: boolean;
  lastTicketingDate?: string;
}

interface FlightSearchFormProps {
  userId?: string;
}

export default function FlightSearchForm({ userId }: FlightSearchFormProps = {}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState<FlightSearchFormData | null>(null);
  const [isDepartureDateOpen, setIsDepartureDateOpen] = useState(false);
  const [isReturnDateOpen, setIsReturnDateOpen] = useState(false);

  const form = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      originLocationCode: '',
      destinationLocationCode: '',
      departureDate: undefined,
      returnDate: undefined,
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY',
      nonStop: false,
      email: session?.user?.email || '',
      phone: session?.user?.phone || '',
    },
  });

  // Pre-populate form when session data becomes available
  useEffect(() => {
    if (session?.user) {
      if (session.user.email) {
        form.setValue('email', session.user.email);
      }
      if (session.user.phone) {
        form.setValue('phone', session.user.phone);
      }
    }
  }, [session, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FlightSearchFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['originLocationCode', 'destinationLocationCode', 'departureDate', 'returnDate'];
    } else if (step === 2) {
      fieldsToValidate = ['adults', 'children', 'infants', 'travelClass', 'nonStop'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FlightSearchFormData) => {
    setSearchData(data);
    await performSearch(data);
  };

  const performSearch = async (data: FlightSearchFormData) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setShowResults(false);

    // Filter out email/phone for raw analytics if needed, or keep for personalized demand tracking
    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FLIGHT',
        searchDetails: {
          ...data,
          departureDate: format(data.departureDate, 'yyyy-MM-dd'),
          returnDate: data.returnDate ? format(data.returnDate, 'yyyy-MM-dd') : undefined,
        }
      }),
    }).catch(err => console.error('Failed to log flight search:', err));

    try {
      // First, search for flights
      const searchResponse = await fetch('/api/amadeus/flight-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originLocationCode: data.originLocationCode.toUpperCase(),
          destinationLocationCode: data.destinationLocationCode.toUpperCase(),
          departureDate: format(data.departureDate, 'yyyy-MM-dd'),
          returnDate: data.returnDate ? format(data.returnDate, 'yyyy-MM-dd') : undefined,
          adults: data.adults,
          children: data.children || 0,
          infants: data.infants || 0,
          travelClass: data.travelClass,
          nonStop: data.nonStop,
          currencyCode: 'EUR',
          max: 10,
        }),
      });

      const initialSearchData = await searchResponse.json();

      // If search failed or no results, send email notification
      if (!initialSearchData.success || !initialSearchData.data.offers || initialSearchData.data.offers.length === 0) {
        await fetch('/api/flight-search-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            searchError: initialSearchData.error || 'Aucun vol trouvé pour cette recherche',
          }),
        });

        if (!initialSearchData.success) {
          setError(initialSearchData.error || 'Aucun vol trouvé pour cette recherche');
        } else {
          setError('Aucun vol trouvé. Votre demande a été transmise à notre équipe.');
        }
        setShowResults(true);
        return;
      }

      const searchData = initialSearchData;

      if (searchData.success && searchData.data.offers) {
        // Add 68.60 EUR to each price before displaying
        const offersWithFee = searchData.data.offers.map((offer: any) => ({
          ...offer,
          price: {
            ...offer.price,
            displayTotal: `${(offer.price.total + 68.60).toFixed(2)} ${offer.price.currency}`,
          },
        }));

        setResults(offersWithFee);
        setShowResults(true);
      } else {
        setError(searchData.error || 'Aucun vol trouvé pour cette recherche');
        setShowResults(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche de vols');
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSelectOffer = async (offer: FlightOffer) => {
    setSelectedOffer(offer);

    if (!searchData) return;

    try {
      // If userId is provided, create a booking in the database
      if (userId) {
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            type: 'FLIGHT',
            searchDetails: {
              ...searchData,
              departureDate: format(searchData.departureDate, 'yyyy-MM-dd'),
              returnDate: searchData.returnDate ? format(searchData.returnDate, 'yyyy-MM-dd') : undefined,
              selectedFlight: offer,
            },
            price: offer.price.total + 68.60,
            currency: offer.price.currency,
            contactName: searchData.email?.split('@')[0] || 'User',
            contactEmail: searchData.email || '',
            contactPhone: searchData.phone || '',
          }),
        });

        // Always send email to agent as well
        await fetch('/api/flight-search-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...searchData,
            selectedFlight: offer,
          }),
        });

        if (bookingResponse.ok) {
          toast.success('Votre réservation a été enregistrée! Notre équipe vous contactera bientôt.');
          // Refresh the page to show the new booking
          window.location.reload();
        } else {
          toast.error('Erreur lors de l\'enregistrement de la réservation.');
        }
      } else {
        // Original behavior: send email
        const emailResponse = await fetch('/api/flight-search-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...searchData,
            selectedFlight: offer,
          }),
        });

        if (emailResponse.ok) {
          toast.success('Votre réservation a été envoyée à notre équipe. Nous vous contacterons bientôt!');
        } else {
          toast.error('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
        }
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
      console.error('Error sending flight selection:', err);
    }
  };

  const steps = [
    { id: 1, title: 'Itinéraire', icon: <Plane className="w-5 h-5" /> },
    { id: 2, title: 'Expérience', icon: <Search className="w-5 h-5" /> },
    { id: 3, title: 'Passagers', icon: <Plane className="w-5 h-5 rotate-45" /> }
  ];

  return (
    <>
      {/* Step 1: Search Form */}
      {!showResults && (
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-4 relative">
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

          <div className="rounded-3xl px-2 p-2 sm:p-4 border border-white/40 relative overflow-hidden group">
            {/* Decorative Icon Background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              {steps[step - 1].icon}
            </div>

            <div className='flex flex-col relative z-10'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* STEP 1: ITINERARY */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="originLocationCode"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Départ</FormLabel>
                              <FormControl className='w-full'>
                                <CityCombobox
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="Ville de départ"
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-md transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destinationLocationCode"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Destination</FormLabel>
                              <FormControl>
                                <CityCombobox
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="Ville d'arrivée"
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-md transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="departureDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de départ</FormLabel>
                              <Popover open={isDepartureDateOpen} onOpenChange={setIsDepartureDateOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 rounded-md transition-all",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: fr })
                                      ) : (
                                        <span>Choisir une date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      setIsDepartureDateOpen(false);
                                    }}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="returnDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de retour (optionnel)</FormLabel>
                              <Popover open={isReturnDateOpen} onOpenChange={setIsReturnDateOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 rounded-md transition-all",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: fr })
                                      ) : (
                                        <span>Choisir une date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      setIsReturnDateOpen(false);
                                    }}
                                    disabled={(date) => {
                                      const departureDate = form.getValues('departureDate');
                                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                                      const minDate = departureDate || today;
                                      return date < minDate;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EXPERIENCE */}
                  {step === 2 && (
                    <div className="animate-fade-in-up space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="travelClass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Classe de voyage</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 rounded-md">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className='bg-white rounded-md shadow-2xl border-gray-100'>
                                  <SelectItem value="ECONOMY">Économique</SelectItem>
                                  <SelectItem value="PREMIUM_ECONOMY">Économique Premium</SelectItem>
                                  <SelectItem value="BUSINESS">Affaires</SelectItem>
                                  <SelectItem value="FIRST">Première</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nonStop"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-gray-100 bg-white/40 p-4 transition-all hover:bg-white/60 mt-8">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="w-5 h-5 rounded-md border-2 border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-semibold text-gray-700 cursor-pointer">Vols directs uniquement</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Passengers (Small summary here or in step 3? Let's move them to Step 2) */}
                      <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
                        <p className="text-sm font-bold text-blue-900 mb-4 ml-1">Passagers</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="adults"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Adultes</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                      <SelectItem className='hover:bg-blue-50 transition-colors' key={num} value={num.toString()}>{num}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="children"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Enfants (2-11 ans)</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                      <SelectItem className='hover:bg-blue-50 transition-colors' key={num} value={num.toString()}>{num}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="infants"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Bébés (0-2 ans)</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                      <SelectItem className='hover:bg-blue-50 transition-colors' key={num} value={num.toString()}>{num}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CONTACT & FINALIZE */}
                  {step === 3 && (
                    <div className="animate-fade-in-up space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="votre@email.com"
                                  {...field}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-md transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Téléphone</FormLabel>
                              <FormControl>
                                <InputPhone
                                  defaultCountry='CM'
                                  placeholder="+237 6XX XXX XXX"
                                  {...field}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-md transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isLoading}
                        className="flex-1 h-14 rounded-2xl border-2 border-gray-100 font-bold hover:bg-gray-50 transition-all"
                      >
                        Précédent
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-[2] h-14 bg-blue-600 text-white font-black transition-all hover:-translate-y-1 active:scale-95"
                      >
                        Continuer
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-14 bg-blue-600 text-white font-black transition-all hover:-translate-y-1 active:scale-95"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center text-white">
                            <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                            Recherche...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-white">
                            <Search className="mr-3 h-5 w-5" />
                            Rechercher des vols
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {showResults && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className='flex flex-col gap-5'>
            <div className="flex px-4 items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                <Search className="w-6 h-6 text-blue-600" />
                {results.length > 0 ? `Résultats (${results.length})` : 'Aucun résultat'}
              </div>
              <Button
                variant="outline"
                className="rounded-md border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setShowResults(false);
                  setStep(1);
                }}
              >
                Nouvelle recherche
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-premium border-red-100 bg-red-50/50 p-6 rounded-2xl">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {results.map((offer) => {
                  const formatTime = (dateString: string) => {
                    return new Date(dateString).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  };

                  const formatDuration = (duration: string) => {
                    const match = duration.match(/PT(\d+H)?(\d+M)?/);
                    if (!match) return duration;
                    const hours = match[1] ? match[1].replace('H', 'h ') : '';
                    const minutes = match[2] ? match[2].replace('M', 'min') : '';
                    return `${hours}${minutes}`.trim();
                  };

                  return (
                    <div key={offer.id} className="glass-premium border border-white/60 p-6 rounded-3xl hover:shadow-xl transition-all group">
                      {/* Header: Price and Route */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                            <Plane className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-500" />
                          </div>
                          <div>
                            <p className="font-black text-2xl text-blue-600">{offer.price.displayTotal}</p>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{offer.airline}</p>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-black text-gray-800">
                            {offer.departure.airport} → {offer.arrival.airport}
                          </p>
                          <p className="text-sm font-bold text-gray-500">
                            {offer.stops === 0 ? 'VOL DIRECT' : `${offer.stops} ESCALE${offer.stops > 1 ? 'S' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Flight Timeline */}
                      <div className="bg-white/40 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-2xl font-black text-gray-900">{formatTime(offer.departure.time)}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{offer.departure.airport}</p>
                            <p className="text-xs text-gray-500">{formatDate(offer.departure.time)}</p>
                          </div>
                          <div className="flex-1 mx-4 text-center">
                            <div className="relative">
                              <div className="h-0.5 bg-gray-300 w-full"></div>
                              <Plane className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 mt-2">{offer.duration ? formatDuration(offer.duration) : 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black text-gray-900">{formatTime(offer.arrival.time)}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{offer.arrival.airport}</p>
                            <p className="text-xs text-gray-500">{formatDate(offer.arrival.time)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Flight Segments Details */}
                      {offer.segments && offer.segments.length > 0 && (
                        <div className="bg-blue-50/30 rounded-2xl p-4 mb-4 space-y-3">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Détails du vol</p>
                          {offer.segments.map((segment, idx) => (
                            <div key={idx} className="bg-white/60 rounded-md p-3 border border-blue-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {segment.airline} {segment.flightNumber}
                                  </span>
                                  <span className="text-xs font-bold text-gray-500">
                                    {segment.aircraft}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-gray-500">
                                  {formatDuration(segment.duration)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-black text-gray-900">{formatTime(segment.departure.at)}</span>
                                  <span className="font-bold text-gray-500 ml-2">{segment.departure.iataCode}</span>
                                </div>
                                <div className="text-gray-400">→</div>
                                <div>
                                  <span className="font-black text-gray-900">{formatTime(segment.arrival.at)}</span>
                                  <span className="font-bold text-gray-500 ml-2">{segment.arrival.iataCode}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Additional Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white/40 rounded-2xl mb-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Places disponibles</p>
                          <p className="font-bold text-gray-800">{offer.bookableSeats} sièges</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Billetterie</p>
                          <p className="font-bold text-gray-800">{offer.instantTicketing ? 'Instantanée' : 'Différée'}</p>
                        </div>
                        {offer.lastTicketingDate && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Réserver avant</p>
                            <p className="font-bold text-gray-800">{formatDate(offer.lastTicketingDate)}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleSelectOffer(offer)}
                        disabled={selectedOffer?.id === offer.id}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-md shadow-lg shadow-blue-200 transition-all"
                      >
                        {selectedOffer?.id === offer.id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Transmis...
                          </span>
                        ) : "Réserver ce vol"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
                <p className="font-bold text-gray-500 animate-pulse">Recherche des meilleurs tarifs...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}