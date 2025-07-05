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
      passengers,
      travelClass,
      preferredAirline,
      budget,
      additionalInfo
    } = formData;

    // Render email templates using React Email
    const agencyEmailHtml = await render(QuoteRequestEmail({
      fullName,
      phone,
      email,
      departureCity,
      destination,
      departureDate,
      returnDate,
      passengers,
      travelClass,
      preferredAirline,
      budget,
      additionalInfo,
    }));

    // Send email to the agency
    try {
      const result = await sendEmail({
        to: ['ivan.tomdieu@gmail.com','p.revolutiontravel@yahoo.com'], // Your email
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
Passagers: ${passengers}
Classe: ${travelClass}
${preferredAirline ? `Compagnie préférée: ${preferredAirline}` : ''}
${budget ? `Budget: ${budget}` : ''}
${additionalInfo ? `Informations supplémentaires: ${additionalInfo}` : ''}

Revolution Travel Services - Cameroun
Merci de contacter le client sous 24h.`,
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
      passengers,
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
- Passagers: ${passengers}

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
