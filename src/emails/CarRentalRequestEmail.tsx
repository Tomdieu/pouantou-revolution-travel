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
import React from 'react';

interface CarRentalRequestEmailProps {
  brand: string;
  model: string;
  budgetPerDay: number;
  phone: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  driverAge?: number;
  estimatedDays?: number;
  totalBudget?: number;
}

const CarRentalRequestEmail = ({
  brand,
  model,
  budgetPerDay,
  phone,
  location,
  startDate,
  endDate,
  driverAge,
  estimatedDays,
  totalBudget,
}: CarRentalRequestEmailProps) => {
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
      <Preview>Nouvelle demande de location - {brand} {model}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>🚗 Nouvelle Demande de Location</Text>
            <Text style={headerSubtext}>Revolution Travel Services</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              Une nouvelle demande de location a été reçue pour une <strong>{brand} {model}</strong>.
            </Text>

            {/* Request Summary */}
            <Section style={summarySection}>
              <Heading style={summaryTitle}>📋 Détails de la Demande:</Heading>
              
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Marque:</strong> {brand}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Modèle:</strong> {model}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Budget par jour:</strong> {budgetPerDay} EUR</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Numéro de téléphone:</strong> {phone}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Lieu de prise en charge:</strong> {location || 'Non spécifié'}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date de début:</strong> {formatDate(startDate)}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Date de fin:</strong> {formatDate(endDate)}</Text>
              </Row>
              <Row style={summaryRow}>
                <Text style={summaryItem}><strong>Âge du conducteur:</strong> {driverAge ? `${driverAge} ans` : 'Non spécifié'}</Text>
              </Row>
            </Section>

            {/* Additional Information */}
            <Section style={infoSection}>
              <Heading style={infoTitle}>📊 Informations Supplémentaires:</Heading>
              <Text style={infoDetail}><strong>Durée estimée:</strong> {estimatedDays ? `${estimatedDays} jours` : 'Non spécifiée'}</Text>
              <Text style={infoDetail}><strong>Budget total estimé:</strong> {totalBudget ? `${totalBudget} EUR` : 'À calculer'}</Text>
            </Section>

            <Hr style={divider} />

            {/* Action Items */}
            <Section style={actionSection}>
              <Heading style={actionTitle}>⚡ Actions Requises:</Heading>
              <Text style={listItem}>1. Vérifier la disponibilité du véhicule</Text>
              <Text style={listItem}>2. Contacter le client au {phone}</Text>
              <Text style={listItem}>3. Confirmer le prix et les conditions</Text>
              <Text style={listItem}>4. Préparer le contrat de location</Text>
            </Section>

            <Text style={urgentNote}>
              Merci de traiter cette demande dans les plus brefs délais.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Revolution Travel & Services - Location de Voitures au Cameroun
            </Text>
            <Text style={footerText}>
              Téléphone: +237 677 916 832 | Email: p.revolutiontravel@yahoo.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CarRentalRequestEmail;

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

const infoSection = {
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '20px 0',
};

const infoTitle = {
  color: '#334155',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoDetail = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 6px 0',
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

const urgentNote = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
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
