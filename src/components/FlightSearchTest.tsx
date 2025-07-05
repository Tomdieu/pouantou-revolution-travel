'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FlightOffer {
  id: string;
  price: {
    total: number;
    currency: string;
    formattedTotal: string;
  };
  duration?: string;
  stops: number;
  isNonStop: boolean;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  airline: string;
  bookableSeats: number;
  instantTicketing: boolean;
  lastTicketingDate?: string;
}

export default function FlightSearchTest() {
  const [searchParams, setSearchParams] = useState({
    originLocationCode: 'DLA',
    destinationLocationCode: 'PAR',
    departureDate: '2025-08-15',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'ECONOMY',
    nonStop: false,
    currencyCode: 'EUR',
  });

  const [results, setResults] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/amadeus/flight-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.offers);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Amadeus Flight Search</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Origin</label>
            <Input
              value={searchParams.originLocationCode}
              onChange={(e) => setSearchParams(prev => ({ ...prev, originLocationCode: e.target.value }))}
              placeholder="e.g., DLA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <Input
              value={searchParams.destinationLocationCode}
              onChange={(e) => setSearchParams(prev => ({ ...prev, destinationLocationCode: e.target.value }))}
              placeholder="e.g., PAR"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Departure Date</label>
            <Input
              type="date"
              value={searchParams.departureDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Adults</label>
            <Select 
              value={searchParams.adults.toString()} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, adults: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Children</label>
            <Select 
              value={searchParams.children.toString()} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, children: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5,6,7,8,9].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Travel Class</label>
            <Select 
              value={searchParams.travelClass} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, travelClass: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMY">Economy</SelectItem>
                <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="FIRST">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Select 
              value={searchParams.currencyCode} 
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, currencyCode: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="XAF">XAF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full">
          {loading ? 'Searching...' : 'Search Flights'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Search Results ({results.length} offers)</h2>
          </div>
          
          <div className="divide-y">
            {results.map((offer) => (
              <div key={offer.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-lg">{offer.price.formattedTotal}</p>
                    <p className="text-sm text-gray-600">
                      {offer.departure.airport} → {offer.arrival.airport}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Airline: {offer.airline}</p>
                    <p className="text-sm text-gray-600">
                      {offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <p>Duration: {offer.duration || 'N/A'}</p>
                  <p>Available seats: {offer.bookableSeats}</p>
                  <p>Instant ticketing: {offer.instantTicketing ? 'Yes' : 'No'}</p>
                </div>
                
                {offer.lastTicketingDate && (
                  <p className="text-xs text-orange-600 mt-2">
                    Book by: {new Date(offer.lastTicketingDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
