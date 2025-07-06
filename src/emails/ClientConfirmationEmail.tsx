import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Hr,
} from '@react-email/components';

interface ClientConfirmationEmailProps {
  fullName: string;
  destination: string;
  departureCity: string;
  departureDate: string;
  returnDate?: string;
  passengers?: string; // For backward compatibility
  adults?: number;
  children?: number;
  infants?: number;
  passengersTotal?: number;
}

export default function ClientConfirmationEmail({
  fullName,
  destination,
  departureCity,
  departureDate,
  returnDate,
  passengers,
  adults,
  children,
  infants,
  passengersTotal,
}: ClientConfirmationEmailProps) {
  // Calculate passenger display string
  const passengerDisplay = passengers || 
    `${adults || 0} Adulte${(adults || 0) > 1 ? 's' : ''}${children ? `, ${children} Enfant${children > 1 ? 's' : ''}` : ''}${infants ? `, ${infants} Bébé${infants > 1 ? 's' : ''}` : ''} (Total: ${passengersTotal || (adults || 0) + (children || 0) + (infants || 0)})`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Html>
      <Head />
      <Preview>Confirmation demande devis voyage - Revolution Travel Services Cameroun - Réponse sous 1h</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>✅ Demande Reçue avec Succès!</Text>
            <Text style={headerSubtext}>Revolution Travel Services</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>Bonjour <strong>{fullName}</strong>,</Text>
            
            <Text style={paragraph}>
              Nous avons bien reçu votre demande de devis pour votre voyage vers <strong>{destination}</strong>.
            </Text>

            {/* Request Summary */}
            <Section style={summarySection}>
              <Heading style={summaryTitle}>📋 Résumé de votre demande:</Heading>
              
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Destination:</strong> {destination}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Départ:</strong> {departureCity}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date de départ:</strong> {formatDate(departureDate)}</Text>
              </Row>
              {returnDate ? (
                <Row style={summaryRow}>
                  <Text style={summaryItem}><strong>Date de retour:</strong> {formatDate(returnDate)}</Text>
                </Row>
              ) : (
                <Row style={summaryRow}>
                  <Text style={summaryItem}><strong>Type:</strong> Aller Simple</Text>
                </Row>
              )}
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Passagers:</strong> {passengerDisplay}</Text>
              </Row>
            </Section>

            <Text style={paragraph}>
              Notre équipe va maintenant rechercher les meilleures offres pour votre voyage et vous contactera sous <strong>24 heures</strong> avec:
            </Text>

            {/* What to Expect */}
            <Section style={expectationsList}>
              <Text style={listItem}>🏷️ Les meilleurs tarifs disponibles</Text>
              <Text style={listItem}>✈️ Différentes options de compagnies aériennes</Text>
              <Text style={listItem}>📋 Tous les détails de voyage</Text>
              <Text style={listItem}>💼 Conseils personnalisés</Text>
            </Section>

            <Hr style={divider} />

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={contactTitle}>📞 Nous Contacter</Heading>
              <Text style={contactDetail}><strong>Téléphone:</strong> 6 77 91 68 32</Text>
              <Text style={contactDetail}><strong>Email:</strong> p.revolutiontravel@yahoo.com</Text>
              <Text style={contactDetail}><strong>Horaires:</strong> 8h/7 (8h par jour, pas le dimanche sauf urgence)</Text>
            </Section>

            <Text style={paragraph}>
              Merci de nous faire confiance pour votre voyage!
            </Text>

            <Text style={signature}>
              Cordialement,<br />
              <strong>L&apos;équipe Revolution Travel Services</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Revolution Travel & Services - Agence de Voyage Professionnelle au Cameroun
            </Text>
            <Text style={footerText}>
              Téléphone: +237 677 916 832 | Email: p.revolutiontravel@yahoo.com
            </Text>
            <Text style={footerText}>
              Pour toute question urgente, appelez-nous directement ou répondez à cet email.
            </Text>
            <Text style={footerText}>
              Merci de votre confiance. Nous vous répondrons sous 24 heures maximum.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#2563eb',
  padding: '25px 30px',
  borderRadius: '10px 10px 0 0',
  textAlign: 'center' as const,
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.9,
};

const section = {
  padding: '20px 30px',
};

const greeting = {
  color: '#374151',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const summarySection = {
  backgroundColor: '#eff6ff',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  margin: '20px 0',
};

const summaryTitle = {
  color: '#1d4ed8',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const summaryRow = {
  marginBottom: '8px',
};

const summaryItem = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
};

const expectationsList = {
  margin: '16px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 8px 0',
  paddingLeft: '8px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const contactSection = {
  backgroundColor: '#f0fdf4',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  borderLeft: '4px solid #10b981',
  margin: '20px 0',
};

const contactTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const contactDetail = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 6px 0',
};

const signature = {
  color: '#374151',
  fontSize: '14px',
  margin: '24px 0 0 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px 30px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0',
};
