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

interface HotelSearchRequestEmailProps {
  country: string;
  city: string;
  budget: number;
  phone: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  radius?: number;
  foundHotels?: Array<{
    id: string;
    name: string;
    address: string;
    rating?: number;
    distance?: {
      value: number;
      unit: string;
    };
    contact?: {
      phone?: string;
      email?: string;
    };
    amenities?: string[];
  }>;
  searchError?: string;
}

export default function HotelSearchRequestEmail({
  country,
  city,
  budget,
  phone,
  checkInDate,
  checkOutDate,
  adults,
  radius,
  foundHotels,
  searchError,
}: HotelSearchRequestEmailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
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
      <Preview>Nouvelle recherche d'hôtel - {city}, {country}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>🏨 Nouvelle Recherche d'Hôtel</Text>
            <Text style={headerSubtext}>Revolution Travel Services</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              Une nouvelle recherche d'hôtel a été effectuée pour <strong>{city}, {country}</strong>.
            </Text>

            {/* Search Details */}
            <Section style={summarySection}>
              <Heading style={summaryTitle}>📋 Détails de la Recherche:</Heading>
              
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Pays:</strong> {country}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Ville:</strong> {city}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Budget par nuit:</strong> {budget} EUR</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Numéro de téléphone:</strong> {phone}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date d'arrivée:</strong> {formatDate(checkInDate)}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date de départ:</strong> {formatDate(checkOutDate)}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Nombre d'adultes:</strong> {adults || 'Non spécifié'}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Rayon de recherche:</strong> {radius ? `${radius} km` : 'Non spécifié'}</Text>
              </Row>
            </Section>

            {searchError ? (
              <Section style={errorSection}>
                <Heading style={errorTitle}>⚠️ Erreur de Recherche:</Heading>
                <Text style={errorText}>{searchError}</Text>
                <Text style={actionText}>
                  Veuillez contacter le client au {phone} pour l'aider dans sa recherche d'hôtel.
                </Text>
              </Section>
            ) : foundHotels && foundHotels.length > 0 ? (
              <Section style={resultsSection}>
                <Heading style={resultsTitle}>🏢 Hôtels Trouvés ({foundHotels.length}):</Heading>
                {foundHotels.map((hotel, index) => (
                  <Section key={hotel.id} style={hotelCard}>
                    <Text style={hotelName}>{hotel.name}</Text>
                    <Text style={hotelDetail}>📍 {hotel.address}</Text>
                    {hotel.rating && (
                      <Text style={hotelDetail}>⭐ Note: {hotel.rating}/5</Text>
                    )}
                    {hotel.distance && (
                      <Text style={hotelDetail}>📏 Distance: {hotel.distance.value} {hotel.distance.unit}</Text>
                    )}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <Text style={hotelDetail}>
                        🎯 Équipements: {hotel.amenities.slice(0, 5).join(', ')}
                        {hotel.amenities.length > 5 ? '...' : ''}
                      </Text>
                    )}
                    {index < foundHotels.length - 1 && <Hr style={hotelDivider} />}
                  </Section>
                ))}
              </Section>
            ) : (
              <Section style={noResultsSection}>
                <Text style={noResultsText}>
                  Aucun hôtel trouvé pour ces critères. Veuillez contacter le client pour proposer des alternatives.
                </Text>
              </Section>
            )}

            <Hr style={divider} />

            {/* Action Items */}
            <Section style={actionSection}>
              <Heading style={actionTitle}>⚡ Actions Requises:</Heading>
              <Text style={listItem}>1. Vérifier les disponibilités des hôtels</Text>
              <Text style={listItem}>2. Contacter le client au {phone}</Text>
              <Text style={listItem}>3. Proposer des alternatives si nécessaire</Text>
              <Text style={listItem}>4. Préparer un devis personnalisé</Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Revolution Travel & Services - Réservation d'Hôtels au Cameroun
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
  backgroundColor: '#0f172a',
  padding: '25px 30px',
  borderRadius: '8px 8px 0 0',
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
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '20px 0',
};

const summaryTitle = {
  color: '#334155',
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
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '20px 0',
};

const resultsTitle = {
  color: '#334155',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const hotelCard = {
  padding: '12px 0',
};

const hotelName = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#334155',
  margin: '0 0 8px 0',
};

const hotelDetail = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
};

const hotelDivider = {
  borderColor: '#e2e8f0',
  margin: '12px 0',
};

const errorSection = {
  backgroundColor: '#fef2f2',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  
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
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
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
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  
  margin: '20px 0',
};

const actionTitle = {
  color: '#334155',
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
  backgroundColor: '#f8fafc',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0',
};
