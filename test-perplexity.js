// Test script to manually trigger Perplexity API and show output
import fetch from 'node-fetch';

async function testPerplexity() {
  const cultureTag = "Peruvian";
  console.log(`🔍 Testing Perplexity API for: ${cultureTag}`);
  
  const prompt = `Give me a JSON list of the 5 most culturally authentic but healthy meals from ${cultureTag} cuisine. Include common cooking techniques, top healthy ingredients, and key nutrient info.

Please respond with a JSON object in this exact format:
{
  "culture": "${cultureTag}",
  "meals": [
    {
      "name": "Dish Name",
      "description": "Brief description of the dish",
      "healthy_mods": ["modification 1", "modification 2"],
      "macros": {
        "calories": 420,
        "protein_g": 25,
        "carbs_g": 35,
        "fat_g": 18
      }
    }
  ],
  "styles": ["stew", "grill", "slow-cook"],
  "key_ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "cooking_techniques": ["technique 1", "technique 2"],
  "health_benefits": ["benefit 1", "benefit 2"]
}`;

  try {
    console.log('📡 Sending request to Perplexity...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a cultural cuisine expert with deep knowledge of traditional healthy foods from around the world. Provide accurate, authentic information about cultural cuisines in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📝 Raw Perplexity response:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n🔍 Extracted content:');
    const content = data.choices[0].message.content;
    console.log(content);
    
    console.log('\n📊 Parsed JSON:');
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanedContent);
    console.log(JSON.stringify(parsedData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPerplexity();