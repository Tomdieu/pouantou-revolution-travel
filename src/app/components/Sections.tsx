import { CheckCircle, Plane, Users } from 'lucide-react'
import React from 'react'

function ServiceSection({ ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <section {...props}>
      <div className="w-full mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Nos Services</h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Une gamme complète de services pour faire de votre voyage une expérience inoubliable : billets d'avion, réservations d'hôtels, location de voitures et accompagnement personnalisé
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {/* Service 1 */}
          <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Plane className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Recherche de Billets</h3>
            <p className="text-black mb-6">
              Nous recherchons les meilleurs tarifs auprès de toutes les compagnies aériennes pour vous offrir les prix les plus compétitifs.
            </p>
            <ul className="text-black space-y-2">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Recherche multi-compagnies
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Meilleurs prix garantis
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Devis sous 1h
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Réservation Hôtel</h3>
            <p className="text-black mb-6">
              Trouvez et réservez les meilleurs hébergements selon votre budget et vos préférences partout dans le monde.
            </p>
            <ul className="text-black space-y-2">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Hôtels de qualité
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Prix négociés
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Toutes catégories
              </li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Location de Voitures</h3>
            <p className="text-black mb-6">
              Louez des véhicules de qualité aux meilleurs tarifs pour vos déplacements en toute liberté et confort.
            </p>
            <ul className="text-black space-y-2">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Véhicules récents
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Tarifs compétitifs
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Assurance incluse
              </li>
            </ul>
          </div>

          {/* Service 4 */}
          <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Conseil Personnalisé</h3>
            <p className="text-black mb-6">
              Nos experts vous accompagnent pour choisir la meilleure option selon vos besoins et votre budget.
            </p>
            <ul className="text-black space-y-2">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Conseillers expérimentés
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Service 24/7
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Suivi personnalisé
              </li>
            </ul>
          </div>

          {/* Service 5 */}
          <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-4">Suivi de Demande</h3>
            <p className="text-black mb-6">
              Nous vous tenons informés à chaque étape de votre demande et vous accompagnons jusqu'à la réservation finale.
            </p>
            <ul className="text-black space-y-2">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Suivi personnalisé
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Réservation sécurisée
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                Documentation complète
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceSection