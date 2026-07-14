import type { Metadata } from 'next';
import HotelsPageContent from './content';

export const metadata: Metadata = {
  title: 'Réservation Hôtel | Revolution Travel Cameroun',
  description: 'Réservez les meilleurs hôtels au Cameroun et dans le monde. Tarifs préférentiels, annulation gratuite. Comparez et réservez en ligne.',
  openGraph: {
    title: 'Réservation Hôtel | Revolution Travel',
    description: 'Réservez les meilleurs hôtels au Cameroun et dans le monde. Tarifs préférentiels garantis.',
    url: 'https://puantou-revolution-travel.vercel.app/services/hotels',
  },
  alternates: {
    canonical: 'https://puantou-revolution-travel.vercel.app/services/hotels',
  },
};

export default function HotelsPage() {
  return <HotelsPageContent />;
}
