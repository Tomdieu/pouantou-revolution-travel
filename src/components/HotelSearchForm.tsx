'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Building, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CityCombobox } from './ui/city-combobox';
import { Combobox } from './ui/combobox';
import citiesData from '@/constants/cities.json';
import iataCodesData from '@/constants/IATA_Codes_CityNames.json';
import { toast } from 'sonner';

// Type for city data
interface CityData {
  city: string;
  city_ascii: string;
  lat: string;
  lng: string;
  country: string;
  iso2: string;
  iso3: string;
  admin_name: string;
  capital?: string;
  population: string;
  id: string;
}

// Type for IATA codes data
interface IataCodeMap {
  [key: string]: string;
}

// Cast the imported data
const cities = citiesData as CityData[];
const iataCodes = iataCodesData as IataCodeMap;

// Create reverse mapping for IATA codes
const cityToIataCode = Object.entries(iataCodes).reduce((acc, [code, cityName]) => {
  acc[cityName.toLowerCase()] = code;
  return acc;
}, {} as { [key: string]: string });

// Form validation schema
const hotelSearchSchema = z.object({
  country: z.string().min(1, "Pays requis"),
  city: z.string().min(1, "Ville requise"),
  phone: z.string().min(1, "Numéro de téléphone requis"),
  budget: z.number().min(1, "Budget requis").max(10000, "Budget maximum 10,000"),
  checkInDate: z.date({
    required_error: "Date d'arrivée requise",
  }),
  checkOutDate: z.date({
    required_error: "Date de départ requise",
  }),
  adults: z.number().min(1, "Au moins 1 adulte requis").max(8, "Maximum 8 adultes").optional(),
  radius: z.number().min(1).max(300, "Rayon maximum 300km").optional(),
});

type HotelSearchFormData = z.infer<typeof hotelSearchSchema>;

