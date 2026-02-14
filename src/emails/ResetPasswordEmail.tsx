import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
    Img,
} from '@react-email/components';
import React from 'react';

interface ResetPasswordEmailProps {
    resetLink: string;
    userName?: string;
}

const ResetPasswordEmail = ({
    resetLink,
    userName,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Réinitialisez votre mot de passe - Revolution Travel Services</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={headerText}>Revolution Travel Services</Heading>
                    </Section>

                    {/* Main Content */}
                    <Section style={section}>
                        <Heading style={greeting}>Bonjour {userName || 'cher utilisateur'},</Heading>
                        <Text style={text}>
                            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Revolution Travel Services.
                        </Text>
                        <Text style={text}>
                            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe restera inchangé.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={resetLink}>
                                Réinitialiser mon mot de passe
                            </Button>
                        </Section>

                        <Text style={text}>
                            Ou copiez et collez ce lien dans votre navigateur :
                            <br />
                            <a href={resetLink} style={link}>{resetLink}</a>
                        </Text>

                        <Hr style={divider} />

                        <Text style={footerNote}>
                            Ce lien expirera dans 1 heure pour votre sécurité.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Revolution Travel & Services - Votre partenaire voyage de confiance
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

export default ResetPasswordEmail;

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
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
    backgroundColor: '#2563eb',
    padding: '30px',
    borderRadius: '8px 8px 0 0',
    textAlign: 'center' as const,
};

const headerText = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '900',
    margin: '0',
    letterSpacing: '-0.02em',
};

const section = {
    padding: '40px 30px',
};

const greeting = {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
};

const text = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
};

const link = {
    color: '#2563eb',
    textDecoration: 'underline',
    fontSize: '14px',
    wordBreak: 'break-all' as const,
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
};

const footerNote = {
    color: '#9ca3af',
    fontSize: '14px',
    textAlign: 'center' as const,
    fontStyle: 'italic',
};

const footer = {
    textAlign: 'center' as const,
    padding: '20px 30px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: '0 0 8px 8px',
};

const footerText = {
    color: '#6b7280',
    fontSize: '12px',
    margin: '4px 0',
};
