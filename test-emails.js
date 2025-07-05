import { render } from '@react-email/render';
import QuoteRequestEmail from '../src/emails/QuoteRequestEmail';
import ClientConfirmationEmail from '../src/emails/ClientConfirmationEmail';

// Test data
const testData = {
  fullName: 'Jean Dupont',
  phone: '+237 6 77 91 68 32',
  email: 'jean.dupont@example.com',
  departureCity: 'Douala',
  destination: 'Paris',
  departureDate: '2025-08-15',
  returnDate: '2025-08-25',
  passengers: '2',
  travelClass: 'economy',
  preferredAirline: 'air-france',
  budget: '800000-1000000',
  additionalInfo: 'Préférence pour un vol le matin et assistance pour les bagages.',
};

async function testEmails() {
  try {
    console.log('🧪 Testing React Email templates...\n');

    // Test agency email
    console.log('📧 Rendering agency email...');
    const agencyEmail = await render(QuoteRequestEmail(testData));
    console.log('✅ Agency email rendered successfully');
    console.log(`📏 Email length: ${agencyEmail.length} characters\n`);

    // Test client confirmation email
    console.log('📧 Rendering client confirmation email...');
    const clientEmail = await render(ClientConfirmationEmail({
      fullName: testData.fullName,
      destination: testData.destination,
      departureCity: testData.departureCity,
      departureDate: testData.departureDate,
      returnDate: testData.returnDate,
      passengers: testData.passengers,
    }));
    console.log('✅ Client confirmation email rendered successfully');
    console.log(`📏 Email length: ${clientEmail.length} characters\n`);

    console.log('🎉 All React Email templates working correctly!');
    
    // Optionally save to files for inspection
    const fs = require('fs');
    fs.writeFileSync('agency-email-test.html', agencyEmail);
    fs.writeFileSync('client-email-test.html', clientEmail);
    console.log('💾 Test emails saved as agency-email-test.html and client-email-test.html');

  } catch (error) {
    console.error('❌ Error testing emails:', error);
  }
}

testEmails();
