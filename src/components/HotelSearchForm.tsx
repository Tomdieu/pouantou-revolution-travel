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
import { Loader2, Search, Building, CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CityCombobox } from './ui/city-combobox';
import { Combobox } from './ui/combobox';
import citiesData from '@/constants/cities.json';
import iataCodesData from '@/constants/IATA_Codes_CityNames.json';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

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
  onDialogClose?: (open: boolean) => void;
  onStepChange?: (step: number) => void;
}

export default function HotelSearchForm({ userId, onDialogClose, onStepChange }: HotelSearchFormProps) {
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState<HotelSearchFormData | null>(null);

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
      if (step === 2) {
        // Move to step 3 and execute search
        const data = form.getValues();
        setSearchData(data);
        await performSearch(data);
      } else {
        const newStep = Math.min(step + 1, 3);
        setStep(newStep);
        onStepChange?.(newStep);
      }
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const prevStep = () => {
    const newStep = Math.max(step - 1, 1);
    setStep(newStep);
    onStepChange?.(newStep);
  };

  const performSearch = async (data: HotelSearchFormData) => {
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

    // 2. Create booking in DB
    try {
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined,
          type: 'HOTEL',
          searchDetails: {
            ...data,
            checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
            checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
          },
          price: data.budget,
          currency: 'EUR',
          contactName: 'Guest',
          contactEmail: '',
          contactPhone: data.phone,
        }),
      });

      if (bookingResponse.ok) {
        console.log('Hotel search demand saved to bookings');
      }
    } catch (err) {
      console.error('Error creating booking record:', err);
    }

    try {
      // Find the selected city
      const selectedCity = cities.find(
        city => city.city === data.city && city.country === data.country
      );

      if (!selectedCity) {
        setError('Ville sélectionnée non trouvée');
        const newStep = 3;
        setStep(newStep);
        onStepChange?.(newStep);
        setIsLoading(false);
        return;
      }

      // Try to find IATA code for the city
      const cityIataCode = cityToIataCode[selectedCity.city.toLowerCase()] ||
        cityToIataCode[selectedCity.city_ascii.toLowerCase()];

      if (!cityIataCode) {
        // Send email to admin without searching
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

        setError('Aucun hôtel trouvé pour cette région');
        const newStep = 3;
        setStep(newStep);
        onStepChange?.(newStep);
        setIsLoading(false);
        return;
      }

      // Search hotels with Amadeus
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

      const searchDataResponse = await searchResponse.json();

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
          foundHotels: searchDataResponse.success ? searchDataResponse.data.hotels : undefined,
          searchError: !searchDataResponse.success ? (searchDataResponse.error || 'Aucun hôtel trouvé') : undefined,
        }),
      });

      if (searchDataResponse.success && searchDataResponse.data.hotels) {
        setResults(searchDataResponse.data.hotels);
      } else {
        setError(searchDataResponse.error || 'Aucun hôtel trouvé pour cette recherche');
      }

      const newStep = 3;
      setStep(newStep);
      onStepChange?.(newStep);
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
      const newStep = 3;
      setStep(newStep);
      onStepChange?.(newStep);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <>
      {/* STEP 1: DESTINATION */}
      {step === 1 && (
        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Pays *</FormLabel>
                      <FormControl>
                        {isMobile ? (
                          <>
                            {/* Mobile: Bottom Sheet Dialog */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCountryDialogOpen(true);
                                setCountrySearchTerm(field.value || '');
                              }}
                              className="h-12 w-full px-3 text-left font-normal bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all"
                            >
                              {field.value ? (
                                <span className="text-gray-900">{field.value}</span>
                              ) : (
                                <span className="text-gray-400">Rechercher un pays...</span>
                              )}
                            </button>

                            {/* Mobile Country Selection Dialog */}
                            {isCountryDialogOpen && (
                              <div className="fixed inset-0 z-50 flex items-end">
                                {/* Backdrop */}
                                <div
                                  className="fixed inset-0 bg-black/50"
                                  onClick={() => setIsCountryDialogOpen(false)}
                                />

                                {/* Bottom Sheet */}
                                <div className="relative w-full bg-white rounded-t-2xl shadow-2xl h-[60vh] flex flex-col animate-in slide-in-from-bottom-10">
                                  {/* Header */}
                                  <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl z-10">
                                    <h3 className="text-lg font-bold text-gray-900">Sélectionner un pays</h3>
                                    <button
                                      type="button"
                                      onClick={() => setIsCountryDialogOpen(false)}
                                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                  </div>

                                  {/* Search Input */}
                                  <div className="border-b border-gray-100 p-4">
                                    <input
                                      type="search"
                                      placeholder="Rechercher..."
                                      value={countrySearchTerm}
                                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* Scrollable Country List */}
                                  <div className="flex-1 overflow-y-auto">
                                    <div className="p-2">
                                      {countries
                                        .filter((country) =>
                                          country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
                                        )
                                        .map((country) => (
                                          <button
                                            key={country.name}
                                            type="button"
                                            onClick={() => {
                                              field.onChange(country.name);
                                              setSelectedCountry(country.name);
                                              form.setValue('city', '');
                                              setIsCountryDialogOpen(false);
                                              setCountrySearchTerm('');
                                            }}
                                            className={cn(
                                              'w-full text-left px-4 py-3 rounded-lg transition-colors mb-1',
                                              field.value === country.name
                                                ? 'bg-blue-100 text-blue-900 font-semibold'
                                                : 'hover:bg-gray-100 text-gray-900'
                                            )}
                                          >
                                            {country.name}
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Desktop: Combobox */
                          <Combobox
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCountry(value);
                              form.setValue('city', '');
                            }}
                            placeholder="Rechercher un pays..."
                            options={countries.map(country => ({ value: country.name, label: country.name }))}
                            className="h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all"
                          />
                        )}
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
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Ville *</FormLabel>
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
                            "h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all",
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

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                Continuer
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="checkInDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Date d'arrivée *</FormLabel>
                      <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full pl-3 text-left font-normal bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all",
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
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Date de départ *</FormLabel>
                      <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full pl-3 text-left font-normal bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all",
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

              <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-100/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 ml-1">Nombre d'adultes</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg border border-gray-200">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
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
                        <FormLabel className="text-xs font-semibold text-gray-700 ml-1">Rayon (km)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg border border-gray-200">
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

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 h-12 rounded-lg border border-gray-200 font-bold hover:bg-gray-50"
              >
                Précédent
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Recherche...
                  </span>
                ) : (
                  'Continuer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* STEP 3: RESULTS & BUDGET & CONTACT */}
      {step === 3 && (
        <Form {...form}>
          <form className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Hôtels disponibles ({results.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto">
                  {results.map((hotel) => (
                    <div key={hotel.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-1">{hotel.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">📍 {hotel.address}</p>
                      {hotel.rating && (
                        <p className="text-sm font-semibold text-amber-600">⭐ {hotel.rating}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!error && !results.length && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
                <p className="text-blue-800 font-semibold">Aucun hôtel trouvé.</p>
                <p className="text-blue-600 text-sm mt-1">Notre équipe vous contactera avec les meilleures recommandations.</p>
              </div>
            )}

            <div className="space-y-6 border-t border-gray-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Budget par nuit (EUR) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ex: 150"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all"
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
                      <FormLabel className="text-sm font-semibold text-gray-700 ml-1">Téléphone *</FormLabel>
                      <FormControl>
                        <InputPhone
                          defaultCountry="CM"
                          value={field.value}
                          onChange={(value) => field.onChange(value || '')}
                          className="h-12 bg-white border border-gray-200 focus:border-blue-500 rounded-lg transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 h-12 rounded-lg border border-gray-200 font-bold hover:bg-gray-50"
              >
                Précédent
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onDialogClose?.(false);
                  toast.success('Demande de réservation envoyée!');
                }}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                Finaliser
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
          {/* Step Indicator */}
