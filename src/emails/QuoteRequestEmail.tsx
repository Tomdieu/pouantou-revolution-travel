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
  adults: number;
  children: number;
  infants: number;
  passengersTotal: number;
  travelClass: string;
  preferredAirline?: string;
  nonStop?: boolean;
  budget?: string;
  currencyCode?: string;
  maxPrice?: number;
  additionalInfo?: string;
  flightPrices?: {
    offers: Array<{
      id: string;
      price: {
        total: number;
        currency: string;
        formattedTotal: string;
      };
      duration?: string;
      stops: number;
      isNonStop: boolean;
      departure: {
        airport: string;
        time: string;
      };
      arrival: {
        airport: string;
        time: string;
      };
      airline: string;
      segments: Array<{
        departure: any;
        arrival: any;
        airline: string;
        flightNumber: string;
        duration: string;
        aircraft: string;
      }>;
      bookableSeats: number;
      instantTicketing: boolean;
      lastTicketingDate?: string;
    }>;
    meta: any;
    dictionaries?: any;
  } | null;
  priceSearchError?: string | null;
}

export default function QuoteRequestEmail({
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
  passengersTotal,
  travelClass,
  preferredAirline,
  nonStop,
  budget,
  currencyCode,
  maxPrice,
  additionalInfo,
  flightPrices,
  priceSearchError,
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

            {/* Passenger Breakdown */}
            <Row style={infoRow}>
              <Column style={labelColumn}>
                <Text style={label}>👥 Passagers:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={value}>
                  {adults} Adulte{adults > 1 ? 's' : ''}
                  {children > 0 && `, ${children} Enfant${children > 1 ? 's' : ''}`}
                  {infants > 0 && `, ${infants} Bébé${infants > 1 ? 's' : ''}`}
                  {` (Total: ${passengersTotal || adults + children + infants})`}
                </Text>
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

            {nonStop && (
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>✈️ Type de Vol:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>Vols directs uniquement</Text>
                </Column>
              </Row>
            )}

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
              Veuillez rechercher les meilleurs tarifs pour ce voyage et contacter le client sous 1h.
            </Text>

            {/* Real-time Flight Prices Section */}
            {flightPrices && flightPrices.offers && flightPrices.offers.length > 0 && (
              <Section style={pricesSection}>
                <Heading style={pricesSectionTitle}>💰 Prix en Temps Réel Trouvés</Heading>
                <Text style={pricesIntro}>
                  Voici les meilleurs tarifs trouvés automatiquement via Amadeus:
                </Text>
                
                {flightPrices.offers.slice(0, 3).map((offer, index) => (
                  <Section key={offer.id} style={priceCard}>
                    <Row style={priceHeader}>
                      <Column style={{width: '70%'}}>
                        <Text style={priceTitle}>Option {index + 1}</Text>
                      </Column>
                      <Column style={{width: '30%', textAlign: 'right' as const}}>
                        <Text style={priceAmount}>{offer.price.formattedTotal}</Text>
                      </Column>
                    </Row>
                    
                    <Row style={flightDetailsRow}>
                      <Column style={{width: '50%'}}>
                        <Text style={flightDetail}>
                          <strong>✈️ Vol:</strong> {offer.departure.airport} → {offer.arrival.airport}
                        </Text>
                        <Text style={flightDetail}>
                          <strong>🕒 Durée:</strong> {offer.duration || 'N/A'}
                        </Text>
                      </Column>
                      <Column style={{width: '50%'}}>
                        <Text style={flightDetail}>
                          <strong>🛑 Escales:</strong> {offer.stops === 0 ? 'Vol direct' : `${offer.stops} escale${offer.stops > 1 ? 's' : ''}`}
                        </Text>
                        <Text style={flightDetail}>
                          <strong>🏢 Compagnie:</strong> {offer.airline}
                        </Text>
                      </Column>
                    </Row>
                    
                    <Text style={availabilityNote}>
                      💺 {offer.bookableSeats} siège{offer.bookableSeats > 1 ? 's' : ''} disponible{offer.bookableSeats > 1 ? 's' : ''}
                      {offer.lastTicketingDate && ` | 🎫 Réservation avant le ${new Date(offer.lastTicketingDate).toLocaleDateString('fr-FR')}`}
                    </Text>
                  </Section>
                ))}
                
                <Text style={pricesNote}>
                  ⚠️ Ces prix sont indicatifs et peuvent changer. Contactez rapidement le client pour finaliser la réservation.
                </Text>
              </Section>
            )}

            {/* Price Search Error */}
            {priceSearchError && (
              <Section style={errorSection}>
                <Text style={errorText}>
                  ⚠️ Impossible de récupérer les prix en temps réel: {priceSearchError}
                </Text>
                <Text style={errorText}>
                  Veuillez effectuer une recherche manuelle pour ce client.
                </Text>
              </Section>
            )}
            
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
  backgroundColor: '#0f172a',
  padding: '25px 30px',
  borderRadius: '8px 8px 0 0',
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
  color: '#334155',
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
  color: '#334155',
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
  border: '1px solid #e2e8f0',
  wordBreak: 'break-word' as const,
  minWidth: '100px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const actionSection = {
  backgroundColor: '#f8fafc',
  padding: '20px 30px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '20px 30px',
};

const actionTitle = {
  color: '#334155',
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
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '16px 0',
};

const clientContactTitle = {
  color: '#334155',
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
  backgroundColor: '#f8fafc',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0',
};

// Styles for flight prices section
const pricesSection = {
  backgroundColor: '#f0f9ff',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #bae6fd',
  margin: '16px 0',
};

const pricesSectionTitle = {
  color: '#0c4a6e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const pricesIntro = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const priceCard = {
  backgroundColor: '#ffffff',
  padding: '12px 16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  margin: '8px 0',
};

const priceHeader = {
  marginBottom: '8px',
};

const priceTitle = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const priceAmount = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const flightDetailsRow = {
  marginBottom: '8px',
};

const flightDetail = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '2px 0',
};

const availabilityNote = {
  color: '#7c3aed',
  fontSize: '11px',
  margin: '8px 0 0 0',
  fontStyle: 'italic',
};

const pricesNote = {
  color: '#dc2626',
  fontSize: '12px',
  margin: '12px 0 0 0',
  fontWeight: 'bold',
};

const errorSection = {
  backgroundColor: '#fef2f2',
  padding: '12px 16px',
  borderRadius: '6px',
  border: '1px solid #fecaca',
  margin: '16px 0',
};

const errorText = {
  color: '#dc2626',
  fontSize: '13px',
  margin: '4px 0',
};
