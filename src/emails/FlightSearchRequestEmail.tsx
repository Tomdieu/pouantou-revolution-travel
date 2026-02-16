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

import { FlightSearchRequestEmailProps } from '@/types/flight-search';
import { calculateFlightServiceFee } from '@/lib/service-fees';


export default function FlightSearchRequestEmail({
  searchData: {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults,
    children,
    infants,
    travelClass,
    nonStop,
  },
  selectedOffer: selectedFlight,
  contactInfo,
  searchError,
  isAdmin = true,
}: FlightSearchRequestEmailProps) {
  const { email, phone } = contactInfo;
  const previewText = isAdmin
    ? `Nouvelle recherche de vol: ${originLocationCode} → ${destinationLocationCode}`
    : `Confirmation de votre demande de vol: ${originLocationCode} → ${destinationLocationCode}`;

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'N/A';
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? match[1].replace('H', 'h ') : '';
    const minutes = match[2] ? match[2].replace('M', 'min') : '';
    return `${hours}${minutes}`.trim();
  };

  return (
    <Html>
      <Head />
      <Preview>Nouvelle recherche de vol - {originLocationCode} → {destinationLocationCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>
              {isAdmin ? 'NOUVELLE RECHERCHE DE VOL' : 'CONFIRMATION DE VOTRE DEMANDE'}
            </Text>
            <Text style={headerSubtext}>Pouantou Revolution Travel & Services</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              {isAdmin
                ? `Une nouvelle recherche de vol a été effectuée pour ${originLocationCode} → ${destinationLocationCode}.`
                : 'Nous avons bien reçu votre demande de recherche de vol. Voici un récapitulatif des options que vous avez sélectionnées.'}
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
                  {(children ?? 0) > 0 ? `, ${children} enfant(s)` : ''}
                  {(infants ?? 0) > 0 ? `, ${infants} bébé(s)` : ''}
                </Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Classe:</strong> {getTravelClassName(travelClass ?? '')}</Text>
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
                <Heading style={errorTitle}>⚠️ {isAdmin ? 'Erreur de Recherche:' : 'Information sur votre recherche:'}</Heading>
                <Text style={errorText}>
                  {isAdmin
                    ? searchError
                    : "Nous n'avons pas pu trouver de vols correspondant exactement à vos critères en ligne. Pas de panique ! Notre équipe effectue une recherche manuelle approfondie pour vous trouver les meilleures options."}
                </Text>
                {isAdmin && (
                  <Text style={actionText}>
                    Action requise: Contactez le client {phone ? `au ${phone}` : `à ${email}`} pour une recherche manuelle.
                  </Text>
                )}
              </Section>
            ) : selectedFlight ? (
              <Section style={resultsSection}>
                <Heading style={resultsTitle}>✅ Vol Sélectionné:</Heading>
                <Section style={flightCard}>
                  {/* Airline and Price Header */}
                  <Row style={{ marginBottom: '16px' }}>
                    <Section style={{ display: 'inline-block', width: '50%' }}>
                      <Text style={airlineName}>{selectedFlight.airline}</Text>
                      <Text style={flightType}>
                        {selectedFlight.stops === 0 ? 'VOL DIRECT' : `${selectedFlight.stops} ESCALE(S)`}
                      </Text>
                    </Section>
                    <Section style={{ display: 'inline-block', width: '50%', textAlign: 'right' as const }}>
                      <Text style={flightPrice}>{selectedFlight.price.displayTotal}</Text>
                      {isAdmin && selectedFlight.price.basePrice && (
                        <Text style={priceBreakdown}>
                          Base: {selectedFlight.price.basePrice.toFixed(2)} {selectedFlight.price.currency} + {calculateFlightServiceFee(selectedFlight.price.basePrice).toFixed(2)} {selectedFlight.price.currency} frais
                        </Text>
                      )}
                    </Section>
                  </Row>

                  {/* Flight Timeline */}
                  <Section style={timelineContainer}>
                    <Row style={{ marginBottom: '8px' }}>
                      <Section style={{ display: 'inline-block', width: '30%', textAlign: 'center' as const }}>
                        <Text style={timeText}>{formatTime(selectedFlight.departure.time)}</Text>
                        <Text style={airportText}>{selectedFlight.departure.airport}</Text>
                      </Section>

                      <Section style={{ display: 'inline-block', width: '40%', textAlign: 'center' as const }}>
                        <Text style={durationText}>{formatDuration(selectedFlight.duration)}</Text>
                        <div style={timelineLine}></div>
                      </Section>

                      <Section style={{ display: 'inline-block', width: '30%', textAlign: 'center' as const }}>
                        <Text style={timeText}>{formatTime(selectedFlight.arrival.time)}</Text>
                        <Text style={airportText}>{selectedFlight.arrival.airport}</Text>
                      </Section>
                    </Row>

                    <Row>
                      <Section style={{ display: 'inline-block', width: '30%', textAlign: 'center' as const }}>
                        <Text style={dateText}>{new Date(selectedFlight.departure.time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                      </Section>
                      <Section style={{ display: 'inline-block', width: '40%' }}></Section>
                      <Section style={{ display: 'inline-block', width: '30%', textAlign: 'center' as const }}>
                        <Text style={dateText}>{new Date(selectedFlight.arrival.time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                      </Section>
                    </Row>
                  </Section>

                  {/* Additional Info */}
                  <Row style={{ marginTop: '16px' }}>
                    <Text style={flightDetail}>
                      <strong>Places:</strong> {selectedFlight.bookableSeats} |
                      <strong> Instantané:</strong> {selectedFlight.instantTicketing ? 'Oui' : 'Non'}
                    </Text>
                  </Row>

                  <Text style={feeNotice}>
                    ℹ️ Note: Les frais de service appropriés ont déjà été inclus dans ce prix.
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

            {!isAdmin && (
              <Section style={actionSection}>
                <Heading style={actionTitle}>✨ Prochaines étapes:</Heading>
                <Text style={summaryItem}>
                  Notre équipe va analyser les disponibilités pour ce vol et vous contactera très prochainement au <strong>{phone}</strong> ou par email à <strong>{email}</strong> pour finaliser votre réservation.
                </Text>
              </Section>
            )}

            {/* Admin specific Action Items */}
            {isAdmin && (
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
            )}
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
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const airlineName = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
};

const flightType = {
  fontSize: '11px',
  color: '#6b7280',
  fontWeight: 'bold',
  letterSpacing: '0.05em',
  margin: '2px 0 0 0',
};

const flightPrice = {
  fontSize: '24px',
  fontWeight: '900',
  color: '#2563eb',
  margin: '0',
};

const priceBreakdown = {
  fontSize: '11px',
  color: '#6b7280',
  margin: '2px 0 0 0',
  fontWeight: 'bold',
};

const timelineContainer = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '12px',
  margin: '16px 0',
};

const timeText = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#111827',
  margin: '0',
};

const airportText = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  margin: '2px 0 0 0',
};

const dateText = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '4px 0 0 0',
};

const durationText = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#4b5563',
  margin: '0 0 4px 0',
};

const timelineLine = {
  height: '2px',
  backgroundColor: '#e5e7eb',
  width: '100%',
  position: 'relative' as const,
  margin: '8px 0',
};

const flightDetail = {
  fontSize: '13px',
  color: '#4b5563',
  margin: '4px 0',
};

const warningText = {
  fontSize: '13px',
  color: '#f97316',
  fontWeight: 'bold',
  margin: '12px 0 0 0',
};

const feeNotice = {
  fontSize: '13px',
  color: '#1e40af',
  fontWeight: 'bold',
  backgroundColor: '#eff6ff',
  padding: '10px',
  borderRadius: '8px',
  marginTop: '16px',
  border: '1px solid #dbeafe',
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
