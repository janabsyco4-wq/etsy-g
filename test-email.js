// Test email sending
require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🧪 Testing Email Sending...\n');
console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
console.log('Email:', process.env.NOTIFICATION_EMAIL);
console.log('\nSending test email...\n');

resend.emails.send({
    from: 'Etsy Automation <onboarding@resend.dev>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'Test Email - Etsy Automation',
    html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
}).then(result => {
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
}).catch(error => {
    console.log('❌ Email failed!');
    console.log('Error:', error.message);
    console.log('Details:', error);
});
