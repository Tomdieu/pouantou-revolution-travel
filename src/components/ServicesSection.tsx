'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Building, Car } from 'lucide-react';
import FlightSearchForm from '@/components/FlightSearchForm';
import HotelSearchForm from '@/components/HotelSearchForm';
import CarRentalForm from '@/components/CarRentalForm';

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('flights');

  return (
    <section id="services-forms" className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            Recherchez et Réservez Vos Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utilisez nos outils de recherche pour trouver les meilleures offres de vols, hôtels et locations de voitures
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Recherche de Vols
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Recherche d'Hôtels
            </TabsTrigger>
            <TabsTrigger value="cars" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Location de Voitures
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  ✈️ Recherche de Vols Rapide
                </CardTitle>
                <p className="text-blue-600">
                  Trouvez et comparez les meilleurs tarifs aériens en temps réel
                </p>
              </CardHeader>
              <CardContent>
                <FlightSearchForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700">
                  🏨 Recherche d'Hôtels
                </CardTitle>
                <p className="text-green-600">
                  Découvrez les meilleurs hôtels dans votre destination
                </p>
              </CardHeader>
              <CardContent>
                <HotelSearchForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cars" className="space-y-6">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-700">
                  🚗 Location de Voitures
                </CardTitle>
                <p className="text-orange-600">
                  Réservez la voiture parfaite pour votre voyage
                </p>
              </CardHeader>
              <CardContent>
                <CarRentalForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Prix Transparents</h3>
              <p className="text-sm text-gray-600">
                Tous nos prix incluent les taxes et frais. Aucune surprise à la réservation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Support 24/7</h3>
              <p className="text-sm text-gray-600">
                Notre équipe est disponible pour vous assister à tout moment.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Réservation Flexible</h3>
              <p className="text-sm text-gray-600">
                Modifications et annulations selon les conditions des prestataires.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
