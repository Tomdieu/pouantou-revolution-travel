'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, Hotel, Car, ArrowLeft, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const quickLinks = [
  {
    label: 'Accueil',
    href: '/',
    icon: Home,
    description: 'Retour à la page d\'accueil',
  },
  {
    label: 'Billets d\'avion',
    href: '/services/flights',
    icon: Plane,
    description: 'Rechercher des vols',
  },
  {
    label: 'Hôtels',
    href: '/services/hotels',
    icon: Hotel,
    description: 'Réserver un hébergement',
  },
  {
    label: 'Location de voitures',
    href: '/services/cars',
    icon: Car,
    description: 'Louer un véhicule',
  },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          {/* Error Code */}
          <div className="mb-8">
            <span className="text-[8rem] sm:text-[10rem] font-bold text-slate-100 leading-none select-none">
              404
            </span>
          </div>

          {/* Message */}
          <div className="relative -mt-16 sm:-mt-20 mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Page introuvable
            </h1>
            <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              La page que vous recherchez n&apos;existe pas ou a été déplacée.
              Veuillez vérifier l&apos;URL ou revenir à l&apos;accueil.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors duration-200">
                  <link.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {link.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto h-11 rounded-lg border-slate-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors duration-200">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-10 text-xs text-slate-400">
            Besoin d&apos;aide ? Contactez-nous au{' '}
            <a
              href="tel:+237677916832"
              className="text-slate-500 hover:text-slate-700 font-medium transition-colors duration-200"
            >
              +237 677 916 832
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
