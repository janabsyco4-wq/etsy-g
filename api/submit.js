const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const axios = require('axios');
const FormData = require('form-data');
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
        // Parse form data
        const formData = await parseFormData(req);
        
        // Step 1: AI Optimization
        console.log('Step 1: Optimizing with AI...');
        const optimizedData = await optimizeWithAI(formData);
        
        // Step 2: Save to Google Sheets
        console.log('Step 2: Saving to Google Sheets...');
        await saveToGoogleSheets(formData, optimizedData);
        
        // Step 3: Create Etsy Listing
        console.log('Step 3: Creating Etsy listing...');
        const etsyListing = await createEtsyListing(optimizedData, formData.images);
        
        // Step 4: Send Email Notification
        console.log('Step 4: Sending email notification...');
        await sendEmailNotification(etsyListing, optimizedData);
        
        return res.status(200).json({
            success: true,
            listingId: etsyListing.listing_id,
            etsyUrl: etsyListing.url,
            optimizedTitle: optimizedData.title,
            message: 'Listing created successfully!'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Internal server error',
            details: error.response?.data || error.toString()
        });
    }
};

// Parse multipart form data
async function parseFormData(req) {
    // Note: In production, use a proper multipart parser like 'busboy' or 'formidable'
    // For now, this is a simplified version
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
        throw new Error('Content-Type must be multipart/form-data');
    }

    // Simplified parsing - in production use proper library
    return {
        title: req.body.title || '',
        description: req.body.description || '',
        category: req.body.category || '',
        tags: req.body.tags || '',
        materials: req.body.materials || '',
        price: parseFloat(req.body.price) || 0,
        quantity: parseInt(req.body.quantity) || 1,
        sku: req.body.sku || '',
        images: req.body.images || [] // Array of image buffers
    };
}

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
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Check if spreadsheet exists, create if not
    let sheetExists = true;
    try {
        await sheets.spreadsheets.get({ spreadsheetId });
    } catch (error) {
        sheetExists = false;
    }
    
    if (!sheetExists) {
        // Create new spreadsheet
        const newSheet = await sheets.spreadsheets.create({
            resource: {
                properties: { title: 'Etsy Listings' },
                sheets: [{
                    properties: { title: 'Listings' }
                }]
            }
        });
        spreadsheetId = newSheet.data.spreadsheetId;
    }
    
    // Prepare row data
    const row = [
        new Date().toISOString(),
        originalData.title,
        optimizedData.title,
        originalData.description,
        optimizedData.description,
        originalData.category,
        optimizedData.category,
        originalData.tags,
        optimizedData.tags.join(', '),
        originalData.materials,
        optimizedData.materials.join(', '),
        optimizedData.price,
        optimizedData.quantity,
        optimizedData.sku,
        optimizedData.improvements
    ];
    
    // Append to sheet
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Listings!A:O',
        valueInputOption: 'RAW',
        resource: {
            values: [row]
        }
    });
}

// Create Etsy Listing
async function createEtsyListing(optimizedData, images) {
    const etsyApiKey = process.env.ETSY_API_KEY;
    const etsyShopId = process.env.ETSY_SHOP_ID;
    const etsyAccessToken = process.env.ETSY_ACCESS_TOKEN;
    
    // Create draft listing
    const listingResponse = await axios.post(
        `https://openapi.etsy.com/v3/application/shops/${etsyShopId}/listings`,
        {
            quantity: optimizedData.quantity,
            title: optimizedData.title,
            description: optimizedData.description,
            price: optimizedData.price,
            who_made: 'i_did',
            when_made: '2020_2024',
            taxonomy_id: 1, // Update based on category
            tags: optimizedData.tags.slice(0, 13),
            materials: optimizedData.materials,
            shipping_profile_id: null, // Set your shipping profile
            return_policy_id: null, // Set your return policy
            type: 'physical',
            is_supply: false,
            should_auto_renew: true,
            state: 'draft'
        },
        {
            headers: {
                'x-api-key': etsyApiKey,
                'Authorization': `Bearer ${etsyAccessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    const listingId = listingResponse.data.listing_id;
    
    // Upload images
    for (let i = 0; i < Math.min(images.length, 10); i++) {
        const formData = new FormData();
        formData.append('image', images[i].buffer, images[i].originalname);
        formData.append('rank', i + 1);
        
        await axios.post(
            `https://openapi.etsy.com/v3/application/shops/${etsyShopId}/listings/${listingId}/images`,
            formData,
            {
                headers: {
                    'x-api-key': etsyApiKey,
                    'Authorization': `Bearer ${etsyAccessToken}`,
                    ...formData.getHeaders()
                }
            }
        );
    }
    
    // Publish listing (optional - remove if you want to keep as draft)
    await axios.put(
        `https://openapi.etsy.com/v3/application/listings/${listingId}`,
        { state: 'active' },
        {
            headers: {
                'x-api-key': etsyApiKey,
                'Authorization': `Bearer ${etsyAccessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    return {
        listing_id: listingId,
        url: `https://www.etsy.com/listing/${listingId}`,
        title: optimizedData.title
    };
}

// Send Email Notification
async function sendEmailNotification(etsyListing, optimizedData) {
    const recipientEmail = process.env.NOTIFICATION_EMAIL;
    
    await resend.emails.send({
        from: 'Etsy Automation <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `✅ New Etsy Listing Created: ${optimizedData.title}`,
        html: `
            <h2>🎉 Your Etsy listing has been published!</h2>
            <p><strong>Title:</strong> ${optimizedData.title}</p>
            <p><strong>Price:</strong> $${optimizedData.price}</p>
            <p><strong>Listing ID:</strong> ${etsyListing.listing_id}</p>
            <p><strong>View on Etsy:</strong> <a href="${etsyListing.url}">${etsyListing.url}</a></p>
            <hr>
            <h3>Optimized Description:</h3>
            <p>${optimizedData.description}</p>
            <h3>Tags:</h3>
            <p>${optimizedData.tags.join(', ')}</p>
            <h3>AI Improvements:</h3>
            <p>${optimizedData.improvements}</p>
        `
    });
}
