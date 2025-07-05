'use client';

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    departureCity: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: '',
    travelClass: 'economy',
    preferredAirline: '',
    budget: '',
    additionalInfo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Demande envoyée avec succès! Vous recevrez votre devis sous 24h.'
        });
        // Reset form
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          departureCity: '',
          destination: '',
          departureDate: '',
          returnDate: '',
          passengers: '',
          travelClass: 'economy',
          preferredAirline: '',
          budget: '',
          additionalInfo: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion. Veuillez vérifier votre connexion internet.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();
    tl.fromTo(navRef.current, 
      { y: -100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(heroRef.current?.querySelector('h1'), 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
      "-=0.5"
    )
    .fromTo(heroRef.current?.querySelector('p'), 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 
      "-=0.3"
    )
    .fromTo(heroRef.current?.querySelectorAll('button'), 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power3.out" }, 
      "-=0.2"
    );

    // Services animation on scroll
    gsap.fromTo(servicesRef.current?.querySelectorAll('.service-card'), 
      { y: 80, opacity: 0, scale: 0.8 }, 
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Destinations cards animation
    gsap.fromTo(destinationsRef.current?.querySelectorAll('.destination-card'), 
      { y: 100, opacity: 0, rotationY: -15 }, 
      { 
        y: 0, 
        opacity: 1, 
        rotationY: 0, 
        duration: 1, 
        stagger: 0.15, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: destinationsRef.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Stats counter animation
    gsap.fromTo(statsRef.current?.querySelectorAll('.stat-number'), 
      { innerText: 0, opacity: 0 }, 
      { 
        innerText: (i, el) => el.getAttribute('data-count'),
        opacity: 1,
        duration: 2, 
        ease: "power2.out",
        snap: { innerText: 1 },
        stagger: 0.2,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Testimonials animation
    gsap.fromTo(testimonialsRef.current?.querySelectorAll('.testimonial-card'), 
      { x: -50, opacity: 0, rotation: -5 }, 
      { 
        x: 0, 
        opacity: 1, 
        rotation: 0, 
        duration: 0.8, 
        stagger: 0.3, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Floating animation for background elements
    gsap.to(".floating-element", {
      y: -20,
      duration: 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });

    // Parallax effect for destination section background
    gsap.to(destinationsRef.current?.querySelector('.bg-decoration'), {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: destinationsRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-primary-50">
      {/* Navigation */}
      <nav ref={navRef} className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-700">Revolution Travel Services</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#accueil" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Accueil</a>
                <a href="#services" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Services</a>
                <a href="#destinations" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Destinations</a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div ref={heroRef} className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Votre Rêve de Voyage
              <span className="text-primary-600 block">Commence Ici</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Spécialistes en recherche et réservation de billets d'avion. Soumettez votre demande de voyage et recevez les meilleurs tarifs personnalisés sous 24h.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary" onClick={() => document.getElementById('quote-form')?.scrollIntoView({behavior: 'smooth'})}>
                Demander un Devis
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}>
                Nos Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Request Form */}
      <section id="quote-form" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Demande de Devis Personnalisé</h2>
            <p className="text-xl text-gray-600">
              Remplissez le formulaire ci-dessous et recevez votre devis sous 24h
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-sky-50 rounded-2xl p-8 shadow-2xl">
            {/* Status Messages */}
            {submitStatus.message && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">
                    {submitStatus.type === 'success' ? '✅' : '❌'}
                  </span>
                  {submitStatus.message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Nom Complet *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom complet" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Téléphone *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre numéro de téléphone" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="votre.email@exemple.com" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                />
              </div>

              {/* Trip Details */}
              <div className="border-t pt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Détails du Voyage</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Ville de Départ *</label>
                    <input 
                      type="text" 
                      name="departureCity"
                      value={formData.departureCity}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Douala, Yaoundé..." 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Destination *</label>
                    <input 
                      type="text" 
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Paris, New York..." 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Date de Départ *</label>
                    <input 
                      type="date" 
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Date de Retour</label>
                    <input 
                      type="date" 
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                    />
                    <p className="text-sm text-gray-500 mt-1">Laissez vide pour un aller simple</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Nombre de Passagers *</label>
                    <select 
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 Passager</option>
                      <option value="2">2 Passagers</option>
                      <option value="3">3 Passagers</option>
                      <option value="4">4 Passagers</option>
                      <option value="5">5 Passagers</option>
                      <option value="6+">6+ Passagers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Classe de Voyage</label>
                    <select 
                      name="travelClass"
                      value={formData.travelClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="economy">Économique</option>
                      <option value="premium">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">Première Classe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Compagnie Aérienne Préférée (Optionnel)</label>
                    <select 
                      name="preferredAirline"
                      value={formData.preferredAirline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Aucune préférence</option>
                      <option value="air-france">Air France</option>
                      <option value="turkish">Turkish Airlines</option>
                      <option value="emirates">Emirates</option>
                      <option value="lufthansa">Lufthansa</option>
                      <option value="british">British Airways</option>
                      <option value="ethiopian">Ethiopian Airlines</option>
                      <option value="qatar">Qatar Airways</option>
                      <option value="royal-air-maroc">Royal Air Maroc</option>
                      <option value="camair">Camair-Co</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Budget Approximatif (FCFA)</label>
                  <select 
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner votre budget</option>
                    <option value="200000-400000">200,000 - 400,000 FCFA</option>
                    <option value="400000-600000">400,000 - 600,000 FCFA</option>
                    <option value="600000-800000">600,000 - 800,000 FCFA</option>
                    <option value="800000-1000000">800,000 - 1,000,000 FCFA</option>
                    <option value="1000000+">Plus de 1,000,000 FCFA</option>
                  </select>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Informations Supplémentaires</label>
                  <textarea 
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Mentionnez toute exigence particulière, restrictions alimentaires, assistance spéciale, etc."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-12 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 text-white hover:bg-primary-700 transform hover:-translate-y-1'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer la Demande de Devis'
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-4">
                  🕒 Vous recevrez votre devis personnalisé sous 24h par email ou téléphone
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-sky-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment Ça Marche ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent pour obtenir les meilleurs tarifs aériens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Soumettez Votre Demande</h3>
              <p className="text-gray-600">
                Remplissez notre formulaire avec vos détails de voyage et préférences
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nous Recherchons</h3>
              <p className="text-gray-600">
                Notre équipe compare les tarifs de toutes les compagnies aériennes
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Vous Recevez le Devis</h3>
              <p className="text-gray-600">
                Nous vous contactons sous 24h avec les meilleures options et prix
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Réservation Confirmée</h3>
              <p className="text-gray-600">
                Une fois votre choix fait, nous procédons à la réservation sécurisée
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg inline-block">
              <h3 className="text-2xl font-bold text-primary-600 mb-2">⏱️ Délai de Réponse</h3>
              <p className="text-gray-600 text-lg">Maximum 24 heures pour recevoir votre devis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de services pour faire de votre voyage une expérience inoubliable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recherche de Billets</h3>
              <p className="text-gray-600 mb-6">
                Nous recherchons les meilleurs tarifs auprès de toutes les compagnies aériennes pour vous offrir les prix les plus compétitifs.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Recherche multi-compagnies
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Meilleurs prix garantis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Devis sous 24h
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conseil Personnalisé</h3>
              <p className="text-gray-600 mb-6">
                Nos experts vous accompagnent pour choisir la meilleure option selon vos besoins et votre budget.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Conseillers expérimentés
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Service 24/7
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi personnalisé
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="service-card bg-white rounded-xl p-8 shadow-lg card-hover">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Suivi de Demande</h3>
              <p className="text-gray-600 mb-6">
                Nous vous tenons informés à chaque étape de votre demande et vous accompagnons jusqu'à la réservation finale.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi personnalisé
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Réservation sécurisée
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Documentation complète
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section ref={destinationsRef} id="destinations" className="section-padding bg-gradient-to-br from-gray-900 via-primary-900 to-sky-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="bg-decoration absolute inset-0 opacity-10">
          <div className="floating-element absolute top-10 left-10 text-6xl">✈️</div>
          <div className="floating-element absolute top-32 right-20 text-4xl">🌍</div>
          <div className="floating-element absolute bottom-20 left-1/4 text-5xl">🏛️</div>
          <div className="floating-element absolute bottom-10 right-10 text-3xl">🗽</div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Destinations <span className="text-orange-400">Populaires</span>
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Découvrez nos destinations les plus prisées avec des tarifs exceptionnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                city: "Paris", 
                country: "France", 
                price: "À partir de 350,000 FCFA", 
                image: "🗼",
                gradient: "from-purple-500 to-pink-500",
                description: "Ville lumière et romance"
              },
              { 
                city: "New York", 
                country: "États-Unis", 
                price: "À partir de 450,000 FCFA", 
                image: "🗽",
                gradient: "from-blue-500 to-indigo-600",
                description: "La ville qui ne dort jamais"
              },
              { 
                city: "Dubai", 
                country: "Émirats Arabes Unis", 
                price: "À partir de 280,000 FCFA", 
                image: "🕌",
                gradient: "from-yellow-500 to-orange-500",
                description: "Luxe et modernité"
              },
              { 
                city: "Londres", 
                country: "Royaume-Uni", 
                price: "À partir de 320,000 FCFA", 
                image: "🏰",
                gradient: "from-green-500 to-teal-500",
                description: "Histoire et tradition"
              },
              { 
                city: "Istanbul", 
                country: "Turquie", 
                price: "À partir de 250,000 FCFA", 
                image: "🕌",
                gradient: "from-red-500 to-pink-500",
                description: "Pont entre deux continents"
              },
              { 
                city: "Casablanca", 
                country: "Maroc", 
                price: "À partir de 180,000 FCFA", 
                image: "🏛️",
                gradient: "from-amber-500 to-yellow-500",
                description: "Perle du Maghreb"
              },
            ].map((destination, index) => (
              <div 
                key={index} 
                className="destination-card group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-3 transition-all duration-500 hover:shadow-3xl"
              >
                {/* Image Section with Gradient */}
                <div className={`h-56 bg-gradient-to-br ${destination.gradient} relative flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                    {destination.image}
                  </div>
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-white text-xs font-semibold">Populaire</span>
                  </div>
                  {/* Animated border */}
                  <div className="absolute inset-0 border-2 border-white border-opacity-20 rounded-t-2xl group-hover:border-opacity-40 transition-all duration-300"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                        {destination.city}
                      </h3>
                      <p className="text-gray-600 font-medium">{destination.country}</p>
                    </div>
                    <div className="bg-primary-50 rounded-full p-2">
                      <span className="text-primary-600 text-sm">✈️</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 italic">{destination.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">{destination.price}</span>
                      <p className="text-xs text-gray-500">par personne</p>
                    </div>
                    <button 
                      className="bg-gradient-to-r from-primary-600 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-sky-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({behavior: 'smooth'})}
                    >
                      Demander Prix
                    </button>
                  </div>
                  
                  {/* Special offer badge */}
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    Offre Spéciale!
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to Action at bottom */}
          <div className="text-center mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-4">
                🌟 Plus de 50 destinations disponibles !
              </h3>
              <p className="text-gray-200 mb-6">
                Vous ne trouvez pas votre destination? Contactez-nous pour un devis personnalisé.
              </p>
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({behavior: 'smooth'})}
              >
                Voir Toutes les Destinations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-primary-600 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-bounce-slow">
              <div className="stat-number text-4xl font-bold mb-2" data-count="200">0</div>
              <div className="text-primary-100">Clients Satisfaits</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.2s'}}>
              <div className="stat-number text-4xl font-bold mb-2" data-count="50">0</div>
              <div className="text-primary-100">Destinations</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold mb-2">8/7</div>
              <div className="text-primary-100">Support Client</div>
            </div>
            <div className="animate-bounce-slow" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold mb-2">5★</div>
              <div className="text-primary-100">Note Moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce Que Disent Nos Clients</h2>
            <p className="text-xl text-gray-600">Témoignages authentiques de voyageurs satisfaits</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Chantal Ngozi",
                role: "Femme d'Affaires",
                content: "Service exceptionnel! L'équipe m'a trouvé un excellent tarif pour mon voyage d'affaires à Paris. Processus très professionnel.",
                rating: 5
              },
              {
                name: "Paul Mbarga",
                role: "Étudiant",
                content: "Parfait pour mon voyage d'études. Ils ont trouvé un vol abordable et m'ont aidé avec toute la documentation. Je recommande!",
                rating: 5
              },
              {
                name: "Grace Fotso",
                role: "Famille",
                content: "Excellent service pour organiser nos vacances familiales à Dubai. Prix compétitifs et service client très à l'écoute.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card bg-white rounded-xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-sky-600 section-padding">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à Partir à l'Aventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous dès aujourd'hui et commencez à planifier votre prochain voyage de rêve
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              onClick={() => document.getElementById('quote-form')?.scrollIntoView({behavior: 'smooth'})}
            >
              Demander un Devis
            </button>
            <a 
              href="tel:677916832"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 text-center"
            >
              Appelez-nous: 6 77 91 68 32
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Revolution Travel Services</h3>
              <p className="text-gray-300 mb-4">
                Votre partenaire de confiance pour tous vos voyages en avion.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <span className="text-sm font-bold">f</span>
                </a>
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#quote-form" className="hover:text-white transition-colors">Demande de Devis</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Recherche de Billets</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Conseil Voyage</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Suivi de Demande</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Destinations</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Europe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Amérique</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asie</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Afrique</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <span className="mr-3">📞</span>
                  <a href="tel:677916832" className="hover:text-white transition-colors">6 77 91 68 32</a>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">✉️</span>
                  <a href="mailto:p.revolutiontravel@yahoo.com" className="hover:text-white transition-colors">p.revolutiontravel@yahoo.com</a>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">📍</span>
                  <span>Cameroun</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Revolution Travel Services. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
