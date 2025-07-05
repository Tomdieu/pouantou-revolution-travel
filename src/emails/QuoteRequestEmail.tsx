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
  Column,
  Hr,
} from '@react-email/components';

interface QuoteRequestEmailProps {
  fullName: string;
  phone: string;
  email: string;
  departureCity: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: string;
  travelClass: string;
  preferredAirline?: string;
  budget?: string;
  additionalInfo?: string;
}

export default function QuoteRequestEmail({
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
}: QuoteRequestEmailProps) {
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
      <Preview>Demande de devis voyage - Client: {fullName} - Destination: {destination} - Revolution Travel Services</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>🛫 Nouvelle Demande de Devis</Text>
            <Text style={headerSubtext}>Revolution Travel Services</Text>
          </Section>

          {/* Client Information */}
          <Section style={section}>
            <Heading style={sectionTitle}>📋 Informations Client</Heading>
            
            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>👤 Nom Complet:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{fullName}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>📞 Téléphone:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{phone}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>📧 Email:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{email}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Travel Details */}
          <Section style={section}>
            <Heading style={sectionTitle}>✈️ Détails du Voyage</Heading>
            
            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>🛫 Ville de Départ:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{departureCity}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>🎯 Destination:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{destination}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>📅 Date de Départ:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{formatDate(departureDate)}</Text>
              </Column>
            </Row>

            {returnDate ? (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>🔄 Date de Retour:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{formatDate(returnDate)}</Text>
                </Column>
              </Row>
            ) : (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>🔄 Type de Vol:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>Aller Simple</Text>
                </Column>
              </Row>
            )}

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>👥 Nombre de Passagers:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{passengers}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>🏷️ Classe de Voyage:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>{travelClass}</Text>
              </Column>
            </Row>

            {preferredAirline && (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>🛩️ Compagnie Préférée:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{preferredAirline}</Text>
                </Column>
              </Row>
            )}

            {budget && (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>💰 Budget Approximatif:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{budget}</Text>
                </Column>
              </Row>
            )}

            {additionalInfo && (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>📝 Informations Supplémentaires:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{additionalInfo}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={divider} />

          {/* Action Required */}
          <Section style={actionSection}>
            <Heading style={actionTitle}>⏰ Action Requise</Heading>
            <Text style={actionText}>
              Veuillez rechercher les meilleurs tarifs pour ce voyage et contacter le client sous 24h.
            </Text>
            
            {/* Client Contact Info */}
            <Section style={clientContactSection}>
              <Heading style={clientContactTitle}>📞 Contact du Client</Heading>
              <Row style={contactRow}>
                <Column style={{width: '50%'}}>
                  <Text style={clientContactText}>
                    <strong>📱 Téléphone:</strong><br />
                    {phone}
                  </Text>
                </Column>
                <Column style={{width: '50%'}}>
                  <Text style={clientContactText}>
                    <strong>📧 Email:</strong><br />
                    {email}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={contactInfo}>
              <strong>Vos Informations de Contact:</strong><br />
              📞 Téléphone: +237 677 916 832<br />
              📧 Email: p.revolutiontravel@yahoo.com
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Revolution Travel & Services - Agence de Voyage Professionnelle
            </Text>
            <Text style={footerText}>
              Cameroun | Téléphone: +237 677 916 832 | Email: p.revolutiontravel@yahoo.com
            </Text>
            <Text style={footerText}>
              Ce message a été envoyé automatiquement le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </Text>
            <Text style={footerText}>
              Vous recevez cet email car une demande de devis a été soumise sur notre site web.
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
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
  lineHeight: '1.3',
};

const section = {
  padding: '20px 30px',
};

const sectionTitle = {
  color: '#1d4ed8',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const infoRow = {
  marginBottom: '12px',
};

const labelColumn = {
  width: '35%',
  verticalAlign: 'top' as const,
  paddingRight: '10px',
};

const valueColumn = {
  width: '65%',
  verticalAlign: 'top' as const,
};

const label = {
  color: '#1d4ed8',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const value = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
  backgroundColor: '#f8fafc',
  padding: '8px 12px',
  borderRadius: '6px',
  borderLeft: '4px solid #2563eb',
  wordBreak: 'break-word' as const,
  minWidth: '100px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const actionSection = {
  backgroundColor: '#eff6ff',
  padding: '20px 30px',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  margin: '20px 30px',
};

const actionTitle = {
  color: '#1d4ed8',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const actionText = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const contactInfo = {
  color: '#374151',
  fontSize: '14px',
  margin: '16px 0 0 0',
};

const clientContactSection = {
  backgroundColor: '#f0fdf4',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  margin: '16px 0',
};

const clientContactTitle = {
  color: '#065f46',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const contactRow = {
  marginBottom: '8px',
};

const clientContactText = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
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
