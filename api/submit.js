const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const { Resend } = require('resend');

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse JSON body
        const formData = req.body;
        
        if (!formData || !formData.title) {
            throw new Error('Invalid form data');
        }
        
        // Step 1: AI Optimization
        console.log('Step 1: Optimizing with AI...');
        const optimizedData = await optimizeWithAI(formData);
        
        // Step 2: Save to Google Sheets
        console.log('Step 2: Saving to Google Sheets...');
        await saveToGoogleSheets(formData, optimizedData);
        
        // Step 3: Send Email Notification
        console.log('Step 3: Sending email notification...');
        await sendEmailNotification(optimizedData);
        
        return res.status(200).json({
            success: true,
            optimizedTitle: optimizedData.title,
            message: 'Product optimized and saved successfully!',
            etsyUrl: '#', // Placeholder since we're not using Etsy
            listingId: Date.now()
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Internal server error',
            details: error.toString()
        });
    }
};

// AI Optimization using Google Gemini
async function optimizeWithAI(formData) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are an Etsy SEO expert. Optimize this product listing for maximum visibility and sales.

Original Data:
- Title: ${formData.title}
- Description: ${formData.description}
- Category: ${formData.category}
- Tags: ${formData.tags}
- Materials: ${formData.materials}

Please provide optimized versions in JSON format:
{
  "title": "SEO-optimized title (max 140 chars, include key search terms)",
  "description": "Compelling, detailed description with SEO keywords, benefits, and usage",
  "tags": ["tag1", "tag2", ...] (13 relevant tags),
  "materials": ["material1", "material2", ...],
  "category": "Best Etsy category path",
  "improvements": "Brief note on what was improved"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
    }
    
    const optimized = JSON.parse(jsonMatch[0]);
    
    return {
        title: optimized.title,
        description: optimized.description,
        tags: optimized.tags,
        materials: optimized.materials,
        category: optimized.category,
        improvements: optimized.improvements,
        price: formData.price,
        quantity: formData.quantity,
        sku: formData.sku
    };
}

// Save to Google Sheets
async function saveToGoogleSheets(originalData, optimizedData) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        
        // Prepare row data
        const row = [
            new Date().toISOString(),
            originalData.title || '',
            optimizedData.title || '',
            originalData.description || '',
            optimizedData.description || '',
            originalData.category || '',
            optimizedData.category || '',
            originalData.tags || '',
            Array.isArray(optimizedData.tags) ? optimizedData.tags.join(', ') : '',
            originalData.materials || '',
            Array.isArray(optimizedData.materials) ? optimizedData.materials.join(', ') : '',
            originalData.price || '',
            originalData.quantity || '',
            originalData.sku || '',
            optimizedData.improvements || ''
        ];
        
        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:O',
            valueInputOption: 'RAW',
            resource: {
                values: [row]
            }
        });
    } catch (error) {
        console.error('Google Sheets Error:', error);
        throw new Error('Failed to save to Google Sheets: ' + error.message);
    }
}



// Send Email Notification
async function sendEmailNotification(optimizedData) {
    try {
        const recipientEmail = process.env.NOTIFICATION_EMAIL;
        
        await resend.emails.send({
            from: 'Etsy Automation <onboarding@resend.dev>',
            to: recipientEmail,
            subject: `✅ Product Optimized: ${optimizedData.title}`,
            html: `
                <h2>🎉 Your product has been optimized with AI!</h2>
                <p><strong>Optimized Title:</strong> ${optimizedData.title}</p>
                <p><strong>Price:</strong> $${optimizedData.price}</p>
                <hr>
                <h3>Optimized Description:</h3>
                <p>${optimizedData.description}</p>
                <h3>Tags:</h3>
                <p>${Array.isArray(optimizedData.tags) ? optimizedData.tags.join(', ') : optimizedData.tags}</p>
                <h3>Materials:</h3>
                <p>${Array.isArray(optimizedData.materials) ? optimizedData.materials.join(', ') : optimizedData.materials}</p>
                <h3>AI Improvements:</h3>
                <p>${optimizedData.improvements}</p>
                <hr>
                <p><small>Data saved to Google Sheets</small></p>
            `
        });
    } catch (error) {
        console.error('Email Error:', error);
        // Don't throw - email is not critical
    }
}
