// Test script for API functionality
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const { Resend } = require('resend');

console.log('🧪 Testing Etsy Automation API...\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...');
const requiredEnvVars = [
    'GEMINI_API_KEY',
    'GOOGLE_CREDENTIALS',
    'GOOGLE_SHEET_ID',
    'RESEND_API_KEY',
    'NOTIFICATION_EMAIL'
];

let envCheckPassed = true;
requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName}: Set`);
    } else {
        console.log(`   ❌ ${varName}: Missing`);
        envCheckPassed = false;
    }
});

if (!envCheckPassed) {
    console.log('\n❌ Environment variables missing! Check .env file');
    process.exit(1);
}

console.log('\n2️⃣ Testing Gemini AI...');
testGemini();

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const testData = {
            title: 'Handmade Ceramic Mug',
            description: 'Beautiful handmade ceramic coffee mug',
            category: 'Home & Living',
            tags: 'ceramic, handmade, mug',
            materials: 'ceramic, glaze'
        };
        
        const prompt = `You are an Etsy SEO expert. Optimize this product listing.

Original Data:
- Title: ${testData.title}
- Description: ${testData.description}
- Category: ${testData.category}
- Tags: ${testData.tags}
- Materials: ${testData.materials}

Provide optimized versions in JSON format:
{
  "title": "SEO-optimized title",
  "description": "Detailed description",
  "tags": ["tag1", "tag2", "tag3"],
  "materials": ["material1", "material2"],
  "category": "Category",
  "improvements": "What was improved"
}`;

        console.log('   Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log('   ✅ Gemini API Response received');
        console.log('   Response preview:', text.substring(0, 100) + '...');
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const optimized = JSON.parse(jsonMatch[0]);
            console.log('   ✅ JSON parsing successful');
            console.log('   Optimized Title:', optimized.title);
        } else {
            console.log('   ⚠️  No JSON found in response');
        }
        
        console.log('\n3️⃣ Testing Google Sheets...');
        await testGoogleSheets(testData);
        
    } catch (error) {
        console.log('   ❌ Gemini API Error:', error.message);
        process.exit(1);
    }
}

async function testGoogleSheets(testData) {
    try {
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
            'TEST - ' + testData.title,
            'TEST - Optimized Title',
            testData.description,
            'Optimized description',
            testData.category,
            'Optimized category',
            testData.tags,
            'tag1, tag2, tag3',
            testData.materials,
            'material1, material2',
            '29.99',
            '10',
            'TEST-SKU',
            'Test improvements'
        ];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:O',
            valueInputOption: 'RAW',
            resource: {
                values: [testRow]
            }
        });
        
        console.log('   ✅ Test row written successfully');
        console.log('   Check your sheet:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        
        console.log('\n4️⃣ Testing Email (Resend)...');
        await testEmail();
        
    } catch (error) {
        console.log('   ❌ Google Sheets Error:', error.message);
        if (error.message.includes('permission')) {
            console.log('   💡 Make sure you shared the sheet with:');
            console.log('      etsy-bot@etsy-automation-479018.iam.gserviceaccount.com');
        }
        process.exit(1);
    }
}

async function testEmail() {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('   Sending test email...');
        const result = await resend.emails.send({
            from: 'Etsy Automation <onboarding@resend.dev>',
            to: process.env.NOTIFICATION_EMAIL,
            subject: '✅ Test Email - Etsy Automation',
            html: `
                <h2>🎉 Test Email Successful!</h2>
                <p>Your Etsy Automation system is working correctly.</p>
                <p><strong>All systems operational:</strong></p>
                <ul>
                    <li>✅ Gemini AI</li>
                    <li>✅ Google Sheets</li>
                    <li>✅ Email Notifications</li>
                </ul>
                <p>You can now use the form to create optimized listings!</p>
            `
        });
        
        console.log('   ✅ Email sent successfully');
        console.log('   Email ID:', result.id);
        console.log('   Check your inbox:', process.env.NOTIFICATION_EMAIL);
        
        console.log('\n✅ ALL TESTS PASSED! 🎉');
        console.log('\nYour system is ready to use!');
        console.log('Deploy URL: https://etsy-g.vercel.app (or your Vercel URL)');
        
    } catch (error) {
        console.log('   ❌ Email Error:', error.message);
        console.log('   ⚠️  Email is optional - system will still work');
        console.log('\n✅ Core functionality working!');
    }
}
