'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Loader2, Send, Car, Check, ChevronsUpDown, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import carsData from '@/constants/cars.json';
import { toast } from 'sonner';

// Form validation schema
const carRentalSchema = z.object({
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  budgetPerDay: z.number().min(1, "Budget par jour requis").max(700000, "Budget maximum 700,000 XOF"),
  phone: z.string().min(1, "Numéro de téléphone requis"),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Date de départ requise",
  }),
  endDate: z.date({
    required_error: "Date de retour requise",
  }),
  driverAge: z.number().min(18, "Âge minimum 18 ans").max(80, "Âge maximum 80 ans").optional(),
});

type CarRentalFormData = z.infer<typeof carRentalSchema>;

interface CarRentalFormProps {
  userId?: string;
}

export default function CarRentalForm({ userId }: CarRentalFormProps = {}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [brandButtonWidth, setBrandButtonWidth] = useState<number>(0);
  const [modelButtonWidth, setModelButtonWidth] = useState<number>(0);
  const [step, setStep] = useState(1);

  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<CarRentalFormData>({
    resolver: zodResolver(carRentalSchema),
    defaultValues: {
      brand: '',
      model: '',
      budgetPerDay: 0,
      phone: session?.user?.phone || '',
      location: '',
      startDate: undefined,
      endDate: undefined,
      driverAge: 25,
    },
  });

  // Pre-populate form when session data becomes available
  useEffect(() => {
    if (session?.user?.phone) {
      form.setValue('phone', session.user.phone);
    }
  }, [session, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CarRentalFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['brand', 'model'];
    } else if (step === 2) {
      fieldsToValidate = ['location', 'startDate', 'endDate', 'driverAge'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error("Veuillez remplir les champs obligatoires");
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Get unique brands from cars data
  const brands = carsData.map(carBrand => carBrand.brand).sort();

  // Get models for selected brand
  const availableModels = selectedBrand
    ? carsData.find(carBrand => carBrand.brand === selectedBrand)?.models || []
    : [];

  // Update button widths when component mounts or when content changes
  useLayoutEffect(() => {
    if (brandButtonRef.current) {
      setBrandButtonWidth(brandButtonRef.current.offsetWidth);
    }
  }, [form.watch('brand')]);

  useLayoutEffect(() => {
    if (modelButtonRef.current) {
      setModelButtonWidth(modelButtonRef.current.offsetWidth);
    }
  }, [form.watch('model'), selectedBrand]);

  const onSubmit = async (data: CarRentalFormData) => {
    setIsLoading(true);
    setError(null);

    // Analytics logging
    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'CAR_RENTAL',
        searchDetails: {
          ...data,
          startDate: format(data.startDate, 'yyyy-MM-dd'),
          endDate: format(data.endDate, 'yyyy-MM-dd'),
        }
      }),
    }).catch(err => console.error('Failed to log car rental search:', err));

    try {
      // Send car rental request to team
      const response = await fetch('/api/car-rental-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carRentalData: {
            brand: data.brand,
            model: data.model,
            budgetPerDay: data.budgetPerDay,
            phone: data.phone,
            location: data.location,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: format(data.endDate, 'yyyy-MM-dd'),
            driverAge: data.driverAge,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setError(null);
        toast.success('Demande de location de voiture envoyée avec succès !');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'envoi de la demande');
        toast.error(errorData.error || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      toast.error(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }

    // If userId is provided, create a booking in the database
    // Create a booking in the database (works for both guests and logged-in users)
    try {
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined,
          type: 'CAR_RENTAL',
          searchDetails: {
            ...data,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: format(data.endDate, 'yyyy-MM-dd'),
          },
          price: data.budgetPerDay,
          currency: 'XAF',
          contactName: 'Guest',
          contactEmail: '',
          contactPhone: data.phone,
        }),
      });

      if (bookingResponse.ok) {
        console.log('Car rental booking saved successfully');
        if (userId) {
          toast.success('Votre réservation a été enregistrée! Notre équipe vous contactera bientôt.');
          // Refresh the page to show the new booking
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Error creating booking:', err);
    }
  };

  const steps = [
    { id: 1, title: 'Véhicule', icon: <Car className="w-5 h-5" /> },
    { id: 2, title: 'Détails', icon: <Send className="w-5 h-5" /> },
    { id: 3, title: 'Finaliser', icon: <Car className="w-5 h-5" /> }
  ];

  return (
    <div className='flex flex-col gap-10'>
      {!isSubmitted && (
        <div className="max-w-4xl mx-auto w-full">
          {/* Step Indicator */}
          <div className="mb-10 relative px-4">
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

          <div className="glass-premium rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
            {/* Decorative Icon Background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              {steps[step - 1].icon}
            </div>

            <div className='flex flex-col gap-8 relative z-10'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* STEP 1: VEHICLE */}
                  {step === 1 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Marque *</FormLabel>
                              <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      ref={brandButtonRef}
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "h-12 w-full justify-between bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all",
                                        !field.value && "text-muted-foreground font-normal"
                                      )}
                                    >
                                      {field.value
                                        ? brands.find(brand => brand === field.value)
                                        : "Sélectionnez une marque"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0 bg-white rounded-xl shadow-2xl border-gray-100 overflow-hidden"
                                  align='end'
                                  style={{ width: brandButtonWidth > 0 ? `${brandButtonWidth}px` : undefined }}
                                >
                                  <Command className='relative max-h-56'>
                                    <CommandInput className='border-none focus:ring-0 uppercase text-xs font-bold tracking-widest' placeholder="Rechercher..." />
                                    <CommandEmpty className='p-4 text-sm text-gray-500'>Aucune marque trouvée.</CommandEmpty>
                                    <CommandGroup className='overflow-auto p-1'>
                                      {brands.map((brand) => (
                                        <CommandItem
                                          className='rounded-lg hover:bg-blue-50 px-3 py-2 transition-colors cursor-pointer'
                                          key={brand}
                                          onSelect={() => {
                                            field.onChange(brand);
                                            setSelectedBrand(brand);
                                            form.setValue('model', '');
                                            setBrandOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 text-blue-600",
                                              brand === field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className='font-medium text-gray-700'>{brand}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Modèle *</FormLabel>
                              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      ref={modelButtonRef}
                                      variant="outline"
                                      role="combobox"
                                      disabled={!selectedBrand}
                                      className={cn(
                                        "h-12 w-full justify-between bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all",
                                        !field.value && "text-muted-foreground font-normal"
                                      )}
                                    >
                                      {field.value
                                        ? availableModels.find(model => model === field.value)
                                        : selectedBrand ? "Sélectionnez un modèle" : "Sélectionnez d'abord une marque"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0 bg-white rounded-xl shadow-2xl border-gray-100 overflow-hidden"
                                  style={{ width: modelButtonWidth > 0 ? `${modelButtonWidth}px` : undefined }}
                                >
                                  <Command className='relative max-h-56'>
                                    <CommandInput className='border-none focus:ring-0 uppercase text-xs font-bold tracking-widest' placeholder="Rechercher..." />
                                    <CommandEmpty className='p-4 text-sm text-gray-500'>Aucun modèle trouvé.</CommandEmpty>
                                    <CommandGroup className='overflow-auto p-1'>
                                      {availableModels.map((model) => (
                                        <CommandItem
                                          className='rounded-lg hover:bg-blue-50 px-3 py-2 transition-colors cursor-pointer'
                                          key={`${selectedBrand}-${model}`}
                                          onSelect={() => {
                                            field.onChange(model);
                                            setModelOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 text-blue-600",
                                              model === field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className='font-medium text-gray-700'>{model}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold text-gray-700 ml-1">Lieu de prise en charge</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: Aéroport de Douala"
                                {...field}
                                className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de début</FormLabel>
                              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all",
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
                                      setIsStartDateOpen(false);
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
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Date de fin</FormLabel>
                              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-xl transition-all",
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
                                      setIsEndDateOpen(false);
                                    }}
                                    disabled={(date) => {
                                      const startDate = form.getValues('startDate');
                                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                                      const minDate = startDate || today;
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

                      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                        <FormField
                          control={form.control}
                          name="driverAge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Âge du conducteur</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="ex: 35"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  className="h-11 bg-white/70 border-gray-200 rounded-xl focus:border-blue-500 transition-all font-semibold"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: FINALIZER */}
                  {step === 3 && (
                    <div className="animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budgetPerDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Budget par jour (XAF) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="ex: 75"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                              <FormLabel className="text-sm font-bold text-gray-700 ml-1">Numéro de téléphone *</FormLabel>
                              <FormControl>
                                <InputPhone
                                  defaultCountry="CM"
                                  value={field.value}
                                  onChange={(value) => field.onChange(value || '')}
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
                        className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-black rounded-2xl transition-all hover:-translate-y-1 active:scale-95"
                      >
                        Continuer
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/40 text-lg font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center text-white">
                            <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                            Envoi en cours...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-white">
                            <Send className="mr-3 h-5 w-5" />
                            Envoyer ma demande
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

      {/* Success Message */}
      {isSubmitted && (
        <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
          <div className="glass-premium rounded-[2rem] p-12 text-center border border-white/40 shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">Demande Envoyée !</h3>
            <p className="text-gray-500 text-lg font-medium mb-10 max-w-md mx-auto">
              Votre demande de location a bien été transmise. Nos agents vous contacteront sous peu avec les meilleures options.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
                form.reset();
              }}
              className="px-8 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-200"
            >
              Faire une autre demande
            </Button>
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
    </div>
  );
}