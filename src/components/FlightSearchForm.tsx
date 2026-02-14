'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Plane } from 'lucide-react';
import { InputPhone } from './ui/input-phone';
import { CityCombobox } from './ui/city-combobox';
import { toast } from 'sonner';

// Form validation schema
const flightSearchSchema = z.object({
  originLocationCode: z.string().min(3, "Code aéroport de départ requis (ex: DLA)"),
  destinationLocationCode: z.string().min(3, "Code aéroport de destination requis (ex: PAR)"),
  departureDate: z.string().min(1, "Date de départ requise"),
  returnDate: z.string().optional(),
  adults: z.number().min(1, "Au moins 1 adulte requis").max(9, "Maximum 9 adultes"),
  children: z.number().min(0).max(9, "Maximum 9 enfants").optional(),
  infants: z.number().min(0).max(9, "Maximum 9 bébés").optional(),
  travelClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
  nonStop: z.boolean().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  sendToTeam: z.boolean().optional(),
}).refine((data) => data.email || data.phone, {
  message: "Email ou téléphone requis",
  path: ["email"],
});

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

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
  bookableSeats: number;
  instantTicketing: boolean;
  lastTicketingDate?: string;
}

export default function FlightSearchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState<FlightSearchFormData | null>(null);

  const form = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      originLocationCode: '',
      destinationLocationCode: '',
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY',
      nonStop: false,
      email: '',
      phone: '',
      sendToTeam: false,
    },
  });

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
        searchDetails: data
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
          departureDate: data.departureDate,
          returnDate: data.returnDate,
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

          <div className="glass-premium rounded-3xl p-8 sm:p-10 border border-white/40 shadow-2xl relative overflow-hidden group">
            {/* Decorative Icon Background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              {steps[step - 1].icon}
            </div>

            <div className='flex flex-col gap-8 relative z-10'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* STEP 1: ITINERARY */}
                  {step === 1 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
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
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="departureDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de départ</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                />
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
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de retour (optionnel)</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EXPERIENCE */}
                  {step === 2 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="travelClass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Classe de voyage</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className='bg-white rounded-xl shadow-2xl border-gray-100'>
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
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-gray-100 bg-white/40 p-4 transition-all hover:bg-white/60 mt-8">
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
                      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
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
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-xl shadow-2xl border-gray-100'>
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
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-xl shadow-2xl border-gray-100'>
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
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='bg-white rounded-xl shadow-2xl border-gray-100'>
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
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
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
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="sendToTeam"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30 p-5 transition-all hover:border-blue-200 hover:bg-blue-50/50">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-6 h-6 rounded-lg border-2 border-blue-200 mt-1 data-[state=checked]:bg-blue-600"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-base font-bold text-blue-900 cursor-pointer">
                                Envoyer ma demande à un agent
                              </FormLabel>
                              <p className="text-sm text-blue-700/70 font-medium">
                                Notre équipe trouvera pour vous les meilleures options et tarifs négociés.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
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
                        className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                      >
                        Continuer
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/40 text-lg font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98]"
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className='flex flex-col gap-5'>
            <div className="flex px-4 items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                <Search className="w-6 h-6 text-blue-600" />
                {results.length > 0 ? `Résultats (${results.length})` : 'Aucun résultat'}
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 hover:bg-gray-50"
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
                {results.map((offer) => (
                  <div key={offer.id} className="glass-premium border border-white/60 p-6 rounded-3xl hover:shadow-xl transition-all group">
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/40 rounded-2xl mb-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Départ</p>
                        <p className="font-bold text-gray-800">{formatDate(offer.departure.time)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Arrivée</p>
                        <p className="font-bold text-gray-800">{formatDate(offer.arrival.time)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Durée</p>
                        <p className="font-bold text-gray-800">{offer.duration || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Places</p>
                        <p className="font-bold text-gray-800">{offer.bookableSeats} libres</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectOffer(offer)}
                      disabled={selectedOffer?.id === offer.id}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                    >
                      {selectedOffer?.id === offer.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Transmis...
                        </span>
                      ) : "Réserver ce vol"}
                    </Button>
                  </div>
                ))}
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