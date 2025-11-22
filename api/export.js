// Export Google Sheets data to CSV
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
        
        // Get all data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:R'
        });
        
        const rows = response.data.values || [];
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }
        
        // Convert to CSV
        const csv = rows.map(row => 
            row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Send as downloadable CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="etsy-listings.csv"');
        return res.status(200).send(csv);
        
    } catch (error) {
        console.error('Export Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Export failed'
        });
    }
};
