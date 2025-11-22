// Test Vercel deployment
const https = require('https');

const testData = {
    title: 'Handmade Ceramic Coffee Mug',
    description: 'Beautiful handcrafted ceramic mug perfect for coffee or tea. Made with love and care.',
    category: 'Home & Living',
    tags: 'ceramic, handmade, coffee mug, pottery, gift',
    materials: 'ceramic, glaze, clay',
    price: 29.99,
    quantity: 10,
    sku: 'MUG-TEST-001'
};

console.log('🧪 Testing Vercel Deployment...\n');
console.log('URL: https://etsy-g.vercel.app');
console.log('Sending test data...\n');

const postData = JSON.stringify(testData);

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
    console.log(`Status Code: ${res.statusCode}\n`);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
                console.log('✅ SUCCESS!\n');
                console.log('Optimized Title:', response.optimizedTitle);
                console.log('Message:', response.message);
                console.log('\n📊 Check your Google Sheet!');
                console.log('📧 Check your email:', 'shehroozking3@gmail.com');
            } else {
                console.log('❌ ERROR!\n');
                console.log('Error:', response.error);
                console.log('Details:', response.details);
            }
        } catch (e) {
            console.log('❌ Response parsing error:');
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
