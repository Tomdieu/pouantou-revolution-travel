import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface FlightSearchClientConfirmationEmailProps {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  price: string;
}

export default function FlightSearchClientConfirmationEmail({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  price,
}: FlightSearchClientConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre demande de vol - Pouantou Revolution Travel</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Heading style={h1}>Confirmation de votre demande</Heading>
            <Text style={text}>Bonjour,</Text>
            <Text style={text}>
              Nous avons bien reçu votre demande de réservation de vol.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading style={h2}>Détails de votre recherche</Heading>
            <Text style={text}>
              Trajet: {originLocationCode} → {destinationLocationCode}
            </Text>
            <Text style={text}>Date de départ: {departureDate}</Text>
            <Text style={text}>Prix: {price}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={text}>
              Notre équipe vous contactera dans les plus brefs délais pour finaliser votre réservation.
            </Text>
            <Text style={text}>
              Merci de votre confiance,
            </Text>
            <Text style={text}>
              L'équipe Pouantou Revolution Travel
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const section = {
  margin: '24px 0',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '24px 0',
};

const h2 = {
  color: '#444',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '24px',
};

const hr = {
  borderColor: '#ddd',
  margin: '20px 0',
};
