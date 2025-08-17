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

interface FlightSearchRequestEmailProps {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  nonStop?: boolean;
  email?: string;
  phone?: string;
  selectedFlight?: {
    id: string;
    price: {
      total: number;
      currency: string;
      formattedTotal: string;
      displayTotal: string;
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
    bookableSeats: number;
    instantTicketing: boolean;
    lastTicketingDate?: string;
  };
  searchError?: string;
}

export default function FlightSearchRequestEmail({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  returnDate,
  adults,
  children = 0,
  infants = 0,
  travelClass = 'ECONOMY',
  nonStop,
  email,
  phone,
  selectedFlight,
  searchError,
}: FlightSearchRequestEmailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTravelClassName = (classCode: string) => {
    switch (classCode) {
      case 'ECONOMY': return 'Économique';
      case 'PREMIUM_ECONOMY': return 'Économique Premium';
      case 'BUSINESS': return 'Affaires';
      case 'FIRST': return 'Première';
      default: return classCode;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Nouvelle recherche de vol - {originLocationCode} → {destinationLocationCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>✈️ Nouvelle Recherche de Vol</Text>
            <Text style={headerSubtext}>Revolution Travel Services</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              Une nouvelle recherche de vol a été effectuée pour <strong>{originLocationCode} → {destinationLocationCode}</strong>.
            </Text>

            {/* Search Details */}
            <Section style={summarySection}>
              <Heading style={summaryTitle}>📋 Détails de la Recherche:</Heading>
              
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Départ:</strong> {originLocationCode}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Destination:</strong> {destinationLocationCode}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date de départ:</strong> {formatDate(departureDate)}</Text>
              </Row>
              {returnDate && (
                <Row style={summaryRow}>
                  <Text style={summaryItem}><strong>Date de retour:</strong> {formatDate(returnDate)}</Text>
                </Row>
              )}
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Passagers:</strong> {adults} adulte(s)
                  {children > 0 ? `, ${children} enfant(s)` : ''}
                  {infants > 0 ? `, ${infants} bébé(s)` : ''}
                </Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Classe:</strong> {getTravelClassName(travelClass)}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Vol direct uniquement:</strong> {nonStop ? 'Oui' : 'Non'}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}>
                  <strong>Contact:</strong> {email ? `Email: ${email}` : ''} {phone ? `Tél: ${phone}` : ''}
                </Text>
              </Row>
            </Section>

            {searchError ? (
              <Section style={errorSection}>
                <Heading style={errorTitle}>⚠️ Erreur de Recherche:</Heading>
                <Text style={errorText}>{searchError}</Text>
                <Text style={actionText}>
                  Action requise: Contactez le client {phone ? `au ${phone}` : `à ${email}`} pour une recherche manuelle.
                </Text>
              </Section>
            ) : selectedFlight ? (
              <Section style={resultsSection}>
                <Heading style={resultsTitle}>✅ Vol Sélectionné:</Heading>
                <Section style={flightCard}>
                  <Text style={flightPrice}>{selectedFlight.price.displayTotal}</Text>
                  <Text style={flightRoute}>
                    {selectedFlight.departure.airport} → {selectedFlight.arrival.airport}
                  </Text>
                  <Text style={flightDetail}>Compagnie: {selectedFlight.airline}</Text>
                  <Text style={flightDetail}>
                    {selectedFlight.stops === 0 ? 'Vol direct' : `${selectedFlight.stops} escale(s)`}
                  </Text>
                  <Text style={flightDetail}>Durée: {selectedFlight.duration || 'N/A'}</Text>
                  <Text style={flightDetail}>Places disponibles: {selectedFlight.bookableSeats}</Text>
                  <Text style={flightDetail}>
                    Réservation instantanée: {selectedFlight.instantTicketing ? 'Oui' : 'Non'}
                  </Text>
                  {selectedFlight.lastTicketingDate && (
                    <Text style={warningText}>
                      ⚠️ À réserver avant le: {new Date(selectedFlight.lastTicketingDate).toLocaleDateString()}
                    </Text>
                  )}
                </Section>
              </Section>
            ) : (
              <Section style={noResultsSection}>
                <Text style={noResultsText}>
                  Aucun vol trouvé pour ces critères. Une recherche manuelle est nécessaire.
                </Text>
              </Section>
            )}

            <Hr style={divider} />

            {/* Action Items */}
            <Section style={actionSection}>
              <Heading style={actionTitle}>⚡ Actions Requises:</Heading>
              {selectedFlight ? (
                <>
                  <Text style={listItem}>1. Vérifier la disponibilité et le prix</Text>
                  <Text style={listItem}>2. Contacter le client pour confirmer</Text>
                  <Text style={listItem}>3. Procéder à la réservation rapidement</Text>
                  <Text style={listItem}>4. Envoyer la confirmation de réservation</Text>
                </>
              ) : (
                <>
                  <Text style={listItem}>1. Effectuer une recherche manuelle</Text>
                  <Text style={listItem}>2. Contacter le client avec des alternatives</Text>
                  <Text style={listItem}>3. Proposer des options similaires</Text>
                </>
              )}
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Revolution Travel & Services - Réservation de Vols au Cameroun
            </Text>
            <Text style={footerText}>
              Téléphone: +237 677 916 832 | Email: p.revolutiontravel@yahoo.com
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

const resultsSection = {
  backgroundColor: '#f0fdf4',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  margin: '20px 0',
};

const resultsTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const flightCard = {
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '1px solid #d1fae5',
};

const flightPrice = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const flightRoute = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 12px 0',
};

const flightDetail = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
};

const warningText = {
  fontSize: '14px',
  color: '#f97316',
  margin: '12px 0 0 0',
};

const errorSection = {
  backgroundColor: '#fef2f2',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  borderLeft: '4px solid #dc2626',
  margin: '20px 0',
};

const errorTitle = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const errorText = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 12px 0',
};

const actionText = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 0 0',
};

const noResultsSection = {
  backgroundColor: '#fff7ed',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #fed7aa',
  margin: '20px 0',
};

const noResultsText = {
  color: '#374151',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const actionSection = {
  backgroundColor: '#fff7ed',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #fed7aa',
  borderLeft: '4px solid #f97316',
  margin: '20px 0',
};

const actionTitle = {
  color: '#c2410c',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 8px 0',
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
