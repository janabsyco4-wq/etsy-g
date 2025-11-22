// Simple test without AI
require('dotenv').config();
const { google } = require('googleapis');
const { Resend } = require('resend');

console.log('🧪 Testing Core Functionality (Without AI)...\n');

testGoogleSheets();

async function testGoogleSheets() {
    try {
        console.log('1️⃣ Testing Google Sheets...');
        
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        
        console.log('   Checking sheet access...');
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
        console.log('   ✅ Sheet accessible:', sheetInfo.data.properties.title);
        
        console.log('   Writing test row...');
        const testRow = [
            new Date().toISOString(),
            'TEST Product',
            'TEST Optimized Product - Handmade Gift',
            'Test description',
            'Optimized test description with SEO keywords',
            'Home & Living',
            'Home & Living',
            'handmade, gift, test',
            'handmade, gift, test, ceramic',
            'ceramic, glaze',
            'ceramic, glaze',
            '29.99',
            '10',
            'TEST-001',
            'Fallback optimization applied'
        ];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:O',
            valueInputOption: 'RAW',
            resource: {
                values: [testRow]
            }
        });
        
        console.log('   ✅ Test row written successfully!');
        console.log('   📊 Check your sheet:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        
        console.log('\n2️⃣ Testing Email...');
        await testEmail();
        
    } catch (error) {
        console.log('   ❌ Error:', error.message);
        if (error.message.includes('permission') || error.message.includes('403')) {
            console.log('\n   💡 SOLUTION: Share your Google Sheet with:');
            console.log('      etsy-bot@etsy-automation-479018.iam.gserviceaccount.com');
            console.log('      Give "Editor" access');
        }
    }
}

async function testEmail() {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('   Sending test email to:', process.env.NOTIFICATION_EMAIL);
        
        const result = await resend.emails.send({
            from: 'Etsy Automation <onboarding@resend.dev>',
            to: process.env.NOTIFICATION_EMAIL,
            subject: '✅ Etsy Automation - System Test',
            html: `
                <h2>🎉 System Test Successful!</h2>
                <p>Your Etsy Automation is working!</p>
                <ul>
                    <li>✅ Google Sheets integration working</li>
                    <li>✅ Email notifications working</li>
                    <li>⚠️  AI optimization using fallback (Gemini API needs setup)</li>
                </ul>
                <p><strong>You can now use the form!</strong></p>
                <p>The system will optimize listings with basic SEO rules.</p>
            `
        });
        
        console.log('   ✅ Email sent successfully!');
        console.log('   📧 Email ID:', result.id);
        console.log('   📬 Check inbox:', process.env.NOTIFICATION_EMAIL);
        
        console.log('\n✅ CORE SYSTEM WORKING! 🎉');
        console.log('\n📝 Summary:');
        console.log('   ✅ Google Sheets: Working');
        console.log('   ✅ Email: Working');
        console.log('   ⚠️  AI: Using fallback optimization');
        console.log('\n🚀 Your app is ready to use!');
        console.log('   Deploy to Vercel and test the form.');
        
    } catch (error) {
        console.log('   ❌ Email Error:', error.message);
        console.log('\n⚠️  Email failed but core system works!');
        console.log('   You can still use the app without email notifications.');
    }
}
