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
    Link,
} from '@react-email/components';

interface PriceUpdateEmailProps {
    fullName: string;
    bookingId: string;
    bookingType: string;
    newPrice: number;
    currency: string;
    bookingDetails: any;
}

export default function PriceUpdateEmail({
    fullName,
    bookingId,
    bookingType,
    newPrice,
    currency,
    bookingDetails,
}: PriceUpdateEmailProps) {
    const formatCurrency = (amount: number, curr: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: curr || 'EUR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getBookingTypeLabel = (type: string) => {
        switch (type) {
            case 'FLIGHT': return 'Vol';
            case 'HOTEL': return 'Hôtel';
            case 'CAR_RENTAL': return 'Location de voiture';
            default: return type;
        }
    };

    return (
        <Html>
            <Head />
            <Preview>Mise à jour du prix de votre réservation - Revolution Travel Services</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={headerText}>💳 Mise à Jour de Tarif</Text>
                        <Text style={headerSubtext}>Revolution Travel Services</Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={section}>
                        <Text style={greeting}>Bonjour <strong>{fullName}</strong>,</Text>

                        <Text style={paragraph}>
                            Nous vous informons qu&apos;une mise à jour a été effectuée sur le tarif de votre réservation <strong>#{bookingId.slice(-8).toUpperCase()}</strong>.
                        </Text>

                        {/* Price Highlight */}
                        <Section style={priceHighlightSection}>
                            <Text style={priceLabel}>Nouveau Tarif Total</Text>
                            <Text style={priceAmount}>{formatCurrency(newPrice, currency)}</Text>
                        </Section>

                        {/* Booking Summary */}
                        <Section style={summarySection}>
                            <Heading style={summaryTitle}>📋 Récapitulatif de la réservation</Heading>

                            <Row style={summaryRow}>
                                <Column style={labelColumn}><Text style={label}>Type:</Text></Column>
                                <Column style={valueColumn}><Text style={value}>{getBookingTypeLabel(bookingType)}</Text></Column>
                            </Row>

                            {bookingType === 'FLIGHT' && bookingDetails.selectedFlight && (
                                <>
                                    <Row style={summaryRow}>
                                        <Column style={labelColumn}><Text style={label}>Itinéraire:</Text></Column>
                                        <Column style={valueColumn}>
                                            <Text style={value}>
                                                {bookingDetails.selectedFlight.departure.airport} → {bookingDetails.selectedFlight.arrival.airport}
                                            </Text>
                                        </Column>
                                    </Row>
                                    <Row style={summaryRow}>
                                        <Column style={labelColumn}><Text style={label}>Départ:</Text></Column>
                                        <Column style={valueColumn}>
                                            <Text style={value}>{formatDate(bookingDetails.selectedFlight.departure.time)}</Text>
                                        </Column>
                                    </Row>
                                </>
                            )}

                            {bookingType !== 'FLIGHT' && (
                                <>
                                    {Object.entries(bookingDetails)
                                        .filter(([key, val]) => typeof val !== 'object' && val !== null && key !== 'id')
                                        .slice(0, 5)
                                        .map(([key, val]) => (
                                            <Row key={key} style={summaryRow}>
                                                <Column style={labelColumn}>
                                                    <Text style={label}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
                                                </Column>
                                                <Column style={valueColumn}>
                                                    <Text style={value}>{String(val)}</Text>
                                                </Column>
                                            </Row>
                                        ))
                                    }
                                </>
                            )}
                        </Section>

                        <Text style={paragraph}>
                            Si ce nouveau tarif vous convient, vous pouvez procéder au paiement pour confirmer définitivement votre réservation. Notre équipe reste à votre disposition pour toute question.
                        </Text>

                        <Hr style={divider} />

                        {/* Support */}
                        <Section style={supportSection}>
                            <Text style={supportText}>
                                Besoin d&apos;aide ? Contactez-nous directement :
                            </Text>
                            <Row>
                                <Column>
                                    <Link href="tel:+237677916832" style={supportLink}>📞 +237 677 916 832</Link>
                                </Column>
                                <Column>
                                    <Link href="mailto:p.revolutiontravel@yahoo.com" style={supportLink}>📧 Nous écrire</Link>
                                </Column>
                            </Row>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Revolution Travel Services - Votre partenaire voyage au Cameroun
                        </Text>
                        <Text style={footerSmall}>
                            Cameroun | p.revolutiontravel@yahoo.com | +237 677 916 832
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
    padding: '0 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
    backgroundColor: '#2563eb',
    padding: '40px 30px',
    textAlign: 'center' as const,
};

const headerText = {
    color: '#ffffff',
    fontSize: '28px',
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
    padding: '40px 35px',
};

const greeting = {
    color: '#1f2937',
    fontSize: '18px',
    margin: '0 0 20px 0',
};

const paragraph = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
};

const priceHighlightSection = {
    backgroundColor: '#f8fafc',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    margin: '30px 0',
    border: '1px solid #e2e8f0',
};

const priceLabel = {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 10px 0',
};

const priceAmount = {
    color: '#1e40af',
    fontSize: '42px',
    fontWeight: 'bold',
    margin: '0',
};

const summarySection = {
    margin: '32px 0',
};

const summaryTitle = {
    color: '#111827',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
};

const summaryRow = {
    marginBottom: '12px',
};

const labelColumn = {
    width: '140px',
    verticalAlign: 'top' as const,
};

const valueColumn = {
    verticalAlign: 'top' as const,
};

const label = {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
};

const value = {
    color: '#111827',
    fontSize: '14px',
    margin: '0',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
};

const supportSection = {
    textAlign: 'center' as const,
};

const supportText = {
    color: '#4b5563',
    fontSize: '14px',
    margin: '0 0 16px 0',
};

const supportLink = {
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '0 10px',
};

const footer = {
    textAlign: 'center' as const,
    padding: '32px 30px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
};

const footerText = {
    color: '#374151',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
};

const footerSmall = {
    color: '#6b7280',
    fontSize: '12px',
    margin: '0',
};
