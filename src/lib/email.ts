import nodemailer from 'nodemailer';

// Create a transporter using SMTP with improved configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Add these settings to improve deliverability
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  rateLimit: 3,
  // Add DKIM and SPF support
  dkim: {
    domainName: process.env.DOMAIN_NAME || 'yourdomain.com',
    keySelector: 'default',
    privateKey: process.env.DKIM_PRIVATE_KEY || '',
    headerFieldNames: 'to:from:subject:date',
  },
});

export { transporter };



