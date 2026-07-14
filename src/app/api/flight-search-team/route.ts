import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/emailService';
import FlightSearchRequestEmail from '@/emails/FlightSearchRequestEmail';
import FlightSearchClientConfirmationEmail from '@/emails/FlightSearchClientConfirmationEmail';
import { FlightSearchTeamRequest } from '@/types/flight-search';

export async function POST(request: NextRequest) {
  try {
    const requestData: FlightSearchTeamRequest = await request.json();
    const { searchData, selectedOffer, contactInfo } = requestData;

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

    // Send team notification email
    const teamEmailHtml = await render(FlightSearchRequestEmail({
      searchData,
      selectedOffer,
      contactInfo,
    }));

    await sendEmail({
      // to: ['ivan.tomdieu@gmail.com'],
      to: ['ivan.tomdieu@gmail.com', 'p.revolutiontravel@yahoo.com', 'tsilieuj@gmail.com'],
      subject: `🛫 Nouvelle demande de vol - ${searchData.originLocationCode} → ${searchData.destinationLocationCode}`,
      html: teamEmailHtml,
    });

    // Send client confirmation email
    if (contactInfo.email) {
      const clientEmailHtml = await render(FlightSearchClientConfirmationEmail({
        originLocationCode: searchData.originLocationCode,
        destinationLocationCode: searchData.destinationLocationCode,
        departureDate: searchData.departureDate,
        price: selectedOffer.price.displayTotal,
      }));

      await sendEmail({
        to: [contactInfo.email],
        subject: 'Confirmation de votre demande de vol - Pouantou Revolution Travel',
        html: clientEmailHtml,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demande de vol envoyée avec succès à notre équipe'
    });

  } catch (error) {
    console.error('Error processing flight search request:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement de la demande'
    }, { status: error instanceof Error && error.message.includes('email') ? 500 : 400 });
  }
}
