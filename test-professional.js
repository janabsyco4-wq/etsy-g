// Professional product test
const https = require('https');

const professionalProduct = {
    title: 'Leather Wallet',
    description: 'Nice wallet made from leather. Good quality.',
    category: 'Accessories',
    tags: 'wallet, leather, mens',
    materials: 'leather',
    price: 45.00,
    quantity: 25,
    sku: 'LW-2025-001'
};

console.log('🧪 Testing Professional Product Optimization...\n');
console.log('Original Product:');
console.log('Title:', professionalProduct.title);
console.log('Description:', professionalProduct.description);
console.log('Tags:', professionalProduct.tags);
console.log('\n📤 Sending to Vercel...\n');

const postData = JSON.stringify(professionalProduct);

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
                console.log('✨ AI has optimized your product!');
                console.log('📊 Check Google Sheet for full details');
                console.log('📧 Check email for complete optimization report');
            } else {
                console.log('❌ ERROR:', response.error);
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
