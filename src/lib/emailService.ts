import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password (not regular password)
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Revolution Travel Services" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || process.env.GMAIL_USER,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Organization': 'Revolution Travel Services',
        'X-Mailer': 'Revolution Travel Services Website',
        'List-Unsubscribe': '<mailto:unsubscribe@revolutiontravel.cm>',
      }
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Alternative configuration for other SMTP providers
export const createCustomTransporter = (config: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}) => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};
