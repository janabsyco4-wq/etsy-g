// Create headers in Google Sheet
require('dotenv').config();
const { google } = require('googleapis');

async function createHeaders() {
    try {
        console.log('🔧 Creating headers in Google Sheet...\n');
        
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID.trim();
        
        const headers = [
            'Timestamp',
            'Original Title',
            'Optimized Title',
            'Original Description',
            'Optimized Description',
            'Original Category',
            'Optimized Category',
            'Original Tags',
            'Optimized Tags',
            'Original Materials',
            'Optimized Materials',
            'Price',
            'Quantity',
            'SKU',
            'AI Improvements',
            'SEO Score',
            'Keyword Suggestions',
            'Market Insights'
        ];
        
        console.log('📝 Writing headers...');
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1:R1',
            valueInputOption: 'RAW',
            resource: {
                values: [headers]
            }
        });
        
        console.log('🎨 Formatting headers (blue background, white bold text)...');
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [{
                    repeatCell: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: 1
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: {
                                    red: 0.4,
                                    green: 0.43,
                                    blue: 0.95
                                },
                                textFormat: {
                                    foregroundColor: {
                                        red: 1.0,
                                        green: 1.0,
                                        blue: 1.0
                                    },
                                    fontSize: 11,
                                    bold: true
                                },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                }]
            }
        });
        
        console.log('\n✅ Headers created successfully!');
        console.log('\n📊 Check your sheet:');
        console.log(`https://docs.google.com/spreadsheets/d/${spreadsheetId}\n`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createHeaders();
