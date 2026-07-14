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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Search, Plane, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputPhone } from './ui/input-phone';
import { CityCombobox } from './ui/city-combobox';
import { toast } from 'sonner';

const flightSearchSchema = z.object({
  originLocationCode: z.string().min(1, "Origine requise"),
  destinationLocationCode: z.string().min(1, "Destination requise"),
  departureDate: z.date({ required_error: "Date de départ requise" }),
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

interface FlightSearchFormProps {
  userId?: string;
  onDialogClose?: (open: boolean) => void;
  onStepChange?: (step: number) => void;
}

export default function FlightSearchForm({ userId, onDialogClose, onStepChange }: FlightSearchFormProps = {}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    if (session?.user) {
      if (session.user.email) form.setValue('email', session.user.email);
      if (session.user.phone) form.setValue('phone', session.user.phone);
    }
  }, [session, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FlightSearchFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['originLocationCode', 'destinationLocationCode', 'departureDate'];
    } else if (step === 2) {
      fieldsToValidate = ['adults', 'travelClass', 'email'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 2) {
        await handleSubmitBooking(form.getValues());
      } else {
        const newStep = step + 1;
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

  const handleSubmitBooking = async (data: FlightSearchFormData) => {
    setIsLoading(true);

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
    }).catch(() => {});

    try {
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || undefined,
          type: 'FLIGHT',
          searchDetails: {
            ...data,
            departureDate: format(data.departureDate, 'yyyy-MM-dd'),
            returnDate: data.returnDate ? format(data.returnDate, 'yyyy-MM-dd') : undefined,
          },
          price: null,
          currency: null,
          contactName: data.email?.split('@')[0] || session?.user?.name || 'Client',
          contactEmail: data.email || session?.user?.email || '',
          contactPhone: data.phone || '',
        }),
      });

      await fetch('/api/flight-search-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          departureDate: format(data.departureDate, 'yyyy-MM-dd'),
          returnDate: data.returnDate ? format(data.returnDate, 'yyyy-MM-dd') : undefined,
          searchError: 'Recherche manuelle requise - API Amadeus désactivée',
        }),
      }).catch(() => {});

      if (bookingResponse.ok) {
        toast.success('Votre demande a été enregistrée!');
      } else {
        toast.error('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      }
    } catch {
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      const newStep = 3;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  };

  return (
    <>
      {/* STEP 1: ITINERARY */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-2 sm:p-4 border border-slate-200">
            <Form {...form}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                              className="h-12 bg-white border-gray-200 focus:border-blue-500 rounded-md transition-all"
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
                              className="h-12 bg-white border-gray-200 focus:border-blue-500 rounded-md transition-all"
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
                                  variant="outline"
                                  className={cn(
                                    "h-12 w-full pl-3 text-left font-normal bg-white border-gray-200 rounded-md transition-all",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => { field.onChange(date); setIsDepartureDateOpen(false); }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                                  variant="outline"
                                  className={cn(
                                    "h-12 w-full pl-3 text-left font-normal bg-white border-gray-200 rounded-md transition-all",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => { field.onChange(date); setIsReturnDateOpen(false); }}
                                disabled={(date) => {
                                  const departureDate = form.getValues('departureDate');
                                  const today = new Date(new Date().setHours(0, 0, 0, 0));
                                  return date < (departureDate || today);
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

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                  >
                    <span className="flex items-center justify-center">
                      <Search className="w-4 h-4 mr-2" />
                      Continuer
                    </span>
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* STEP 2: PASSENGERS + CONTACT */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-2 sm:p-4 border border-slate-200">
            <Form {...form}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700 ml-1">Classe de voyage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='bg-white rounded-md shadow-md border-gray-100'>
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
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-5 h-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-semibold text-gray-700 cursor-pointer">Vols directs uniquement</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-4">Passagers</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="adults"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700">Adultes</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
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
                            <FormLabel className="text-sm font-medium text-slate-700">Enfants (2-11 ans)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
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
                            <FormLabel className="text-sm font-medium text-slate-700">Bébés (0-2 ans)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 bg-white/70 border-gray-200 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className='bg-white rounded-md shadow-lg border-gray-100'>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-4">Coordonnées</p>
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
                                className="h-12 bg-white border-gray-200 focus:border-blue-500 rounded-md transition-all"
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
                                className="h-12 bg-white border-gray-200 focus:border-blue-500 rounded-md transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex-1 h-11 rounded-lg border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="flex-[2] h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Envoi...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Envoyer la demande
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRMATION */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Demande enregistrée!
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Votre demande de vol a été enregistrée. Notre équipe va rechercher les meilleures options
            et vous contactera sous 24 heures.
          </p>
          <Button
            onClick={() => onDialogClose?.(false)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            Fermer
          </Button>
        </div>
      )}
    </>
  );
}
