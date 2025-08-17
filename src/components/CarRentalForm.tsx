'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPhone } from '@/components/ui/input-phone';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Loader2, Send, Car, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import carsData from '@/constants/cars.json';
import { toast } from 'sonner';

// Form validation schema
const carRentalSchema = z.object({
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  budgetPerDay: z.number().min(1, "Budget par jour requis").max(1000, "Budget maximum 1,000 EUR"),
  phone: z.string().min(1, "Numéro de téléphone requis"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  driverAge: z.number().min(18, "Âge minimum 18 ans").max(80, "Âge maximum 80 ans").optional(),
});

type CarRentalFormData = z.infer<typeof carRentalSchema>;

export default function CarRentalForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [brandButtonWidth, setBrandButtonWidth] = useState<number>(0);
  const [modelButtonWidth, setModelButtonWidth] = useState<number>(0);

  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<CarRentalFormData>({
    resolver: zodResolver(carRentalSchema),
    defaultValues: {
      brand: '',
      model: '',
      budgetPerDay: 0,
      phone: '',
      location: '',
      startDate: '',
      endDate: '',
      driverAge: 25,
    },
  });

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
            startDate: data.startDate,
            endDate: data.endDate,
            driverAge: data.driverAge,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setError(null);
        // Reset form
        form.reset({
          brand: '',
          model: '',
          budgetPerDay: 0,
          phone: '',
          location: '',
          startDate: '',
          endDate: '',
          driverAge: 25,
        });
        setSelectedBrand('');
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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Location de Voitures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Brand Combobox */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Marque *</FormLabel>
                    <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={brandButtonRef}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
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
                        className="p-0 bg-white"
                        align='end'
                        style={{ width: brandButtonWidth > 0 ? `${brandButtonWidth}px` : undefined }}
                      >
                        <Command className='relative max-h-56 overflow-auto'>
                          <CommandInput className='sticky top-0' placeholder="Rechercher une marque..." />
                          <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                          <CommandGroup className='overflow-auto'>
                            {brands.map((brand) => (
                              <CommandItem
                                key={brand}
                                onSelect={() => {
                                  field.onChange(brand);
                                  setSelectedBrand(brand);
                                  form.setValue('model', ''); // Reset model when brand changes
                                  setBrandOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    brand === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {brand}
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

              {/* Model Combobox */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Modèle *</FormLabel>
                    <Popover open={modelOpen} onOpenChange={setModelOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={modelButtonRef}
                            variant="outline"
                            role="combobox"
                            disabled={!selectedBrand}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
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
                        className="p-0 bg-white"
                        style={{ width: modelButtonWidth > 0 ? `${modelButtonWidth}px` : undefined }}
                      >
                        <Command className='relative max-h-56 overflow-y-scroll'>
                          <CommandInput className='sticky top-0' placeholder="Rechercher un modèle..." />
                          <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>
                          <CommandGroup className='overflow-y-auto'>
                            {availableModels.map((model) => (
                              <CommandItem
                                key={`${selectedBrand}-${model}`}
                                onSelect={() => {
                                  field.onChange(model);
                                  setModelOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    model === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {model}
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

              {/* Budget */}
              <FormField
                control={form.control}
                name="budgetPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget par jour (EUR) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ex: 75" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Fields */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de prise en charge (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Aéroport de Douala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début (optionnel)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin (optionnel)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Driver Age - Manual Input */}
              <FormField
                control={form.control}
                name="driverAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge du conducteur (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ex: 35" 
                        min="18"
                        max="80"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer ma demande de location
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
    </div>
  );
}