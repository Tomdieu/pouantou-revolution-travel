import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import QuoteRequestEmail from '@/emails/QuoteRequestEmail';
import ClientConfirmationEmail from '@/emails/ClientConfirmationEmail';
import { sendEmail } from '@/lib/emailService';

// Validate required environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD environment variables must be set');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const {
      fullName,
      phone,
      email,
      departureCity,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      adultsCount,
      childrenCount,
      infantsCount,
      passengersTotal,
      travelClass,
      preferredAirline,
      nonStop,
      budget,
      currencyCode,
      maxPrice,
      additionalInfo
    } = formData;

    // Try to get real-time flight prices from Amadeus
    let flightPrices = null;
    let priceSearchError = null;
    
    try {
      const amadeusSearchParams = {
        originLocationCode: departureCity, // This should be an airport code from CityCombobox
        destinationLocationCode: destination, // This should be an airport code from CityCombobox
        departureDate,
        returnDate,
        adults: adults || adultsCount || 1,
        children: children || childrenCount || 0,
        infants: infants || infantsCount || 0,
        travelClass,
        nonStop,
        currencyCode: currencyCode || 'XAF',
        maxPrice,
        max: 5 // Limit to top 5 results for email
      };

      console.log('Sending Amadeus search request with params:', amadeusSearchParams);

      const amadeusResponse = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://' + request.headers.get('host') : 'http://localhost:3000'}/api/amadeus/flight-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(amadeusSearchParams),
      });

      console.log('Amadeus response status:', amadeusResponse.status);

      if (amadeusResponse.ok) {
        const amadeusData = await amadeusResponse.json();
        console.log('Amadeus response data:', JSON.stringify(amadeusData, null, 2));
        
        if (amadeusData.success) {
          flightPrices = amadeusData.data;
          // Check if we got actual flight offers
          if (!flightPrices?.offers || flightPrices.offers.length === 0) {
            console.log('Amadeus API returned no flight offers for this route/date combination');
            priceSearchError = `Aucun vol trouvé pour la route ${departureCity} → ${destination} à la date demandée. Vérifier les codes d'aéroport ou la disponibilité de la route.`;
            flightPrices = null;
          } else {
            console.log(`Amadeus API returned ${flightPrices.offers.length} flight offers`);
          }
        } else {
          console.log('Amadeus API returned success=false:', amadeusData);
          priceSearchError = 'Amadeus API returned an error response';
        }
      } else {
        console.log('Amadeus API returned non-OK status:', amadeusResponse.status);
        priceSearchError = `Amadeus API error: ${amadeusResponse.status}`;
      }
    } catch (error) {
      console.log('Amadeus price search failed, continuing with email without prices:', error);
      priceSearchError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Render email templates using React Email
    const agencyEmailHtml = await render(QuoteRequestEmail({
      fullName,
      phone,
      email,
      departureCity,
      destination,
      departureDate,
      returnDate,
      adults: adults || adultsCount || 1,
      children: children || childrenCount || 0,
      infants: infants || infantsCount || 0,
      passengersTotal: passengersTotal || (adults + children + infants) || 1,
      travelClass,
      preferredAirline,
      nonStop,
      budget,
      currencyCode,
      maxPrice,
      additionalInfo,
      flightPrices, // Add real-time flight prices
      priceSearchError, // Include any errors for context
    }));

    // Send email to the agency
    try {
      const result = await sendEmail({
        to: ['ivan.tomdieu@gmail.com','p.revolutiontravel@yahoo.com','tsilieuj@gmail.com'], // Your email
        // to: ['p.revolutiontravel@yahoo.com'], // Your aunt's email
        subject: `Nouvelle demande de devis voyage - ${fullName} vers ${destination}`,
        html: agencyEmailHtml,
        text: `Nouvelle demande de devis voyage de ${fullName}

Client: ${fullName}
Email: ${email}
Téléphone: ${phone}
Destination: ${destination}
Départ: ${departureCity}
Date de départ: ${departureDate}
${returnDate ? `Date de retour: ${returnDate}` : 'Vol aller simple'}
Adultes: ${adults || adultsCount}
Enfants: ${children || childrenCount} 
Bébés: ${infants || infantsCount}
Total passagers: ${passengersTotal || (adults + children + infants)}
Classe: ${travelClass}
${preferredAirline && preferredAirline !== 'none' ? `Compagnie préférée: ${preferredAirline}` : ''}
${nonStop ? 'Vols directs uniquement: Oui' : ''}
${budget ? `Budget: ${budget}` : ''}
${currencyCode ? `Devise: ${currencyCode}` : ''}
${maxPrice ? `Prix maximum: ${maxPrice}` : ''}
${additionalInfo ? `Informations supplémentaires: ${additionalInfo}` : ''}

${flightPrices && flightPrices.offers && flightPrices.offers.length > 0 
  ? `=== PRIX EN TEMPS RÉEL AMADEUS ===
${flightPrices.offers.slice(0, 3).map((offer: any, index: number) => 
`${index + 1}. ${offer.price.formattedTotal} - ${offer.isNonStop ? 'Direct' : `${offer.stops} escale(s)`} - Durée: ${offer.duration || 'N/A'}`
).join('\n')}

⚠️ Ces prix sont indicatifs et peuvent changer. Contactez rapidement le client pour finaliser la réservation.
==========================================` 
  : priceSearchError 
    ? `⚠️ RECHERCHE AMADEUS ÉCHOUÉE: ${priceSearchError}
Veuillez effectuer une recherche manuelle pour ce client.` 
    : '⚠️ Aucune donnée de prix automatique disponible. Recherche manuelle requise.'
}

Revolution Travel Services - Cameroun
Merci de contacter le client sous 1h.`,
        replyTo: email, // Client's email for easy reply
      });

      console.log('Agency email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Error sending agency email:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email à l\'agence' },
        { status: 500 }
      );
    }

    // Send confirmation email to the client
    const clientConfirmationHtml = await render(ClientConfirmationEmail({
      fullName,
      destination,
      departureCity,
      departureDate,
      returnDate,
      adults: adults || adultsCount || 1,
      children: children || childrenCount || 0,
      infants: infants || infantsCount || 0,
      passengersTotal: passengersTotal || (adults + children + infants) || 1,
    }));

    // Send confirmation to client
    try {
      await sendEmail({
        to: [email],
        subject: 'Confirmation de votre demande de devis - Revolution Travel Services',
        html: clientConfirmationHtml,
        text: `Bonjour ${fullName},

Nous avons bien reçu votre demande de devis pour votre voyage vers ${destination}.

Résumé de votre demande:
- Destination: ${destination}
- Départ: ${departureCity}
- Date de départ: ${departureDate}
${returnDate ? `- Date de retour: ${returnDate}` : '- Type: Aller Simple'}
- Adultes: ${adults || adultsCount}
- Enfants: ${children || childrenCount}
- Bébés: ${infants || infantsCount}
- Total passagers: ${passengersTotal || (adults + children + infants)}

Notre équipe va rechercher les meilleures offres et vous contactera sous 24 heures.

Revolution Travel Services
Cameroun
Téléphone: +237 677 916 832
Email: p.revolutiontravel@yahoo.com

Merci de votre confiance.`,
      });

      console.log('Client confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending client confirmation email:', error);
      // Don't fail the whole request if client confirmation fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demande envoyée avec succès'
    });

  } catch (error) {
    console.error('Error in send-quote API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
