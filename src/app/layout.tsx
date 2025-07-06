import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Revolution Travel & Services - Agence de Voyage Cameroun | Billets d'Avion",
  description: "Agence de voyage professionnelle au Cameroun. Réservation de billets d'avion vers toutes destinations. Devis gratuit sous 1h. Service 7j/7. Meilleurs tarifs garantis.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo-image.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo-image.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-image.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Revolution Travel",
    startupImage: [
      {
        url: '/logo-image.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
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
    "réservation billet avion",
    "TOMDIEU TCHADIEUKO IVAN GOTTFRIED",
    "Tomdieu Ivan",
    "Ivan Tomdieu",
    "Tchadieuko Ivan",
    "Ivan Gottfried",
    "Tomdieu Tchadieuko",
    "Ivan Tchadieuko",
    "Gottfried Ivan",
    "développeur web cameroun",
    "developer cameroon",
    "web developer douala",
    "next.js developer"
  ],
  authors: [
    { name: "Revolution Travel & Services" },
    { name: "Tomdieu Ivan", url: "https://github.com/Tomdieu" },
    { name: "TOMDIEU TCHADIEUKO IVAN GOTTFRIED", url: "https://github.com/Tomdieu" }
  ],
  creator: "Tomdieu Ivan (TOMDIEU TCHADIEUKO IVAN GOTTFRIED)",
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
    url: 'https://puantou-revolution-travel.vercel.app',
    title: 'Revolution Travel & Services - Votre Agence de Voyage au Cameroun',
    description: 'Spécialistes en réservation de billets d\'avion depuis le Cameroun. Obtenez votre devis gratuit sous 1h. Service professionnel 7j/7.',
    siteName: 'Revolution Travel & Services',
    images: [
      {
        url: 'https://puantou-revolution-travel.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Revolution Travel & Services - Agence de Voyage Cameroun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revolution Travel & Services - Agence de Voyage Cameroun',
    description: 'Réservation de billets d\'avion depuis le Cameroun. Devis gratuit sous 1h.',
    images: ['https://puantou-revolution-travel.vercel.app/twitter-image.jpg'],
  },
  verification: {
    google: 'oL_X940seqpUmflSfAjNxmf39DH707nkgHr__ALLx7c',
  },
  alternates: {
    canonical: 'https://puantou-revolution-travel.vercel.app',
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
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Revolution Travel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Revolution Travel" />
        <meta name="description" content="Agence de voyage professionnelle au Cameroun" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Developer & SEO Meta Tags */}
        <meta name="developer" content="TOMDIEU TCHADIEUKO IVAN GOTTFRIED" />
        <meta name="author" content="Tomdieu Ivan, Revolution Travel Services" />
        <meta name="designer" content="Tomdieu Ivan" />
        <meta name="programmer" content="TOMDIEU TCHADIEUKO IVAN GOTTFRIED" />
        <meta name="web-developer" content="Ivan Tomdieu" />
        <meta name="creator" content="Tomdieu Tchadieuko Ivan Gottfried" />
        
        {/* Additional SEO */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="French" />
        <meta name="geo.region" content="CM" />
        <meta name="geo.country" content="Cameroon" />
        <meta name="geo.placename" content="Douala, Yaoundé" />
        
        {/* Viewport for PWA */}
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logo-image.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo-image.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-image.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo-image.png" />
        
        {/* Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/logo-image.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/logo-image.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/logo-image.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
