'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone} from '@/components/ui/input-phone';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Building } from 'lucide-react';
import citiesData from '@/constants/cities.json';
import iataCodesData from '@/constants/IATA_Codes_CityNames.json';

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
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
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

export default function HotelSearchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const form = useForm<HotelSearchFormData>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      country: '',
      city: '',
      phone: '',
      budget: 0,
      checkInDate: '',
      checkOutDate: '',
      adults: 2,
      radius: 50,
    },
  });

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

    try {
      // Find the selected city
      const selectedCity = cities.find(
        city => city.city === data.city && city.country === data.country
      );

      if (!selectedCity) {
        setError('Ville sélectionnée non trouvée');
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
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
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
          searchError: err instanceof Error ? err.message : 'Erreur de recherche d\'hôtels',
        }),
      });

      setError(err instanceof Error ? err.message : 'Erreur de recherche d\'hôtels');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Recherche d'Hôtels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Country Selection */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCountry(value);
                        form.setValue('city', ''); // Reset city when country changes
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un pays" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.name} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City Selection */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedCountry}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCountry ? "Sélectionnez une ville" : "Sélectionnez d'abord un pays"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={`${city.country}-${city.city}`} value={city.city}>
                            {city.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget par nuit (EUR) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ex: 150" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone *</FormLabel>
                    <FormControl>
                      <InputPhone
                        defaultCountry="CM"
                        value={field.value}
                        onChange={(value) => field.onChange(value || '')}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'arrivée (optionnel)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="checkOutDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de départ (optionnel)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre d'adultes</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(num => (
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
                      <FormLabel>Rayon de recherche (km)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Recherche en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher des hôtels
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de recherche ({results.length} hôtels trouvés)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((hotel) => (
                <div key={hotel.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-600">{hotel.name}</h3>
                      <p className="text-sm text-gray-600">{hotel.address}</p>
                    </div>
                    <div className="text-right">
                      {hotel.rating && (
                        <p className="text-sm text-gray-600">
                          ⭐ {hotel.rating}/5
                        </p>
                      )}
                      {hotel.distance && (
                        <p className="text-sm text-gray-600">
                          📍 {hotel.distance.value} {hotel.distance.unit}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Équipements:</strong> {hotel.amenities.slice(0, 5).join(', ')}
                        {hotel.amenities.length > 5 && '...'}
                      </p>
                    </div>
                  )}

                  {hotel.contact && (
                    <div className="text-sm text-gray-600 mb-3">
                      {hotel.contact.phone && <p>📞 {hotel.contact.phone}</p>}
                      {hotel.contact.email && <p>✉️ {hotel.contact.email}</p>}
                    </div>
                  )}

                  <Button variant="outline" className="w-full">
                    Voir les détails
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
