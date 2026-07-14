import type { Metadata } from 'next';
import CarsPageContent from './content';

export const metadata: Metadata = {
  title: 'Location de Voitures | Revolution Travel Cameroun',
  description: 'Location de voitures au Cameroun et en Afrique centrale. Véhicules récents, assurance incluse, tarifs transparents. Réservez en ligne.',
  openGraph: {
    title: 'Location de Voitures | Revolution Travel',
    description: 'Location de voitures au Cameroun et en Afrique centrale. Assurance incluse, tarifs transparents.',
    url: 'https://puantou-revolution-travel.vercel.app/services/cars',
  },
  alternates: {
    canonical: 'https://puantou-revolution-travel.vercel.app/services/cars',
  },
};

export default function CarsPage() {
  return <CarsPageContent />;
}
