import type { Metadata } from 'next';
import FlightsPageContent from './content';

export const metadata: Metadata = {
  title: 'Recherche de Billets d\'Avion | Revolution Travel Cameroun',
  description: 'Comparez les meilleurs tarifs aériens parmi 500+ compagnies. Réservation de billets d\'avion depuis le Cameroun vers toutes destinations. Devis gratuit.',
  openGraph: {
    title: 'Recherche de Billets d\'Avion | Revolution Travel',
    description: 'Comparez les meilleurs tarifs aériens parmi 500+ compagnies aériennes. Réservation depuis le Cameroun.',
    url: 'https://puantou-revolution-travel.vercel.app/services/flights',
  },
  alternates: {
    canonical: 'https://puantou-revolution-travel.vercel.app/services/flights',
  },
};

export default function FlightsPage() {
  return <FlightsPageContent />;
}
