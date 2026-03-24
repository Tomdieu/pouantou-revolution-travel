'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
} from '@/components/ui/credenza';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, X } from 'lucide-react';
import airports from '@/constants/airports.json';

interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: string;
  lon: string;
}

interface MobileLocationSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function MobileLocationSelector({
  value,
  onValueChange,
  placeholder = 'Sélectionner une ville',
  label,
  className = '',
}: MobileLocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const airportList: Airport[] = airports as Airport[];

  const filteredAirports = useMemo(() => {
    if (!searchTerm) {
      // Show first 50 airports, but always include the selected one if it exists
      const popular = airportList.slice(0, 50);
      const selectedAirport = value ? airportList.find(a => a.name === value) : null;
      
      if (selectedAirport && !popular.find(a => a.code === selectedAirport.code)) {
        return [selectedAirport, ...popular];
      }
      return popular;
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return airportList.filter(
      (airport) =>
        airport.name.toLowerCase().includes(lowerSearch) ||
        airport.code.toLowerCase().includes(lowerSearch) ||
        airport.city.toLowerCase().includes(lowerSearch) ||
        airport.country.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, value]);

  const selectedAirport = airportList.find((a) => a.name === value);
  
  // Fallback: if value looks like an airport code, find by code
  const fallbackAirport = !selectedAirport && value && value.length <= 5 
    ? airportList.find((a) => a.code === value.toUpperCase()) 
    : null;
  
  const displayAirport = selectedAirport || fallbackAirport;

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button
          variant="outline"
          className={`w-full h-12 justify-between font-semibold border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:border-blue-500 transition-all text-left ${className}`}
        >
          <span className={displayAirport ? 'text-gray-900 truncate' : 'text-gray-500'}>
            {displayAirport ? `${displayAirport.name} (${displayAirport.code})` : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="h-1/2 flex flex-col p-0">
        <CredenzaHeader className="border-b border-gray-200 px-4 py-4 flex-shrink-0">
          <CredenzaTitle className="text-lg font-bold">{label || 'Sélectionner une destination'}</CredenzaTitle>
        </CredenzaHeader>

        <CredenzaBody className="flex-1 overflow-hidden flex flex-col px-4 py-4">
          {/* Fixed Search Input */}
          <div className="flex-shrink-0 mb-4 relative">
            <Input
              placeholder="Rechercher un aéroport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border-gray-300 focus:ring-blue-500 pl-3 pr-8"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Scrollable Airports List */}
          <div className="flex-1 overflow-y-auto">
            {filteredAirports.length > 0 ? (
              <div className="space-y-1">
                {filteredAirports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => {
                      onValueChange(airport.name);
                      setOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                      displayAirport?.code === airport.code
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold">{airport.name}</div>
                    <div className={`text-sm ${displayAirport?.code === airport.code ? 'text-blue-100' : 'text-gray-500'}`}>
                      {airport.code} • {airport.city}, {airport.country}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Aucun aéroport trouvé</p>
              </div>
            )}
          </div>
        </CredenzaBody>

        <CredenzaFooter className="border-t border-gray-200 px-4 py-4 flex-shrink-0">
          <CredenzaClose asChild>
            <Button variant="outline" className="w-full h-10 rounded-lg">
              Fermer
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
