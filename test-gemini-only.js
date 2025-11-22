require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        console.log('Testing Gemini API...\n');
        
        // Try different model names
        const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-pro'];
        
        for (const modelName of models) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello in one word');
                const response = result.response;
                const text = response.text();
                console.log(`✅ ${modelName} works! Response: ${text}\n`);
                break;
            } catch (error) {
                console.log(`❌ ${modelName} failed: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