interface Hotel {
  id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: {
    value: number;
    unit: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  amenities?: string[];
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

interface HotelSearchFormProps {
  userId?: string;
}

export default function HotelSearchForm({ userId }: HotelSearchFormProps = {}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<HotelSearchFormData>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      country: '',
      city: '',
      phone: session?.user?.phone || '',
      budget: 0,
      checkInDate: undefined,
      checkOutDate: undefined,
      adults: 2,
      radius: 50,
    },
  });

  // Pre-populate form when session data becomes available
  useEffect(() => {
    if (session?.user?.phone) {
      form.setValue('phone', session.user.phone);
    }
  }, [session, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof HotelSearchFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['country', 'city'];
    } else if (step === 2) {
      fieldsToValidate = ['checkInDate', 'checkOutDate', 'adults', 'radius'];
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

  // Get unique countries from cities data
  const countries = Array.from(new Set(cities.map(city => city.country)))
    .sort()
    .map(country => ({
      name: country,
      cities: cities.filter(city => city.country === country)
    }));

  // Get cities for selected country
  const availableCities = selectedCountry
    ? cities.filter(city => city.country === selectedCountry)
    : [];

  const onSubmit = async (data: HotelSearchFormData) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    // 1. Analytics logging
    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'HOTEL',
        searchDetails: {
          ...data,
          checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
        }
      }),
    }).catch(err => console.error('Failed to log hotel search:', err));

    // 2. Create booking in DB early if userId is provided
    // This ensures the demand is saved even if search fails
    if (userId) {
      try {
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            type: 'HOTEL',
            searchDetails: {
              ...data,
              checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
              checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
            },
            price: data.budget,
            currency: 'EUR',
            contactName: 'User',
            contactEmail: '',
            contactPhone: data.phone,
          }),
        });

        if (bookingResponse.ok) {
          console.log('Hotel search demand saved to bookings for user:', userId);
        } else {
          console.error('Failed to save hotel demand to bookings');
        }
      } catch (err) {
        console.error('Error creating booking record:', err);
      }
    }

    try {
      // Find the selected city
      const selectedCity = cities.find(
        city => city.city === data.city && city.country === data.country
      );

      if (!selectedCity) {
        setError('Ville sélectionnée non trouvée');
        setIsSubmitted(true);
        return;
      }

      // Try to find IATA code for the city
      const cityIataCode = cityToIataCode[selectedCity.city.toLowerCase()] ||
        cityToIataCode[selectedCity.city_ascii.toLowerCase()];

      if (!cityIataCode) {
        // If no IATA code is found, send email to admin without searching
        await fetch('/api/hotel-search-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
            checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
            searchError: 'Code IATA non trouvé pour cette ville. Recherche manuelle requise.',
          }),
        });

        setIsSubmitted(true);
        return;
      }

      // Try to search hotels with Amadeus
      const searchResponse = await fetch('/api/amadeus/hotel-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityCode: cityIataCode,
          budget: data.budget,
          checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
          adults: data.adults,
          radius: data.radius,
        }),
      });

      const searchData = await searchResponse.json();

      // Send email to admin with results
      await fetch('/api/hotel-search-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
          foundHotels: searchData.success ? searchData.data.hotels : undefined,
          searchError: !searchData.success ? (searchData.error || 'Aucun hôtel trouvé') : undefined,
        }),
      });

      if (searchData.success && searchData.data.hotels) {
        setResults(searchData.data.hotels);
      } else {
        setError(searchData.error || 'Aucun hôtel trouvé pour cette recherche');
      }

      setIsSubmitted(true);
    } catch (err) {
      // Send email to admin with error
      await fetch('/api/hotel-search-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
          searchError: err instanceof Error ? err.message : 'Erreur de recherche d\'hôtels',
        }),
      });

      setError(err instanceof Error ? err.message : 'Erreur de recherche d\'hôtels');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Destination', icon: <Building className="w-5 h-5" /> },
    { id: 2, title: 'Détails', icon: <Search className="w-5 h-5" /> },
    { id: 3, title: 'Budget & Contact', icon: <Building className="w-5 h-5" /> }
  ];

  return (
    <div className='flex flex-col gap-10'>
      {!isSubmitted && (
        <div className="max-w-4xl mx-auto w-full">
          {/* Step Indicator */}
          <div className="mb-10 px-4 relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-indigo-600 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            <div className="flex justify-between relative z-10">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${step >= s.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                      : 'bg-white border-gray-200 text-gray-400'
                      }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= s.id ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-10 relative overflow-hidden group">
            {/* Decorative Icon Background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              {steps[step - 1].icon}
            </div>

            <div className='flex flex-col gap-8 relative z-10'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* STEP 1: DESTINATION */}
                  {step === 1 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Pays *</FormLabel>
                              <FormControl>
                                <Combobox
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedCountry(value);
                                    form.setValue('city', '');
                                  }}
                                  placeholder="Rechercher un pays..."
                                  options={countries.map(country => ({ value: country.name, label: country.name }))}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 rounded-xl transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Ville *</FormLabel>
                              <FormControl>
                                <Combobox
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder={selectedCountry ? "Rechercher une ville..." : "Sélectionnez d'abord un pays"}
                                  options={availableCities.map(city => ({
                                    value: city.city,
                                    label: city.city
                                  }))}
                                  className={cn(
                                    "h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 rounded-xl transition-all",
                                    !selectedCountry && "opacity-50 cursor-not-allowed"
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 2 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="checkInDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date d'arrivée</FormLabel>
                              <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl transition-all",
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
                                      setIsCheckInOpen(false);
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
                          name="checkOutDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de départ</FormLabel>
                              <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl transition-all",
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
                                      setIsCheckOutOpen(false);
                                    }}
                                    disabled={(date) => {
                                      const checkInDate = form.getValues('checkInDate');
                                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                                      const minDate = checkInDate || today;
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

                      <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="adults"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Nombre d'adultes</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white rounded-xl shadow-2xl border-gray-100">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                      <SelectItem key={num} value={num.toString()} className="hover:bg-indigo-50 transition-colors">{num}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="radius"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Rayon (km)</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white rounded-xl shadow-2xl border-gray-100">
                                    <SelectItem value="10">10 km</SelectItem>
                                    <SelectItem value="25">25 km</SelectItem>
                                    <SelectItem value="50">50 km</SelectItem>
                                    <SelectItem value="100">100 km</SelectItem>
                                    <SelectItem value="200">200 km</SelectItem>
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

                  {/* STEP 3: BUDGET & CONTACT */}
                  {step === 3 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Budget par nuit (EUR) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="ex: 150"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 rounded-xl transition-all"
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
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Téléphone *</FormLabel>
                              <FormControl>
                                <InputPhone
                                  defaultCountry="CM"
                                  value={field.value}
                                  onChange={(value) => field.onChange(value || '')}
                                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 rounded-xl transition-all"
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
                        className="flex-[2] h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95"
                      >
                        Continuer
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/40 text-lg font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center text-white">
                            <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                            Recherche...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-white">
                            <Search className="mr-3 h-5 w-5" />
                            Rechercher des hôtels
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

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto w-full animate-fade-in">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-red-600 font-bold text-xl">!</span>
            </div>
            <p className="text-red-800 font-bold py-2">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {isSubmitted && (
        <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
          <div className="flex justify-start mb-6">
            <Button
              variant="outline"
              className="rounded-xl border-indigo-200 hover:bg-indigo-50 font-bold"
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
              }}
            >
              ← Nouvelle recherche
            </Button>
          </div>

          {results.length > 0 ? (
            <div className="glass-premium rounded-[2rem] p-8 border border-white/40 shadow-xl">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-indigo-600" />
                </div>
                Hôtels à proximité ({results.length})
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {results.map((hotel) => (
                  <div key={hotel.id} className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                          {hotel.name}
                        </h4>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 font-bold">
                          <span className="shrink-0">📍</span>
                          {hotel.address}
                        </div>

                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/80 border border-white/60 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-tighter shadow-sm">
                                {amenity.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3 text-right">
                        {hotel.rating && (
                          <div className="flex items-center gap-2 bg-amber-400/10 px-4 py-2 rounded-2xl border border-amber-200/50">
                            <span className="text-amber-600 text-sm font-black">⭐ {hotel.rating}</span>
                          </div>
                        )}
                        {hotel.distance && (
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {hotel.distance.value} {hotel.distance.unit} du centre
                          </p>
                        )}

                        <Button className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1">
                          Réserver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !error && (
            <div className="glass-premium rounded-3xl p-12 text-center border border-white/40">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Demande Transmise</h3>
              <p className="text-gray-500 font-medium">
                Nous n'avons pas trouvé de tarifs immédiats, mais notre équipe a reçu votre demande et vous contactera avec les meilleures offres.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
