// Get analytics data from Google Sheets
const { google } = require('googleapis');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID.trim();
        
        // Get all data (skip header row)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A2:R'
        });
        
        const rows = response.data.values || [];
        
        if (rows.length === 0) {
            return res.status(200).json({
                totalListings: 0,
                averageSeoScore: 0,
                topKeywords: [],
                categoryBreakdown: {},
                recentListings: []
            });
        }
        
        // Calculate analytics
        let totalSeoScore = 0;
        let seoScoreCount = 0;
        const keywords = {};
        const categories = {};
        const recentListings = [];
        
        rows.forEach((row, index) => {
            // SEO Score (column P, index 15)
            const seoScore = parseInt(row[15]) || 0;
            if (seoScore > 0) {
                totalSeoScore += seoScore;
                seoScoreCount++;
            }
            
            // Keywords (column Q, index 16)
            if (row[16]) {
                const keywordList = row[16].split(',').map(k => k.trim());
                keywordList.forEach(keyword => {
                    keywords[keyword] = (keywords[keyword] || 0) + 1;
                });
            }
            
            // Categories (column G, index 6)
            if (row[6]) {
                categories[row[6]] = (categories[row[6]] || 0) + 1;
            }
            
            // Recent listings (last 5)
            if (index < 5) {
                recentListings.push({
                    timestamp: row[0],
                    title: row[2], // Optimized title
                    seoScore: seoScore,
                    category: row[6]
                });
            }
        });
        
        // Top 10 keywords
        const topKeywords = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));
        
        return res.status(200).json({
            totalListings: rows.length,
            averageSeoScore: seoScoreCount > 0 ? Math.round(totalSeoScore / seoScoreCount) : 0,
            topKeywords,
            categoryBreakdown: categories,
            recentListings
        });
        
    } catch (error) {
        console.error('Analytics Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Analytics failed'
        });
    }
};
