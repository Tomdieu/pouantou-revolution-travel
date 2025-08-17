import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/emailService';
import FlightSearchRequestEmail from '@/emails/FlightSearchRequestEmail';

export async function POST(request: NextRequest) {
  try {
    const searchData = await request.json();

    // Render email template
    const emailHtml = await render(FlightSearchRequestEmail({
      ...searchData,
    }));

    // Prepare plain text version
    const textContent = `
      NOUVELLE RECHERCHE DE VOL
      
      Détails de la recherche:
      - Départ: ${searchData.originLocationCode}
      - Destination: ${searchData.destinationLocationCode}
      - Date de départ: ${searchData.departureDate}
      ${searchData.returnDate ? `- Date de retour: ${searchData.returnDate}` : ''}
      - Passagers: ${searchData.adults} adulte(s)${searchData.children ? `, ${searchData.children} enfant(s)` : ''}${searchData.infants ? `, ${searchData.infants} bébé(s)` : ''}
      - Classe: ${searchData.travelClass}
      - Vol direct uniquement: ${searchData.nonStop ? 'Oui' : 'Non'}
      - Contact: ${searchData.email ? `Email: ${searchData.email}` : ''} ${searchData.phone ? `Tél: ${searchData.phone}` : ''}
      
      ${searchData.searchError 
        ? `⚠️ ERREUR DE RECHERCHE: ${searchData.searchError}

        Action requise: Contactez le client pour une recherche manuelle.`
        : searchData.selectedFlight
          ? `✅ VOL SÉLECTIONNÉ:
          
          Prix: ${searchData.selectedFlight.price.displayTotal}
          Route: ${searchData.selectedFlight.departure.airport} → ${searchData.selectedFlight.arrival.airport}
          Compagnie: ${searchData.selectedFlight.airline}
          Escales: ${searchData.selectedFlight.stops === 0 ? 'Vol direct' : `${searchData.selectedFlight.stops} escale(s)`}
          Durée: ${searchData.selectedFlight.duration || 'N/A'}
          Places disponibles: ${searchData.selectedFlight.bookableSeats}
          Réservation instantanée: ${searchData.selectedFlight.instantTicketing ? 'Oui' : 'Non'}
          ${searchData.selectedFlight.lastTicketingDate ? `À réserver avant le: ${new Date(searchData.selectedFlight.lastTicketingDate).toLocaleDateString()}` : ''}`
          : '❌ Aucun vol trouvé pour ces critères.'
      }
      
      Revolution Travel Services
      Cameroun
      Téléphone: +237 677 916 832
      Email: p.revolutiontravel@yahoo.com
    `;

    // Send email
    await sendEmail({
      to: ['ivan.tomdieu@gmail.com', 'p.revolutiontravel@yahoo.com', 'tsilieuj@gmail.com'],
      subject: `✈️ Nouvelle recherche de vol - ${searchData.originLocationCode} → ${searchData.destinationLocationCode}`,
      html: emailHtml,
      text: textContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès'
    });

  } catch (error) {
    console.error('Error in flight-search-request API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}
