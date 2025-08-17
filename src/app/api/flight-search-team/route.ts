import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface FlightSearchTeamRequest {
  searchData: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
  };
  selectedOffer: {
    id: string;
    price: {
      total: number;
      currency: string;
      displayTotal: string;
    };
    departure: {
      airport: string;
      time: string;
    };
    arrival: {
      airport: string;
      time: string;
    };
    airline: string;
    duration?: string;
    stops: number;
    rawOffer?: any;
  };
  contactInfo: {
    email?: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const {
      searchData,
      selectedOffer,
      contactInfo
    }: FlightSearchTeamRequest = await request.json();

    // Validate required fields
    if (!contactInfo.email && !contactInfo.phone) {
      return NextResponse.json({
        success: false,
        error: 'Au moins un email ou téléphone est requis'
      }, { status: 400 });
    }

    if (!selectedOffer || !searchData) {
      return NextResponse.json({
        success: false,
        error: 'Données de vol ou de recherche manquantes'
      }, { status: 400 });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Prepare email content
    const emailContent = `
      NOUVELLE DEMANDE DE RÉSERVATION DE VOL
      =====================================
      
      INFORMATIONS CLIENT:
      - Email: ${contactInfo.email || 'Non fourni'}
      - Téléphone: ${contactInfo.phone || 'Non fourni'}
      
      DÉTAILS DE RECHERCHE:
      - Départ: ${searchData.originLocationCode}
      - Destination: ${searchData.destinationLocationCode}
      - Date de départ: ${searchData.departureDate}
      - Date de retour: ${searchData.returnDate || 'Aller simple'}
      - Adultes: ${searchData.adults}
      - Enfants: ${searchData.children || 0}
      - Bébés: ${searchData.infants || 0}
      - Classe: ${searchData.travelClass || 'ECONOMY'}
      - Vols directs seulement: ${searchData.nonStop ? 'Oui' : 'Non'}
      
      VOL SÉLECTIONNÉ:
      - ID Amadeus: ${selectedOffer.id}
      - Prix affiché au client: ${selectedOffer.price.displayTotal}
      - Prix réel API: ${selectedOffer.price.total} ${selectedOffer.price.currency}
      - Compagnie: ${selectedOffer.airline}
      - Durée: ${selectedOffer.duration || 'N/A'}
      - Escales: ${selectedOffer.stops === 0 ? 'Direct' : `${selectedOffer.stops} escale(s)`}
      - Départ: ${selectedOffer.departure.airport} le ${selectedOffer.departure.time}
      - Arrivée: ${selectedOffer.arrival.airport} le ${selectedOffer.arrival.time}
      
      DONNÉES COMPLÈTES AMADEUS:
      ${selectedOffer.rawOffer ? JSON.stringify(selectedOffer.rawOffer, null, 2) : 'Non disponible'}
      
      =====================================
      Email généré automatiquement le ${new Date().toLocaleString('fr-FR')}
    `;

    // Send email to team
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@pouantou-revolution-travel.com',
      to: process.env.TEAM_EMAIL || 'team@pouantou-revolution-travel.com',
      subject: `🛫 Nouvelle demande de vol - ${searchData.originLocationCode} → ${searchData.destinationLocationCode}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    });

    // Send confirmation email to client if email provided
    if (contactInfo.email) {
      const clientEmailContent = `
        Bonjour,
        
        Nous avons bien reçu votre demande de réservation de vol.
        
        Détails de votre recherche:
        - Trajet: ${searchData.originLocationCode} → ${searchData.destinationLocationCode}
        - Date de départ: ${searchData.departureDate}
        - Prix: ${selectedOffer.price.displayTotal}
        
        Notre équipe vous contactera dans les plus brefs délais pour finaliser votre réservation.
        
        Merci de votre confiance,
        L'équipe Pouantou Revolution Travel
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@pouantou-revolution-travel.com',
        to: contactInfo.email,
        subject: 'Confirmation de votre demande de vol - Pouantou Revolution Travel',
        text: clientEmailContent,
        html: clientEmailContent.replace(/\n/g, '<br>'),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès à notre équipe'
    });

  } catch (error) {
    console.error('Error sending flight search to team:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi de la demande'
    }, { status: 500 });
  }
}
