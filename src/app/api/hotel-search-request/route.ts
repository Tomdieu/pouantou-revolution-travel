import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/emailService';
import HotelSearchRequestEmail from '@/emails/HotelSearchRequestEmail';

interface HotelSearchRequest {
  country: string;
  city: string;
  budget: number;
  phone: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  radius?: number;
  foundHotels?: Array<{
    id: string;
    name: string;
    address: string;
    rating?: number;
    distance?: {
      value: number;
      unit: string;
    };
    contact?: {
      phone?: string;
      email?: string;
    };
    amenities?: string[];
  }>;
  searchError?: string;
}

export async function POST(request: NextRequest) {
  try {
    const searchData: HotelSearchRequest = await request.json();

    // Render email template
    const emailHtml = await render(HotelSearchRequestEmail({
      ...searchData,
    }));

    // Prepare plain text version
    const textContent = `
      NOUVELLE RECHERCHE D'HÔTEL
      
      Détails de la recherche:
      - Pays: ${searchData.country}
      - Ville: ${searchData.city}
      - Budget par nuit: ${searchData.budget} EUR
      - Téléphone: ${searchData.phone}
      - Date d'arrivée: ${searchData.checkInDate || 'Non spécifiée'}
      - Date de départ: ${searchData.checkOutDate || 'Non spécifiée'}
      - Nombre d'adultes: ${searchData.adults || 'Non spécifié'}
      - Rayon de recherche: ${searchData.radius ? `${searchData.radius} km` : 'Non spécifié'}
      
      ${searchData.searchError 
        ? `⚠️ ERREUR DE RECHERCHE: ${searchData.searchError}

        Action requise: Contactez le client au ${searchData.phone} pour l'aider dans sa recherche.`
        : searchData.foundHotels && searchData.foundHotels.length > 0
          ? `✅ HÔTELS TROUVÉS (${searchData.foundHotels.length}):
          
          ${searchData.foundHotels.map(hotel => `
          - ${hotel.name}
            Adresse: ${hotel.address}
            ${hotel.rating ? `Note: ${hotel.rating}/5` : ''}
            ${hotel.distance ? `Distance: ${hotel.distance.value} ${hotel.distance.unit}` : ''}
          `).join('\n')}
          `
          : '❌ Aucun hôtel trouvé pour ces critères.'
      }
      
      Revolution Travel Services
      Cameroun
      Téléphone: +237 677 916 832
      Email: p.revolutiontravel@yahoo.com
    `;

    // Send email
    await sendEmail({
      to: ['ivan.tomdieu@gmail.com', 'p.revolutiontravel@yahoo.com', 'tsilieuj@gmail.com'],
      subject: `🏨 Nouvelle recherche d'hôtel - ${searchData.city}, ${searchData.country}`,
      html: emailHtml,
      text: textContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès'
    });

  } catch (error) {
    console.error('Error in hotel-search-request API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}
