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

interface HotelSearchParams {
  cityCode: string;
  radius?: number;
  radiusUnit?: string;
  chainCodes?: string;
  amenities?: string;
  ratings?: string;
  hotelSource?: string;
}

interface AmadeusHotelResponse {
  data: Array<{
    type: string;
    subType: string;
    hotelId: string;
    chainCode?: string;
    dupeId: string;
    name: string;
    cityCode: string;
    geoCode: {
      latitude: number;
      longitude: number;
    };
    address: {
      lines?: string[];
      postalCode?: string;
      cityName?: string;
      countryCode?: string;
    };
    contact?: {
      phone?: string;
      fax?: string;
      email?: string;
      www?: string;
    };
    description?: {
      lang: string;
      text: string;
    };
    amenities?: string[];
    media?: Array<{
      uri: string;
      category: string;
    }>;
    rating?: string;
    hotelDistance?: {
      distance: number;
      distanceUnit: string;
    };
    lastUpdate: string;
  }>;
  meta: {
    count: number;
    links?: {
      self: string;
    };
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
    const searchParams: HotelSearchParams = await request.json();
    
    // Validate required parameters
    if (!searchParams.cityCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code de ville requis pour la recherche d\'hôtels' 
        },
        { status: 400 }
      );
    }

    console.log('Hotel search params:', searchParams);

    // Get Amadeus access token
    const accessToken = await getAmadeusAccessToken();

    // Build query parameters for Amadeus API
    const queryParams = new URLSearchParams({
      cityCode: searchParams.cityCode.toUpperCase(),
    });

    // Add optional parameters
    if (searchParams.radius) {
      queryParams.append('radius', searchParams.radius.toString());
    }
    
    if (searchParams.radiusUnit) {
      queryParams.append('radiusUnit', searchParams.radiusUnit);
    }
    
    if (searchParams.chainCodes) {
      queryParams.append('chainCodes', searchParams.chainCodes);
    }
    
    if (searchParams.amenities) {
      queryParams.append('amenities', searchParams.amenities);
    }
    
    if (searchParams.ratings) {
      queryParams.append('ratings', searchParams.ratings);
    }
    
    if (searchParams.hotelSource) {
      queryParams.append('hotelSource', searchParams.hotelSource);
    }

    // Make request to Amadeus Hotel List API
    const amadeusUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${queryParams}`;
    
    console.log('Amadeus Hotel API URL:', amadeusUrl);

    const amadeusResponse = await fetch(amadeusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!amadeusResponse.ok) {
      const errorText = await amadeusResponse.text();
      console.error('Amadeus Hotel API error:', {
        status: amadeusResponse.status,
        statusText: amadeusResponse.statusText,
        error: errorText
      });
      
      // Handle specific Amadeus errors
      if (amadeusResponse.status === 400) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Paramètres de recherche d\'hôtel invalides. Vérifiez le code de ville.' 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la recherche d\'hôtels. Veuillez réessayer.' 
        },
        { status: 500 }
      );
    }

    const hotelData: AmadeusHotelResponse = await amadeusResponse.json();

    // Transform the data for easier consumption
    const transformedHotels = hotelData.data.map(hotel => ({
      id: hotel.hotelId,
      name: hotel.name,
      chainCode: hotel.chainCode,
      cityCode: hotel.cityCode,
      location: {
        latitude: hotel.geoCode.latitude,
        longitude: hotel.geoCode.longitude,
      },
      address: {
        lines: hotel.address.lines || [],
        postalCode: hotel.address.postalCode,
        cityName: hotel.address.cityName,
        countryCode: hotel.address.countryCode,
      },
      contact: hotel.contact,
      description: hotel.description?.text,
      amenities: hotel.amenities || [],
      rating: hotel.rating,
      distance: hotel.hotelDistance ? {
        value: hotel.hotelDistance.distance,
        unit: hotel.hotelDistance.distanceUnit
      } : null,
      lastUpdate: hotel.lastUpdate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        hotels: transformedHotels,
        meta: {
          count: hotelData.meta.count,
          searchParams: {
            cityCode: searchParams.cityCode,
            radius: searchParams.radius,
            radiusUnit: searchParams.radiusUnit,
          },
        },
      },
    });

  } catch (error) {
    console.error('Error in Amadeus hotel search:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur de recherche d'hôtels: ${error.message}` 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur lors de la recherche d\'hôtels' 
      },
      { status: 500 }
    );
  }
}
