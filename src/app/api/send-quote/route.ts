import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import QuoteRequestEmail from '@/emails/QuoteRequestEmail';
import ClientConfirmationEmail from '@/emails/ClientConfirmationEmail';

// Validate API key exists
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email to your aunt
    const { data, error } = await resend.emails.send({
      from: 'Revolution Travel <onboarding@resend.dev>', // Using verified Resend domain
      to: ['ivan.tomdieu@gmail.com'], // Your aunt's email
    
      //   to: ['p.revolutiontravel@yahoo.com'], // Your aunt's email
      subject: `📋 Nouvelle Demande de Devis - ${fullName} vers ${destination}`,
      html: agencyEmailHtml,
      replyTo: email, // Client's email for easy reply
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email' },
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
    await resend.emails.send({
      from: 'Revolution Travel <onboarding@resend.dev>',
      to: [email],
      subject: '✅ Confirmation de votre demande de devis - Revolution Travel',
      html: clientConfirmationHtml,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Demande envoyée avec succès',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Error in send-quote API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
