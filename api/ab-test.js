// A/B Testing - Generate multiple variations
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        const formData = req.body;
        
        if (!formData || !formData.title) {
            throw new Error('Invalid form data');
        }
        
        console.log('🧪 Generating A/B test variations...');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const prompt = `You are an expert Etsy SEO consultant. Create 3 DIFFERENT optimization variations for A/B testing.

ORIGINAL LISTING:
Title: ${formData.title}
Description: ${formData.description}
Category: ${formData.category}
Tags: ${formData.tags}
Materials: ${formData.materials}
Price: $${formData.price}

Create 3 variations with different strategies:

VARIATION A - AGGRESSIVE SEO:
- Maximum keywords, all 13 tags
- SEO-heavy title (140 chars)
- Keyword-dense description
- Focus: Search visibility

VARIATION B - BALANCED:
- Natural language with SEO
- Moderate keywords (10 tags)
- Storytelling + features
- Focus: Conversion + SEO

VARIATION C - CUSTOMER-FOCUSED:
- Benefit-driven, emotional
- Fewer but powerful tags (8 tags)
- Story-first description
- Focus: Customer connection

Return ONLY valid JSON array with 3 objects (no markdown):
[
  {
    "variation": "A",
    "strategy": "Aggressive SEO",
    "title": "SEO-optimized title",
    "description": "keyword-rich description",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13"],
    "seoScore": 95,
    "pros": ["High search visibility", "More keyword coverage"],
    "cons": ["May sound robotic", "Less emotional appeal"],
    "bestFor": "New shops needing visibility"
  },
  {
    "variation": "B",
    "strategy": "Balanced",
    "title": "balanced title",
    "description": "balanced description",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
    "seoScore": 85,
    "pros": ["Good SEO + readability", "Versatile approach"],
    "cons": ["Not specialized", "Middle ground"],
    "bestFor": "Most sellers"
  },
  {
    "variation": "C",
    "strategy": "Customer-Focused",
    "title": "emotional title",
    "description": "story-driven description",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
    "seoScore": 75,
    "pros": ["Strong emotional connection", "Higher conversion"],
    "cons": ["Lower search visibility", "Fewer keywords"],
    "bestFor": "Established shops with traffic"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        
        // Remove markdown code blocks
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Parse JSON
        let variations;
        try {
            variations = JSON.parse(text);
            if (!Array.isArray(variations)) {
                throw new Error('Response is not an array');
            }
        } catch (e) {
            // Try to extract JSON array
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }
            variations = JSON.parse(jsonMatch[0]);
        }
        
        // Add original data to each variation
        variations = variations.map(v => ({
            ...v,
            price: formData.price,
            quantity: formData.quantity,
            sku: formData.sku,
            category: formData.category,
            materials: formData.materials
        }));
        
        return res.status(200).json({
            success: true,
            variations,
            originalTitle: formData.title,
            message: '3 variations generated for A/B testing'
        });
        
    } catch (error) {
        console.error('A/B Test Error:', error);
        return res.status(500).json({ 
            error: error.message || 'A/B test generation failed',
            details: error.toString()
        });
    }
};
