import { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, Plane, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'destination' | 'contact' | 'general';
  section: string;
  url: string;
  icon?: React.ReactNode;
}

interface SiteSearchProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export function SiteSearch({ onClose, isOpen = false }: SiteSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comprehensive search data for the site
  const searchData: SearchResult[] = [
    // Services
    {
      id: "search-tickets",
      title: "Recherche de Billets d'Avion",
      description: "Nous recherchons les meilleurs tarifs auprès de toutes les compagnies aériennes pour vous offrir les prix les plus compétitifs.",
      type: "service",
      section: "services",
      url: "#services",
      icon: <Plane className="w-4 h-4" />
    },
    {
      id: "quote-request",
      title: "Demande de Devis Gratuit",
      description: "Obtenez un devis personnalisé pour votre voyage en moins de 24 heures. Service gratuit et sans engagement.",
      type: "service",
      section: "quote-form",
      url: "#quote-form",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: "travel-advice",
      title: "Conseil Personnalisé",
      description: "Nos experts vous accompagnent pour choisir la meilleure option selon vos besoins et votre budget.",
      type: "service",
      section: "services",
      url: "#services",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: "booking-assistance",
      title: "Assistance Réservation",
      description: "Nous gérons toute la procédure de réservation pour vous assurer un voyage sans stress.",
      type: "service",
      section: "services",
      url: "#services",
      icon: <Plane className="w-4 h-4" />
    },

    // Destinations
    {
      id: "dest-paris",
      title: "Paris, France",
      description: "Ville lumière et romance. À partir de 350,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: "dest-newyork",
      title: "New York, États-Unis",
      description: "La ville qui ne dort jamais. À partir de 450,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: "dest-dubai",
      title: "Dubai, Émirats Arabes Unis",
      description: "Luxe et modernité. À partir de 280,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: "dest-london",
      title: "Londres, Royaume-Uni",
      description: "Histoire et tradition. À partir de 320,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: "dest-istanbul",
      title: "Istanbul, Turquie",
      description: "Pont entre deux continents. À partir de 250,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: "dest-casablanca",
      title: "Casablanca, Maroc",
      description: "Perle du Maghreb. À partir de 180,000 FCFA par personne.",
      type: "destination",
      section: "destinations",
      url: "#destinations",
      icon: <MapPin className="w-4 h-4" />
    },

    // Contact & Company
    {
      id: "contact-phone",
      title: "Numéro de Téléphone",
      description: "Appelez-nous au 6 77 91 68 32 pour toute assistance immédiate.",
      type: "contact",
      section: "contact",
      url: "#contact",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: "contact-email",
      title: "Adresse Email",
      description: "Envoyez-nous un email à p.revolutiontravel@yahoo.com",
      type: "contact",
      section: "contact",
      url: "#contact",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: "about-company",
      title: "À Propos de Revolution Travel",
      description: "Votre partenaire de confiance pour tous vos voyages en avion depuis le Cameroun.",
      type: "general",
      section: "accueil",
      url: "#accueil",
      icon: <Plane className="w-4 h-4" />
    },

    // General terms for SEO
    {
      id: "airline-tickets",
      title: "Billets d'Avion",
      description: "Réservation de billets d'avion au meilleur prix. Toutes destinations depuis le Cameroun.",
      type: "service",
      section: "quote-form",
      url: "#quote-form",
      icon: <Plane className="w-4 h-4" />
    },
    {
      id: "travel-agency",
      title: "Agence de Voyage",
      description: "Agence de voyage professionnelle basée au Cameroun. Services de qualité et tarifs compétitifs.",
      type: "general",
      section: "accueil",
      url: "#accueil",
      icon: <Users className="w-4 h-4" />
    },
    {
      id: "cameroon-travel",
      title: "Voyage depuis le Cameroun",
      description: "Spécialiste des voyages depuis le Cameroun vers toutes les destinations internationales.",
      type: "general",
      section: "accueil",
      url: "#accueil",
      icon: <MapPin className="w-4 h-4" />
    }
  ];

  // Search function
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filteredResults = searchData.filter(item => {
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.type.toLowerCase().includes(lowerQuery) ||
          item.section.toLowerCase().includes(lowerQuery)
        );
      });

      // Sort results by relevance (title matches first, then description)
      filteredResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(lowerQuery);
        const bTitle = b.title.toLowerCase().includes(lowerQuery);
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });

      setResults(filteredResults.slice(0, 8)); // Limit to 8 results
      setIsSearching(false);
    }, 300);
  };

  useEffect(() => {
    performSearch(query);
  }, [query,performSearch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (result: SearchResult) => {
    // Scroll to section
    const element = document.querySelector(result.url);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close search
    if (onClose) {
      onClose();
    }
    setQuery("");
    setResults([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'destination': return 'bg-green-100 text-green-800';
      case 'contact': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service': return 'Service';
      case 'destination': return 'Destination';
      case 'contact': return 'Contact';
      default: return 'Info';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Rechercher sur notre site..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Recherche en cours...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 mt-1 group-hover:text-primary-700">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 truncate">
                            {result.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun résultat trouvé</p>
              <p className="text-sm text-gray-400">
                Essayez avec d'autres mots-clés comme "billet", "paris", "devis", ou "contact"
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Commencez à taper pour rechercher</p>
              <p className="text-sm text-gray-400">
                Recherchez des destinations, services, informations de contact et plus encore
              </p>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Appuyez sur Échap pour fermer</span>
            <span>Entrée pour sélectionner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
