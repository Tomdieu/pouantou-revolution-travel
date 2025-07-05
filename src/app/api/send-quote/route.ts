import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    // Create the email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nouvelle Demande de Devis - Revolution Travel Services</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; color: #1d4ed8; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #2563eb; }
            .highlight { background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; }
            .footer { text-align: center; padding: 20px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛫 Nouvelle Demande de Devis</h1>
              <p>Revolution Travel Services</p>
            </div>
            
            <div class="content">
              <div class="highlight">
                <h2>📋 Informations Client</h2>
              </div>
              
              <div class="section">
                <div class="label">👤 Nom Complet:</div>
                <div class="value">${fullName}</div>
              </div>
              
              <div class="section">
                <div class="label">📞 Téléphone:</div>
                <div class="value">${phone}</div>
              </div>
              
              <div class="section">
                <div class="label">📧 Email:</div>
                <div class="value">${email}</div>
              </div>
              
              <div class="highlight">
                <h2>✈️ Détails du Voyage</h2>
              </div>
              
              <div class="section">
                <div class="label">🛫 Ville de Départ:</div>
                <div class="value">${departureCity}</div>
              </div>
              
              <div class="section">
                <div class="label">🎯 Destination:</div>
                <div class="value">${destination}</div>
              </div>
              
              <div class="section">
                <div class="label">📅 Date de Départ:</div>
                <div class="value">${new Date(departureDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              
              ${returnDate ? `
              <div class="section">
                <div class="label">🔄 Date de Retour:</div>
                <div class="value">${new Date(returnDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              ` : `
              <div class="section">
                <div class="label">🔄 Type de Vol:</div>
                <div class="value">Aller Simple</div>
              </div>
              `}
              
              <div class="section">
                <div class="label">👥 Nombre de Passagers:</div>
                <div class="value">${passengers}</div>
              </div>
              
              <div class="section">
                <div class="label">🏷️ Classe de Voyage:</div>
                <div class="value">${travelClass}</div>
              </div>
              
              ${preferredAirline ? `
              <div class="section">
                <div class="label">🛩️ Compagnie Préférée:</div>
                <div class="value">${preferredAirline}</div>
              </div>
              ` : ''}
              
              ${budget ? `
              <div class="section">
                <div class="label">💰 Budget Approximatif:</div>
                <div class="value">${budget}</div>
              </div>
              ` : ''}
              
              ${additionalInfo ? `
              <div class="section">
                <div class="label">📝 Informations Supplémentaires:</div>
                <div class="value">${additionalInfo}</div>
              </div>
              ` : ''}
              
              <div class="highlight">
                <h3>⏰ Action Requise</h3>
                <p>Veuillez rechercher les meilleurs tarifs pour ce voyage et contacter le client sous 24h.</p>
                <p><strong>Contact Client:</strong> ${phone} | ${email}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>📧 Email envoyé automatiquement depuis le site web Revolution Travel Services</p>
              <p>🕒 ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to your aunt
    const { data, error } = await resend.emails.send({
      from: 'Revolution Travel <onboarding@resend.dev>', // Using verified Resend domain
      to: ['ivan.tomdieu@gmail.com'], // Your aunt's email
    
      //   to: ['p.revolutiontravel@yahoo.com'], // Your aunt's email
      subject: `📋 Nouvelle Demande de Devis - ${fullName} vers ${destination}`,
      html: emailHtml,
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
    const clientConfirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmation de Demande - Revolution Travel Services</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; padding: 20px; border-radius: 10px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px; }
            .highlight { background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; margin: 20px 0; }
            .contact-info { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Demande Reçue avec Succès!</h1>
              <p>Revolution Travel Services</p>
            </div>
            
            <div class="content">
              <p>Bonjour <strong>${fullName}</strong>,</p>
              
              <p>Nous avons bien reçu votre demande de devis pour votre voyage vers <strong>${destination}</strong>.</p>
              
              <div class="highlight">
                <h3>📋 Résumé de votre demande:</h3>
                <ul>
                  <li><strong>Destination:</strong> ${destination}</li>
                  <li><strong>Départ:</strong> ${departureCity}</li>
                  <li><strong>Date de départ:</strong> ${new Date(departureDate).toLocaleDateString('fr-FR')}</li>
                  ${returnDate ? `<li><strong>Date de retour:</strong> ${new Date(returnDate).toLocaleDateString('fr-FR')}</li>` : '<li><strong>Type:</strong> Aller Simple</li>'}
                  <li><strong>Passagers:</strong> ${passengers}</li>
                </ul>
              </div>
              
              <p>Notre équipe va maintenant rechercher les meilleures offres pour votre voyage et vous contactera sous <strong>24 heures</strong> avec:</p>
              
              <ul>
                <li>🏷️ Les meilleurs tarifs disponibles</li>
                <li>✈️ Différentes options de compagnies aériennes</li>
                <li>📋 Tous les détails de voyage</li>
                <li>💼 Conseils personnalisés</li>
              </ul>
              
              <div class="contact-info">
                <h3>📞 Nous Contacter</h3>
                <p><strong>Téléphone:</strong> 6 77 91 68 32</p>
                <p><strong>Email:</strong> p.revolutiontravel@yahoo.com</p>
                <p><strong>Horaires:</strong> 8h/7 (8h par jour, pas le dimanche sauf urgence)</p>
              </div>
              
              <p>Merci de nous faire confiance pour votre voyage!</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe Revolution Travel Services</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

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
