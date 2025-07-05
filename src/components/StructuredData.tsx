import Script from 'next/script';

export function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Revolution Travel & Services",
    "alternateName": "Revolution Travel",
    "url": "https://www.revolutiontravel.cm",
    "logo": "https://www.revolutiontravel.cm/logo.png",
    "description": "Agence de voyage professionnelle basée au Cameroun, spécialisée dans la réservation de billets d'avion vers toutes les destinations internationales. Votre partenaire de confiance pour tous vos voyages.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CM",
      "addressRegion": "Cameroun"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+237-677-916-832",
      "email": "p.revolutiontravel@yahoo.com",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"]
    },
    "sameAs": [
      "https://www.facebook.com/p/Revolution-Travel-Services-100064125607997/"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Cameroon"
    },
    "priceRange": "$$",
    "currenciesAccepted": "XAF"
  };

  const servicesData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Services de Voyage Revolution Travel",
    "provider": {
      "@type": "TravelAgency",
      "name": "Revolution Travel & Services"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de Voyage",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Recherche de Billets d'Avion",
            "description": "Recherche des meilleurs tarifs auprès de toutes les compagnies aériennes"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Conseil Personnalisé",
            "description": "Accompagnement expert pour choisir la meilleure option voyage"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Assistance Réservation",
            "description": "Gestion complète de la procédure de réservation"
          }
        }
      ]
    }
  };

  const destinationsData = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": "Destinations Populaires Revolution Travel",
    "description": "Destinations les plus prisées avec des tarifs exceptionnels",
    "hasMap": {
      "@type": "Map",
      "name": "Destinations Revolution Travel"
    },
    "includesDestination": [
      {
        "@type": "TouristDestination",
        "name": "Paris, France",
        "description": "Ville lumière et romance",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "350000",
            "priceCurrency": "XAF",
            "description": "À partir de 350,000 FCFA par personne"
          }]
        }
      },
      {
        "@type": "TouristDestination",
        "name": "New York, États-Unis",
        "description": "La ville qui ne dort jamais",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "450000",
            "priceCurrency": "XAF",
            "description": "À partir de 450,000 FCFA par personne"
          }]
        }
      },
      {
        "@type": "TouristDestination",
        "name": "Dubai, Émirats Arabes Unis",
        "description": "Luxe et modernité",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "280000",
            "priceCurrency": "XAF",
            "description": "À partir de 280,000 FCFA par personne"
          }]
        }
      },
      {
        "@type": "TouristDestination",
        "name": "Londres, Royaume-Uni",
        "description": "Histoire et tradition",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "320000",
            "priceCurrency": "XAF",
            "description": "À partir de 320,000 FCFA par personne"
          }]
        }
      },
      {
        "@type": "TouristDestination",
        "name": "Istanbul, Turquie",
        "description": "Pont entre deux continents",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "250000",
            "priceCurrency": "XAF",
            "description": "À partir de 250,000 FCFA par personne"
          }]
        }
      },
      {
        "@type": "TouristDestination",
        "name": "Casablanca, Maroc",
        "description": "Perle du Maghreb",
        "touristType": "International",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "itemListElement": [{
            "@type": "Offer",
            "price": "180000",
            "priceCurrency": "XAF",
            "description": "À partir de 180,000 FCFA par personne"
          }]
        }
      }
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Revolution Travel & Services",
    "url": "https://www.revolutiontravel.cm",
    "description": "Agence de voyage professionnelle au Cameroun pour la réservation de billets d'avion",
    "publisher": {
      "@type": "Organization",
      "name": "Revolution Travel & Services"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.revolutiontravel.cm?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "fr-CM"
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://www.revolutiontravel.cm"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://www.revolutiontravel.cm#services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Destinations",
        "item": "https://www.revolutiontravel.cm#destinations"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contact",
        "item": "https://www.revolutiontravel.cm#contact"
      }
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Comment demander un devis de voyage ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vous pouvez demander un devis gratuit en remplissant notre formulaire en ligne. Nous vous répondons sous 24 heures avec les meilleures offres disponibles."
        }
      },
      {
        "@type": "Question",
        "name": "Quelles destinations proposez-vous ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nous proposons des billets d'avion vers toutes les destinations internationales, notamment Paris, New York, Dubai, Londres, Istanbul, et Casablanca. Nous recherchons les meilleurs tarifs pour toutes les destinations."
        }
      },
      {
        "@type": "Question",
        "name": "Combien coûte votre service ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nos services de recherche et de conseil sont gratuits. Vous ne payez que le prix du billet d'avion au tarif négocié."
        }
      },
      {
        "@type": "Question",
        "name": "Dans quel délai recevrai-je ma réponse ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nous nous engageons à vous répondre sous 24 heures maximum avec un devis détaillé et personnalisé."
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <Script
        id="services-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesData)
        }}
      />
      <Script
        id="destinations-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(destinationsData)
        }}
      />
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData)
        }}
      />
    </>
  );
}
