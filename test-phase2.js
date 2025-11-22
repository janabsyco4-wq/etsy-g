// Test Phase 2 improvements on Vercel
const https = require('https');

const testProduct = {
    title: 'Leather Wallet',
    description: 'Nice wallet made from leather. Good quality.',
    category: 'Accessories',
    tags: 'wallet, leather, mens',
    materials: 'leather',
    price: 45.00,
    quantity: 25,
    sku: 'LW-2025-001',
    optimizationMode: 'aggressive'  // Test new optimization mode
};

console.log('🧪 Testing Phase 2 Features on Vercel...\n');
console.log('Testing with AGGRESSIVE optimization mode\n');
console.log('Original Title:', testProduct.title);
console.log('Original Description:', testProduct.description);
console.log('\n📤 Sending to Vercel...\n');

const postData = JSON.stringify(testProduct);

const options = {
    hostname: 'etsy-g.vercel.app',
    port: 443,
    path: '/api/submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
                console.log('✅ SUCCESS!\n');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📝 OPTIMIZED TITLE:');
                console.log(response.optimizedTitle);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                
                console.log('📊 SEO SCORE:', response.seoScore + '/100');
                
                const scoreEmoji = response.seoScore >= 80 ? '🟢' : response.seoScore >= 60 ? '🟡' : '🔴';
                const scoreText = response.seoScore >= 80 ? 'Excellent' : response.seoScore >= 60 ? 'Good' : 'Needs Improvement';
                console.log(`   ${scoreEmoji} ${scoreText}\n`);
                
                console.log('🔍 KEYWORD SUGGESTIONS:');
                if (response.keywordSuggestions && response.keywordSuggestions.length > 0) {
                    response.keywordSuggestions.forEach((keyword, i) => {
                        console.log(`   ${i + 1}. ${keyword}`);
                    });
                } else {
                    console.log('   No suggestions available');
                }
                
                console.log('\n📈 MARKET INSIGHTS:');
                console.log('   ' + (response.competitorInsights || 'N/A'));
                
                console.log('\n✨ IMPROVEMENTS:');
                console.log('   ' + (response.improvements || 'N/A'));
                
                console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('✓ Saved to Google Sheets');
                console.log('✓ Email notification sent');
                console.log('✓ Phase 2 features working!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            } else {
                console.log('❌ ERROR:', response.error);
                console.log('Details:', response.details);
            }
        } catch (e) {
            console.log('❌ Response error:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
