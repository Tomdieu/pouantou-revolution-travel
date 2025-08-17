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

  const onSubmit = async (data: FlightSearchFormData) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setShowResults(false);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche de vols');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOffer = async (offer: FlightOffer) => {
    setSelectedOffer(offer);
    
    const formData = form.getValues();
    
    try {
      const emailResponse = await fetch('/api/flight-search-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedFlight: offer,
        }),
      });

      if (emailResponse.ok) {
        toast.success('Votre sélection a été envoyée à notre équipe. Nous vous contacterons bientôt!');
      } else {
        toast.error('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
      console.error('Error sending flight selection:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche de Vols Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Flight Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originLocationCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Départ</FormLabel>
                      <FormControl>
                        <CityCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Sélectionnez l'aéroport de départ"
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <CityCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Sélectionnez l'aéroport de destination"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de départ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Date de retour (optionnel)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adultes</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9].map(num => (
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
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enfants (2-11 ans)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9].map(num => (
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
                  name="infants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bébés (0-2 ans)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="travelClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe de voyage</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vols directs uniquement</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.com" {...field} />
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
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <InputPhone defaultCountry='CM' placeholder="+237 6XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Send to Team Option */}
              <FormField
                control={form.control}
                name="sendToTeam"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Envoyer ma demande à un agent</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Notre équipe vous contactera pour finaliser votre réservation
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Recherche en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher des vols
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
      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de recherche ({results.length} vols trouvés)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg text-blue-600">{offer.price.displayTotal}</p>
                      <p className="text-sm text-gray-600">
                        {offer.departure.airport} → {offer.arrival.airport}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Compagnie: {offer.airline}</p>
                      <p className="text-sm text-gray-600">
                        {offer.stops === 0 ? 'Direct' : `${offer.stops} escale${offer.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <p>Durée: {offer.duration || 'N/A'}</p>
                    <p>Places disponibles: {offer.bookableSeats}</p>
                    <p>Réservation instantanée: {offer.instantTicketing ? 'Oui' : 'Non'}</p>
                  </div>
                  
                  {offer.lastTicketingDate && (
                    <p className="text-xs text-orange-600 mb-3">
                      Réserver avant: {new Date(offer.lastTicketingDate).toLocaleDateString()}
                    </p>
                  )}

                  <Button 
                    onClick={() => handleSelectOffer(offer)}
                    className="w-full"
                    variant={selectedOffer?.id === offer.id ? "default" : "outline"}
                  >
                    {selectedOffer?.id === offer.id ? "Sélectionné" : "Sélectionner ce vol"}
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
