import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Revolution Travel & Services - Agence de Voyage Cameroun | Billets d'Avion",
  description: "Agence de voyage professionnelle au Cameroun. Réservation de billets d'avion vers toutes destinations. Devis gratuit sous 24h. Service 7j/7. Meilleurs tarifs garantis.",
  keywords: [
    "agence voyage cameroun",
    "billet avion cameroun", 
    "voyage douala yaoundé",
    "réservation vol international",
    "devis voyage gratuit",
    "revolution travel services",
    "agence voyage douala",
    "agence voyage yaoundé",
    "vol pas cher cameroun",
    "réservation billet avion"
  ],
  authors: [{ name: "Revolution Travel & Services" }],
  creator: "Revolution Travel & Services",
  publisher: "Revolution Travel & Services",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    url: 'https://pouantou-revolution-travel.vercel.app',
    title: 'Revolution Travel & Services - Votre Agence de Voyage au Cameroun',
    description: 'Spécialistes en réservation de billets d\'avion depuis le Cameroun. Obtenez votre devis gratuit sous 24h. Service professionnel 7j/7.',
    siteName: 'Revolution Travel & Services',
    images: [
      {
        url: 'https://pouantou-revolution-travel.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Revolution Travel & Services - Agence de Voyage Cameroun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revolution Travel & Services - Agence de Voyage Cameroun',
    description: 'Réservation de billets d\'avion depuis le Cameroun. Devis gratuit sous 24h.',
    images: ['https://pouantou-revolution-travel.vercel.app/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://pouantou-revolution-travel.vercel.app',
  },
  category: 'Travel Agency',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
