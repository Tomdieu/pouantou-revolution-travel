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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

interface DevisFormProps {
  className?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
}

export default function DevisForm({ className = "", onSubmitSuccess, onSubmitError }: DevisFormProps) {
  // Add hydration state to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Form setup with react-hook-form and zod - Updated for Amadeus API
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      departureCity: '',
      destination: '',
      departureDate: (() => {
        // Set default date to tomorrow to avoid timezone issues
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        return tomorrow;
      })(),
      returnDate: undefined,
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY' as const,
      preferredAirline: 'none', // Changed to 'none' to match SelectItem value
      nonStop: false,
      budget: '',
      currencyCode: 'XAF',
      maxPrice: undefined,
      additionalInfo: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    console.log('Form submission started', data);
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Validate form data
      if (!data.departureCity || !data.destination) {
        toast.error("Veuillez sélectionner une ville de départ et une destination");
        return;
      }

      const formDataForAPI = {
        ...data,
        departureDate: data.departureDate.toISOString().split('T')[0],
        returnDate: data.returnDate?.toISOString().split('T')[0] || '',
        // Convert numbers to strings for backwards compatibility with email templates
        passengersTotal: data.adults + data.children + data.infants,
        adultsCount: data.adults,
        childrenCount: data.children,
        infantsCount: data.infants
      };

      console.log('Sending form data to API:', formDataForAPI);

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataForAPI),
      });

      const result = await response.json();
      console.log('API response:', { status: response.status, result });

      if (response.ok && result.success) {
        toast.success('Demande envoyée avec succès! Vous recevrez votre devis sous 1h.');
        setSubmitStatus({
          type: 'success',
          message: 'Demande envoyée avec succès! Vous recevrez votre devis sous 1h.'
        });
        
        // Reset form
        form.reset({
          fullName: '',
          phone: '',
          email: '',
          departureCity: '',
          destination: '',
          departureDate: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            return tomorrow;
          })(),
          returnDate: undefined,
          adults: 1,
          children: 0,
          infants: 0,
          travelClass: 'ECONOMY' as const,
          preferredAirline: 'none',
          nonStop: false,
          budget: '',
          currencyCode: 'XAF',
          maxPrice: undefined,
          additionalInfo: ''
        });

        // Call success callback if provided
        onSubmitSuccess?.();
      } else {
        const errorMessage = result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.';
        toast.error(errorMessage);
        setSubmitStatus({
          type: 'error',
          message: errorMessage
        });
        
        // Call error callback if provided
        onSubmitError?.(errorMessage);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
      toast.error(errorMessage);
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
      
      // Call error callback if provided
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black mb-4">
          Demande de Devis
        </h2>
        <p className="text-black">
          Remplissez le formulaire et recevez votre devis personnalisé sous 1h.
        </p>
      </div>

      {/* Status Message */}
      {submitStatus.message && (
        <div className={`mb-6 p-4 rounded-lg ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl">
                {submitStatus.type === 'success' ? '✅' : '❌'}
              </span>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {submitStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
        {isHydrated && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log('Form validation errors:', errors);
              toast.error("Veuillez corriger les erreurs dans le formulaire");
              
              // Focus on first error field
              const firstErrorField = Object.keys(errors)[0];
              if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  (element as HTMLElement).focus();
                }
              }
            })} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nom Complet *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Votre nom et prénom" 
                        className="h-10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="votre.email@exemple.com" 
                        className="h-10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Téléphone *</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="+237 6XX XXX XXX" 
                      className="h-10" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trip Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Ville de Départ *</FormLabel>
                    <FormControl>
                      <CityCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Ex: Douala, Yaoundé..."
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Destination *</FormLabel>
                    <FormControl>
                      <CityCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Ex: Paris, New York..."
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Date de Départ *</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-between font-normal"
                          >
                            {field.value ? field.value.toLocaleDateString() : "Sélectionner une date"}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) field.onChange(date);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0); // Reset time to start of day
                              const maxDate = new Date();
                              maxDate.setMonth(today.getMonth() + 9);
                              maxDate.setHours(23, 59, 59, 999); // Set to end of day
                              return date < today || date > maxDate;
                            }}
                            defaultMonth={field.value || new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                    <FormLabel className="text-sm font-medium">Date de Retour</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-between font-normal"
                          >
                            {field.value ? field.value.toLocaleDateString() : "Optionnel pour aller simple"}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            captionLayout="dropdown"
                            onSelect={(date) => field.onChange(date)}
                            disabled={(date) => {
                              const departureDate = form.watch("departureDate");
                              const maxDate = new Date();
                              maxDate.setMonth(new Date().getMonth() + 9);
                              
                              if (!departureDate) {
                                return date < new Date() || date > maxDate;
                              }
                              
                              const departureDateStart = new Date(departureDate);
                              departureDateStart.setHours(0, 0, 0, 0);
                              
                              return date < departureDateStart || date > maxDate;
                            }}
                            defaultMonth={field.value || form.watch("departureDate") || new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers - Updated for Amadeus API */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Passagers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Adults */}
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Adultes (12+ ans) *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Nombre d'adultes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {Array.from({length: 9}, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Adulte{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Children */}
                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Enfants (2-11 ans)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Nombre d'enfants" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {Array.from({length: 10}, (_, i) => i).map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Enfant{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Infants */}
                <FormField
                  control={form.control}
                  name="infants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Bébés (0-2 ans)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Nombre de bébés" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {Array.from({length: 10}, (_, i) => i).map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Bébé{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        Les bébés voyagent sur les genoux d'un adulte
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Travel Class and Flight Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="travelClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Classe de Voyage *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choisir une classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="ECONOMY">Économique</SelectItem>
                        <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                        <SelectItem value="FIRST">Première Classe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Non-Stop Preference */}
              <FormField
                control={form.control}
                name="nonStop"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-4 py-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Vols directs uniquement
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Rechercher seulement les vols sans escale
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Budget and Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Budget estimé (FCFA)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Votre budget approximatif" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="50000-200000">50,000 - 200,000 FCFA</SelectItem>
                        <SelectItem value="200000-400000">200,000 - 400,000 FCFA</SelectItem>
                        <SelectItem value="400000-600000">400,000 - 600,000 FCFA</SelectItem>
                        <SelectItem value="600000-800000">600,000 - 800,000 FCFA</SelectItem>
                        <SelectItem value="800000-1000000">800,000 - 1,000,000 FCFA</SelectItem>
                        <SelectItem value="1000000+">Plus de 1,000,000 FCFA</SelectItem>
                        <SelectItem value="flexible">Budget flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredAirline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Compagnie Préférée</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Aucune préférence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">Aucune préférence</SelectItem>
                        <SelectItem value="AF">Air France</SelectItem>
                        <SelectItem value="TK">Turkish Airlines</SelectItem>
                        <SelectItem value="EK">Emirates</SelectItem>
                        <SelectItem value="LH">Lufthansa</SelectItem>
                        <SelectItem value="BA">British Airways</SelectItem>
                        <SelectItem value="ET">Ethiopian Airlines</SelectItem>
                        <SelectItem value="QR">Qatar Airways</SelectItem>
                        <SelectItem value="AT">Royal Air Maroc</SelectItem>
                        <SelectItem value="QC">Camair-Co</SelectItem>
                        <SelectItem value="KL">KLM</SelectItem>
                        <SelectItem value="SN">Brussels Airlines</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Currency and Max Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem className="flex-1 w-ful">
                    <FormLabel className="text-sm font-medium">Devise Préférée</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choisir une devise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dollar US (USD)</SelectItem>
                        <SelectItem value="GBP">Livre Sterling (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Prix Maximum (par personne)</FormLabel>
                    <FormControl className="w-full">
                      <Input 
                        type="number"
                        placeholder="Ex: 500000 (optionnel)" 
                        className="h-10"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Prix limite par voyageur dans la devise sélectionnée
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Informations Supplémentaires</FormLabel>
                  <FormControl className="w-full">
                    <Textarea 
                      placeholder="Exigences particulières, restrictions alimentaires, assistance spéciale..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  console.log('Submit button clicked!');
                  console.log('Current form values:', form.getValues());
                  console.log('Form errors:', form.formState.errors);
                }}
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer ma Demande de Devis'
                )}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </div>
    </div>
  );
}