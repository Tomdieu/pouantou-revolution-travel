import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/emailService';
import CarRentalRequestEmail from '@/emails/CarRentalRequestEmail';

interface CarRentalTeamRequest {
  carRentalData: {
    brand: string;
    model: string;
    budgetPerDay: number;
    phone: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    driverAge?: number;
  };
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      carRentalData,
      timestamp
    }: CarRentalTeamRequest = await request.json();

    // Validate required fields
    if (!carRentalData.brand || !carRentalData.model || !carRentalData.budgetPerDay) {
      return NextResponse.json({
        success: false,
        error: 'Marque, modèle et budget requis'
      }, { status: 400 });
    }

    // Calculate estimated duration and total budget
    let estimatedDays = undefined;
    let totalBudget = undefined;
    
    if (carRentalData.startDate && carRentalData.endDate) {
      estimatedDays = Math.ceil(
        (new Date(carRentalData.endDate).getTime() - new Date(carRentalData.startDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      totalBudget = estimatedDays * carRentalData.budgetPerDay;
    }

    // Render email template using React Email
    const emailHtml = await render(CarRentalRequestEmail({
      ...carRentalData,
      estimatedDays,
      totalBudget,
    }));

    // Prepare plain text version
    const textContent = `
      NOUVELLE DEMANDE DE LOCATION DE VOITURE
      
      DÉTAILS DE LA DEMANDE:
      - Marque: ${carRentalData.brand}
      - Modèle: ${carRentalData.model}
      - Budget par jour: ${carRentalData.budgetPerDay} EUR
      - Lieu de prise en charge: ${carRentalData.location || 'Non spécifié'}
      - Date de début: ${carRentalData.startDate || 'Non spécifiée'}
      - Date de fin: ${carRentalData.endDate || 'Non spécifiée'}
      - Âge du conducteur: ${carRentalData.driverAge ? `${carRentalData.driverAge} ans` : 'Non spécifié'}
      
      INFORMATIONS SUPPLÉMENTAIRES:
      - Durée estimée: ${estimatedDays ? `${estimatedDays} jours` : 'Non spécifiée'}
      - Budget total estimé: ${totalBudget ? `${totalBudget} EUR` : 'À calculer'}
      
      Demande reçue le ${new Date(timestamp).toLocaleString('fr-FR')}
      
      Revolution Travel Services
      Cameroun
    `;

    // Send email using the email service
    try {
      await sendEmail({
        to: ['ivan.tomdieu@gmail.com'],
        // to: ['ivan.tomdieu@gmail.com', 'p.revolutiontravel@yahoo.com', 'tsilieuj@gmail.com'],

        subject: `🚗 Nouvelle demande de location - ${carRentalData.brand} ${carRentalData.model}`,
        html: emailHtml,
        text: textContent,
      });

      return NextResponse.json({
        success: true,
        message: 'Demande de location de voiture envoyée avec succès à notre équipe'
      });
    } catch (error) {
      console.error('Error sending car rental request email:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending car rental request to team:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi de la demande'
    }, { status: 500 });
  }
}
