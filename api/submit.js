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
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log('⚠️  GEMINI_API_KEY not configured, using fallback optimization');
            return fallbackOptimization(formData);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const prompt = `You are an Etsy SEO expert. Optimize this product listing.

Original:
Title: ${formData.title}
Description: ${formData.description}
Category: ${formData.category}
Tags: ${formData.tags}
Materials: ${formData.materials}

Return ONLY a single JSON object (no array, no markdown):
{"title":"SEO title max 140 chars","description":"detailed description","tags":["tag1","tag2","tag3"],"materials":["mat1","mat2"],"category":"category","improvements":"what changed"}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        
        // Remove markdown code blocks
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Try to parse as JSON
        let optimized;
        try {
            const parsed = JSON.parse(text);
            // If it's an array, take first element
            optimized = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
            // Try to extract JSON object
            const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
            if (!jsonMatch) {
                console.log('⚠️  AI response invalid, using fallback');
                return fallbackOptimization(formData);
            }
            optimized = JSON.parse(jsonMatch[0]);
        }
        
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
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        console.log('⚠️  Using fallback optimization');
        return fallbackOptimization(formData);
    }
}

// Fallback optimization (rule-based)
function fallbackOptimization(formData) {
    const title = formData.title.trim();
    const description = formData.description.trim();
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    const materials = formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(m => m) : [];
    
    return {
        title: `${title} - Handmade ${formData.category || 'Product'}`.substring(0, 140),
        description: `${description}\n\n✨ Features:\n- High quality ${materials.join(', ')}\n- Perfect for gifts\n- Handmade with care\n\n📦 Fast shipping available!`,
        tags: tags.length > 0 ? tags.slice(0, 13) : ['handmade', formData.category?.toLowerCase() || 'product', 'gift'],
        materials: materials.length > 0 ? materials : ['handmade'],
        category: formData.category || 'Home & Living',
        improvements: 'Basic SEO optimization applied (AI unavailable)',
        price: formData.price,
        quantity: formData.quantity,
        sku: formData.sku
    };
}

// Save to Google Sheets
async function saveToGoogleSheets(originalData, optimizedData) {
    try {
        console.log('DEBUG: GOOGLE_SHEET_ID =', process.env.GOOGLE_SHEET_ID);
        console.log('DEBUG: GOOGLE_CREDENTIALS exists?', !!process.env.GOOGLE_CREDENTIALS);
        
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
