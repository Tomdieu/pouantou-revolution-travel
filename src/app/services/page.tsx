import Link from 'next/link';
import { Plane, Building, Car, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Services | Revolution Travel',
    description: 'Découvrez nos services de voyage : réservation de billets d\'avion, réservation d\'hôtels et location de voitures.',
};

const services = [
    {
        slug: 'flights',
        title: 'Recherche de Billets',
        description: 'Comparez les meilleurs tarifs aériens parmi plus de 500 compagnies. Obtenez des devis instantanés et réservez en toute confiance.',
        icon: Plane,
        features: [
            'Comparaison de plus de 500 compagnies aériennes',
            'Tarifs négociés et exclusifs',
            'Support pour les changements et annulations',
            'Vols directs et correspondances',
        ],
    },
    {
        slug: 'hotels',
        title: 'Réservation Hôtel',
        description: 'Dénichez le séjour parfait parmi une sélection d\'établissements premium dans le monde entier.',
        icon: Building,
        features: [
            'Sélection d\'hôtels vérifiés et notés',
            'Tarifs préférentiels garantis',
            'Réservation flexible avec annulation gratuite',
            'Chambres et suites pour tous les budgets',
        ],
    },
    {
        slug: 'cars',
        title: 'Location de Voitures',
        description: 'Large choix de véhicules récents pour vos déplacements en toute liberté, où que vous soyez.',
        icon: Car,
        features: [
            'Véhicules récents et entretenus',
            'Assurance complète incluse',
            'Récupération et retour faciles',
            'Options pour tous les types de trajets',
        ],
    },
];

export default function ServicesPage() {
    return (
        <div className="bg-slate-50">
            {/* Hero */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors mb-8">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Accueil
                    </Link>
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                            <span className="w-8 h-px bg-slate-300" />
                            Nos services
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                            Tout pour votre voyage
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            De la recherche de billets à la location de voitures,
                            Revolution Travel offre des solutions complètes pour chaque étape de votre déplacement.
                        </p>
                    </div>
                </div>
            </section>

            {/* Service Cards */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                                        <Icon className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                                        {service.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                                                <Check className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:gap-2.5 transition-all duration-200">
                                        En savoir plus
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-950">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                        Besoin d&apos;aide pour planifier?
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Nos experts sont disponibles pour vous accompagner dans le choix des meilleurs services.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/#quote-form"
                            className="h-12 px-8 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
                        >
                            Obtenir un devis
                        </Link>
                        <a
                            href="tel:677916832"
                            className="h-12 px-8 text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 inline-flex items-center justify-center"
                        >
                            Parler à un expert
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
