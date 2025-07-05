import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_KEY_SECRET) {
  throw new Error('AMADEUS_API_KEY and AMADEUS_API_KEY_SECRET environment variables must be set');
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate?: string;
  lastTicketingDateTime?: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees?: Array<{
      amount: string;
      type: string;
    }>;
    taxes?: Array<{
      amount: string;
      code: string;
    }>;
    grandTotal?: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
  }>;
}

interface AmadeusResponse {
  meta: {
    count: number;
    links?: {
      self: string;
    };
  };
  data: AmadeusFlightOffer[];
  dictionaries?: {
    locations: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

// Cache for access tokens (in production, use Redis or proper cache)
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAmadeusAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_KEY_SECRET!,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Amadeus token error:', errorText);
    throw new Error(`Failed to get Amadeus access token: ${tokenResponse.status}`);
  }

  const tokenData: AmadeusTokenResponse = await tokenResponse.json();
  
  // Cache the token (expires in seconds, so convert to milliseconds and subtract 5 minutes for safety)
  tokenCache = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in - 300) * 1000
  };

  return tokenData.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const searchParams: FlightSearchParams = await request.json();
    
    // Validate required parameters
    if (!searchParams.originLocationCode || !searchParams.destinationLocationCode || !searchParams.departureDate || !searchParams.adults) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paramètres requis manquants: ville de départ, destination, date de départ et nombre d\'adultes' 
        },
        { status: 400 }
      );
    }

    // Use the airport codes directly from the form (no conversion needed)
    const originCode = searchParams.originLocationCode.toUpperCase();
    const destinationCode = searchParams.destinationLocationCode.toUpperCase();

    console.log('Using airport codes:', { originCode, destinationCode });

    // Get Amadeus access token
    const accessToken = await getAmadeusAccessToken();

    // Build query parameters for Amadeus API
    const queryParams = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: searchParams.departureDate,
      adults: searchParams.adults.toString(),
    });

    // Add optional parameters
    if (searchParams.returnDate) {
      queryParams.append('returnDate', searchParams.returnDate);
    }
    
    if (searchParams.children && searchParams.children > 0) {
      queryParams.append('children', searchParams.children.toString());
    }
    
    if (searchParams.infants && searchParams.infants > 0) {
      queryParams.append('infants', searchParams.infants.toString());
    }
    
    if (searchParams.travelClass) {
      queryParams.append('travelClass', searchParams.travelClass);
    }
    
    if (searchParams.nonStop) {
      queryParams.append('nonStop', 'true');
    }
    
    if (searchParams.currencyCode) {
      queryParams.append('currencyCode', searchParams.currencyCode);
    }
    
    if (searchParams.maxPrice) {
      queryParams.append('maxPrice', searchParams.maxPrice.toString());
    }

    // Limit results to 10 for performance
    queryParams.append('max', (searchParams.max || 10).toString());

    // Make request to Amadeus Flight Offers Search API
    const amadeusUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`;
    
    console.log('Amadeus API URL:', amadeusUrl);

    const amadeusResponse = await fetch(amadeusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!amadeusResponse.ok) {
      const errorText = await amadeusResponse.text();
      console.error('Amadeus API error:', {
        status: amadeusResponse.status,
        statusText: amadeusResponse.statusText,
        error: errorText
      });
      
      // Handle specific Amadeus errors
      if (amadeusResponse.status === 400) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Paramètres de recherche invalides. Vérifiez les codes d\'aéroport et les dates.' 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la recherche de vols. Veuillez réessayer.' 
        },
        { status: 500 }
      );
    }

    const flightData: AmadeusResponse = await amadeusResponse.json();

    // Transform the data for easier consumption
    const transformedOffers = flightData.data.map(offer => ({
      id: offer.id,
      price: {
        total: parseFloat(offer.price.total),
        currency: offer.price.currency,
        formattedTotal: `${offer.price.total} ${offer.price.currency}`,
      },
      duration: offer.itineraries[0]?.duration,
      stops: offer.itineraries[0]?.segments.length - 1,
      isNonStop: (offer.itineraries[0]?.segments.length || 0) === 1,
      departure: {
        airport: offer.itineraries[0]?.segments[0]?.departure.iataCode,
        time: offer.itineraries[0]?.segments[0]?.departure.at,
      },
      arrival: {
        airport: offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]?.arrival.iataCode,
        time: offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]?.arrival.at,
      },
      airline: offer.validatingAirlineCodes[0],
      segments: offer.itineraries[0]?.segments.map(segment => ({
        departure: segment.departure,
        arrival: segment.arrival,
        airline: segment.carrierCode,
        flightNumber: `${segment.carrierCode}${segment.number}`,
        duration: segment.duration,
        aircraft: segment.aircraft.code,
      })),
      bookableSeats: offer.numberOfBookableSeats,
      instantTicketing: offer.instantTicketingRequired,
      lastTicketingDate: offer.lastTicketingDate,
    }));

    // Sort by price (cheapest first)
    transformedOffers.sort((a, b) => a.price.total - b.price.total);

    return NextResponse.json({
      success: true,
      data: {
        offers: transformedOffers,
        meta: {
          count: flightData.meta.count,
          searchParams: {
            origin: originCode,
            destination: destinationCode,
            departureDate: searchParams.departureDate,
            returnDate: searchParams.returnDate,
            passengers: {
              adults: searchParams.adults,
              children: searchParams.children || 0,
              infants: searchParams.infants || 0,
            },
            travelClass: searchParams.travelClass,
            nonStop: searchParams.nonStop,
          },
        },
        dictionaries: flightData.dictionaries,
      },
    });

  } catch (error) {
    console.error('Error in Amadeus flight search:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur de recherche: ${error.message}` 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur lors de la recherche de vols' 
      },
      { status: 500 }
    );
  }
}
