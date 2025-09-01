import Groq from 'groq-sdk';
import OpenAI from 'openai';

class GroqService {
  constructor() {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    
    this.client = new Groq({
      apiKey: groqApiKey
    });

    // Initialize OpenAI client for GPT-5 fallback
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey
      });
      console.log('🚀 [GROQ SERVICE] OpenAI GPT-5 fallback initialized');
    } else {
      console.warn('⚠️ [GROQ SERVICE] No OpenAI API key - GPT-5 fallback unavailable');
    }
  }
  
  async extractStructuredRecipe(cleanedText, imageUrl = null) {
    console.log(`🧠 Using GPT-OSS-120B to extract structured recipe data`);
    
    const schema = {
      title: "string",
      category: "main|soup|dessert|snack|drink|other", 
      ingredients: [{"item": "string", "quantity": "string"}],
      instructions: ["step 1", "step 2", "..."],
      image_url: "string",
      notes: "string"
    };
    
    const prompt = `You are a recipe extraction specialist. Extract recipe information from the provided text and format it as JSON according to this EXACT schema:

${JSON.stringify(schema, null, 2)}

EXTRACTION RULES:
1. Extract the recipe title from the text
2. Categorize as: main, soup, dessert, snack, drink, or other
3. Extract ingredients with proper quantities (e.g., "2 cups flour", "1 tbsp salt")
4. Break instructions into clear, numbered steps
5. Use the provided image URL if available, otherwise set to null
6. Include any cooking tips or notes in the notes field

TEXT TO EXTRACT FROM:
${cleanedText}

${imageUrl ? `RECIPE IMAGE URL: ${imageUrl}` : 'NO IMAGE PROVIDED'}

IMPORTANT: 
- Return ONLY valid JSON, no additional text or explanation
- Ensure all fields are present in the response
- If information is missing, use reasonable defaults
- For quantities, be specific (e.g., "2 cups", "1 tablespoon", "1/2 teaspoon")

JSON Response:`;
    
    try {
      const completion = await this.client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {"role": "user", "content": prompt}
        ],
        temperature: 0,
        max_tokens: 2000
      });
      
      const response = completion.choices[0].message.content.trim();
      console.log(`🧠 GPT-OSS-120B response length: ${response.length} characters`);
      
      // Try to parse the JSON response
      try {
        const parsed = JSON.parse(response);
        console.log(`🧠 Successfully parsed JSON recipe: "${parsed.title}"`);
        return this.validateAndTransform(parsed, imageUrl);
      } catch (parseError) {
        console.log(`🧠 JSON parse failed, attempting to fix...`);
        return await this.retryExtraction(cleanedText, imageUrl, response);
      }
      
    } catch (error) {
      console.error('🚨 Groq API error:', error);
      
      // Check if it's a rate limit error (429 status or rate limit message)
      const isRateLimit = error.status === 429 || 
                         error.message?.includes('Rate limit') || 
                         error.message?.includes('rate_limit_exceeded');
      
      if (isRateLimit && this.openaiClient) {
        console.log('🔄 [GROQ FALLBACK] Rate limit detected, switching to GPT-5 dual fallback');
        return await this.extractWithGPT5Dual(cleanedText, imageUrl);
      }
      
      throw new Error(`Failed to extract recipe with AI: ${error.message}`);
    }
  }
  
  async retryExtraction(cleanedText, imageUrl, previousResponse) {
    console.log(`🔄 Retrying extraction with correction prompt`);
    
    const correctionPrompt = `The previous response was not valid JSON. Please fix this response to be valid JSON according to the recipe schema:

PREVIOUS RESPONSE:
${previousResponse}

Fix the JSON syntax errors and ensure it follows this exact schema:
{
  "title": "string",
  "category": "main|soup|dessert|snack|drink|other",
  "ingredients": [{"item": "string", "quantity": "string"}],
  "instructions": ["step 1", "step 2", "..."],
  "image_url": "string",
  "notes": "string"
}

Return ONLY the corrected JSON:`;
    
    try {
      const completion = await this.client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {"role": "user", "content": correctionPrompt}
        ],
        temperature: 0,
        max_tokens: 2000
      });
      
      const correctedResponse = completion.choices[0].message.content.trim();
      const parsed = JSON.parse(correctedResponse);
      
      console.log(`🔄 Successfully corrected and parsed JSON`);
      return this.validateAndTransform(parsed, imageUrl);
      
    } catch (error) {
      console.error('🚨 Retry failed:', error);
      // Return a basic fallback recipe structure
      return this.createFallbackRecipe(cleanedText, imageUrl);
    }
  }
  
  validateAndTransform(data, imageUrl) {
    console.log(`✅ Validating and transforming recipe data`);
    
    // Ensure all required fields exist
    const title = data.title || 'Extracted Recipe';
    const category = data.category || 'other';
    const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
    const instructions = Array.isArray(data.instructions) ? data.instructions : [];
    const notes = data.notes || '';
    
    // Transform to match your current meal structure
    const transformedRecipe = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      description: notes,
      image_url: imageUrl || data.image_url || null,
      ingredients: ingredients.map(ing => {
        if (typeof ing === 'string') {
          // Handle string format
          return {
            name: ing,
            display_text: ing,
            measurements: []
          };
        } else {
          // Handle object format
          const quantity = ing.quantity || '';
          const item = ing.item || ing.name || '';
          
          return {
            name: item,
            display_text: quantity ? `${quantity} ${item}` : item,
            measurements: quantity ? [{
              quantity: this.parseQuantity(quantity),
              unit: this.parseUnit(quantity)
            }] : []
          };
        }
      }),
      instructions: instructions.map((instruction, index) => {
        // Ensure instructions are properly formatted
        if (typeof instruction !== 'string') {
          return `Step ${index + 1}: ${String(instruction)}`;
        }
        return instruction.startsWith('Step') ? instruction : `Step ${index + 1}: ${instruction}`;
      }),
      nutrition_info: null,
      prep_time: 30, // Default
      cook_time: null,
      difficulty: "Medium",
      cuisine: "",
      diet: "",
      video_id: null,
      video_title: null,
      video_channel: null,
      category: category
    };
    
    console.log(`✅ Transformed recipe: "${transformedRecipe.title}" with ${transformedRecipe.ingredients.length} ingredients and ${transformedRecipe.instructions.length} steps`);
    
    return transformedRecipe;
  }
  
  parseQuantity(quantityString) {
    if (!quantityString) return 1;
    
    // Extract numeric part (including fractions)
    const numericMatch = quantityString.match(/(\d+(?:\.\d+)?(?:\/\d+)?)/);
    if (numericMatch) {
      const value = numericMatch[1];
      // Handle fractions
      if (value.includes('/')) {
        const [num, den] = value.split('/');
        return parseFloat(num) / parseFloat(den);
      }
      return parseFloat(value);
    }
    
    return 1;
  }
  
  parseUnit(quantityString) {
    if (!quantityString) return '';
    
    // Common unit patterns
    const unitPatterns = [
      'cups?', 'cup', 'c',
      'tablespoons?', 'tbsp', 'tbs',
      'teaspoons?', 'tsp', 'ts',
      'ounces?', 'oz',
      'pounds?', 'lbs?', 'lb',
      'grams?', 'g',
      'kilograms?', 'kg',
      'milliliters?', 'ml',
      'liters?', 'l',
      'pieces?', 'piece',
      'cloves?', 'clove',
      'slices?', 'slice'
    ];
    
    for (const pattern of unitPatterns) {
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      const match = quantityString.match(regex);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    
    return '';
  }
  
  async extractWithGPT5Dual(cleanedText, imageUrl = null) {
    console.log(`🚀 [GPT-5 DUAL] Running parallel extraction with mini and nano for comparison`);
    
    const schema = {
      title: "string",
      category: "main|soup|dessert|snack|drink|other", 
      ingredients: [{"item": "string", "quantity": "string"}],
      instructions: ["step 1", "step 2", "..."],
      image_url: "string",
      notes: "string"
    };
    
    const prompt = `You are a recipe extraction specialist. Extract recipe information from the provided text and format it as JSON according to this EXACT schema:

${JSON.stringify(schema, null, 2)}

EXTRACTION RULES:
1. Extract the recipe title from the text
2. Categorize as: main, soup, dessert, snack, drink, or other
3. Extract ingredients with proper quantities (e.g., "2 cups flour", "1 tbsp salt")
4. Break instructions into clear, numbered steps
5. Use the provided image URL if available, otherwise set to null
6. Include any cooking tips or notes in the notes field

TEXT TO EXTRACT FROM:
${cleanedText}

${imageUrl ? `RECIPE IMAGE URL: ${imageUrl}` : 'NO IMAGE PROVIDED'}

IMPORTANT: 
- Return ONLY valid JSON, no additional text or explanation
- Ensure all fields are present in the response
- If information is missing, use reasonable defaults
- For quantities, be specific (e.g., "2 cups", "1 tablespoon", "1/2 teaspoon")

JSON Response:`;

    try {
      // Call both GPT-5 models in parallel
      const [miniResponse, nanoResponse] = await Promise.allSettled([
        this.callGPT5Model('gpt-5-mini', prompt),
        this.callGPT5Model('gpt-5-nano', prompt)
      ]);

      // Log both responses for comparison
      console.log(`📊 [GPT-5 COMPARISON] Mini status: ${miniResponse.status}`);
      console.log(`📊 [GPT-5 COMPARISON] Nano status: ${nanoResponse.status}`);

      if (miniResponse.status === 'fulfilled') {
        const miniResult = miniResponse.value;
        console.log(`✅ [GPT-5 MINI] Success: "${miniResult.title}"`);
        console.log(`🔍 [GPT-5 MINI DEBUG] Full response:`, JSON.stringify(miniResult, null, 2));
      } else {
        console.log(`❌ [GPT-5 MINI] Failed:`, miniResponse.reason?.message || miniResponse.reason);
      }

      if (nanoResponse.status === 'fulfilled') {
        const nanoResult = nanoResponse.value;
        console.log(`✅ [GPT-5 NANO] Success: "${nanoResult.title}"`);
        console.log(`🔍 [GPT-5 NANO DEBUG] Full response:`, JSON.stringify(nanoResult, null, 2));
      } else {
        console.log(`❌ [GPT-5 NANO] Failed:`, nanoResponse.reason?.message || nanoResponse.reason);
      }

      // Compare outputs if both succeeded
      if (miniResponse.status === 'fulfilled' && nanoResponse.status === 'fulfilled') {
        const miniResult = miniResponse.value;
        const nanoResult = nanoResponse.value;
        
        console.log(`📋 [COMPARISON] Mini ingredients: ${miniResult.ingredients?.length || 0}`);
        console.log(`📋 [COMPARISON] Nano ingredients: ${nanoResult.ingredients?.length || 0}`);
        console.log(`📋 [COMPARISON] Mini instructions: ${miniResult.instructions?.length || 0}`);
        console.log(`📋 [COMPARISON] Nano instructions: ${nanoResult.instructions?.length || 0}`);
      }

      // Return GPT-5-mini result (preferred) or fallback to nano
      if (miniResponse.status === 'fulfilled') {
        console.log(`🎯 [GPT-5 DUAL] Returning GPT-5-mini result as primary`);
        return miniResponse.value;
      } else if (nanoResponse.status === 'fulfilled') {
        console.log(`🎯 [GPT-5 DUAL] Fallback to GPT-5-nano result`);
        return nanoResponse.value;
      } else {
        throw new Error('Both GPT-5 models failed');
      }

    } catch (error) {
      console.error('🚨 [GPT-5 DUAL] Both models failed:', error);
      return this.createFallbackRecipe(cleanedText, imageUrl);
    }
  }

  async callGPT5Model(model, prompt) {
    console.log(`🤖 [${model.toUpperCase()}] Starting extraction...`);
    
    const completion = await this.openaiClient.chat.completions.create({
      model: model, // gpt-5-mini or gpt-5-nano
      messages: [
        {"role": "user", "content": prompt}
      ],
      max_completion_tokens: 2000
    });
    
    const response = completion.choices[0].message.content.trim();
    console.log(`🤖 [${model.toUpperCase()}] Response length: ${response.length} characters`);
    
    // Parse JSON response
    const parsed = JSON.parse(response);
    return this.validateAndTransform(parsed, null);
  }

  createFallbackRecipe(text, imageUrl) {
    console.log(`🆘 Creating fallback recipe from raw text`);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Extracted Recipe (Manual Review Needed)',
      description: 'This recipe was extracted but may need manual review for accuracy.',
      image_url: imageUrl,
      ingredients: [
        {
          name: 'Raw extracted content',
          display_text: 'Please review the extracted content below',
          measurements: []
        }
      ],
      instructions: [
        'Step 1: Review the raw extracted content',
        'Step 2: Manually format the recipe as needed',
        `Raw content: ${text.substring(0, 500)}...`
      ],
      nutrition_info: null,
      prep_time: null,
      cook_time: null,
      difficulty: "Unknown",
      cuisine: "",
      diet: "",
      video_id: null,
      video_title: null,
      video_channel: null,
      category: "other"
    };
  }
}

export default GroqService;