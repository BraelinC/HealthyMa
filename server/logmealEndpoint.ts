// Enhanced LogMeal API endpoint with comprehensive debugging
import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';

export async function handleLogMealDetection(req: Request, res: Response) {
  try {
    console.log('🍔 === LOGMEAL API ENDPOINT CALLED ===');
    const { image } = req.body;
    
    if (!image) {
      console.error('❌ No image data provided');
      return res.status(400).json({ error: "Image data is required" });
    }
    
    console.log('📊 Received image data:', {
      length: image.length,
      isBase64: image.includes('base64'),
      prefix: image.substring(0, 50)
    });
    
    // LogMeal API configuration
    const LOGMEAL_API_KEY = '79cbe9badc6d24d77ffbcd536692c6fd697de89d';
    const LOGMEAL_API_URL = 'https://api.logmeal.es/v2';
    
    console.log('🔑 Using LogMeal API');
    
    // Remove data URL prefix and convert to buffer
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Image, 'base64');
    console.log('📦 Image buffer size:', imageBuffer.length);
    
    // Use axios for proper form-data handling (imported at top)
    
    // Map common measurement units
    const getUnitForFood = (foodName: string) => {
      const lowerName = foodName.toLowerCase();
      if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('grain')) return 'cup';
      if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('steak') || lowerName.includes('meat') || lowerName.includes('fish')) return 'oz';
      if (lowerName.includes('milk') || lowerName.includes('juice') || lowerName.includes('soup') || lowerName.includes('stew') || lowerName.includes('sauce')) return 'cup';
      if (lowerName.includes('bread') || lowerName.includes('toast') || lowerName.includes('slice')) return 'slice';
      if (lowerName.includes('egg')) return 'egg';
      if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') || lowerName.includes('fruit')) return 'piece';
      if (lowerName.includes('vegetable') || lowerName.includes('carrot') || lowerName.includes('broccoli')) return 'cup';
      return 'serving';
    };
    
    const getMeasureType = (unit: string) => {
      if (unit === 'cup' || unit === 'tbsp' || unit === 'tsp' || unit === 'ml') return 'volume';
      if (unit === 'oz' || unit === 'g' || unit === 'lb') return 'weight';
      return 'count';
    };
    
    // Try different endpoints to get the best results
    let logmealData: any = null;
    const endpoints = [
      '/recognition/dish',           // Best for complete dishes
      '/image/recognition/complete', // Complete analysis
      '/image/recognition/type',     // Food type recognition
      '/recognition/food',           // General food recognition
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🚀 Trying endpoint: ${endpoint}`);
      
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      
      try {
        const response = await axios.post(
          `${LOGMEAL_API_URL}${endpoint}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${LOGMEAL_API_KEY}`,
              ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000 // 30 second timeout
          }
        );
        
        logmealData = response.data;
        console.log(`✅ Success with ${endpoint}`);
        console.log('📊 Response keys:', Object.keys(logmealData));
        
        // Check if we got meaningful data
        const hasResults = 
          (logmealData.recognition_results && logmealData.recognition_results.length > 0) ||
          (logmealData.foodItem) ||
          (logmealData.foodType && logmealData.foodType.length > 0) ||
          (logmealData.segmentation_results && logmealData.segmentation_results.length > 0) ||
          (logmealData.ingredients && logmealData.ingredients.length > 0) ||
          (logmealData.result);
        
        if (hasResults) {
          console.log('✅ Found meaningful results, using this endpoint');
          break;
        } else {
          console.log('⚠️ No meaningful results, trying next endpoint...');
        }
        
      } catch (error: any) {
        console.log(`❌ Failed with ${endpoint}:`, error.response?.status || error.message);
        continue;
      }
    }
    
    if (!logmealData) {
      console.error('❌ All LogMeal endpoints failed');
      return res.status(500).json({ 
        error: 'LogMeal API request failed',
        details: 'Could not get response from any endpoint'
      });
    }
    
    console.log('📊 Full response structure:', JSON.stringify(logmealData, null, 2).substring(0, 2000));
    
    // Process LogMeal response into our format
    const detectedIngredients: any[] = [];
    
    // Comprehensive response processing
    console.log('\n🔍 Processing LogMeal response...');
    
    // 1. recognition_results (dish recognition)
    if (logmealData.recognition_results && Array.isArray(logmealData.recognition_results)) {
      console.log(`📍 Processing ${logmealData.recognition_results.length} recognition results`);
      for (const result of logmealData.recognition_results) {
        const name = result.name || result.food_name || result.class;
        const prob = result.prob || result.probability || result.score || 0.5;
        
        if (name && prob >= 0.2 && !name.toLowerCase().includes('unknown')) {
          const unit = getUnitForFood(name);
          detectedIngredients.push({
            id: `dish-${Date.now()}-${Math.random()}`,
            name: name,
            confidence: prob,
            amount: 1,
            unit: unit,
            measureType: getMeasureType(unit),
            source: 'dish'
          });
          console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`)
        }
      }
    }
    
    // 2. result field (direct result)
    if (logmealData.result) {
      if (Array.isArray(logmealData.result)) {
        console.log(`📍 Processing ${logmealData.result.length} direct results`);
        for (const item of logmealData.result) {
          const name = item.name || item.food_name || item.class;
          const prob = item.prob || item.confidence || 0.6;
          
          if (name && prob >= 0.2) {
            const unit = getUnitForFood(name);
            detectedIngredients.push({
              id: `result-${Date.now()}-${Math.random()}`,
              name: name,
              confidence: prob,
              amount: 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: 'result'
            });
            console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`);
          }
        }
      }
    }
    
    // 3. foodItem (single detection)
    if (logmealData.foodItem) {
      console.log(`📍 Processing single foodItem`);
      const item = logmealData.foodItem;
      const name = item.name || item.food_name || item.title;
      const prob = item.confidence || item.prob || 0.7;
      
      if (name && prob >= 0.2) {
        const unit = getUnitForFood(name);
        detectedIngredients.push({
          id: `item-${Date.now()}-${Math.random()}`,
          name: name,
          confidence: prob,
          amount: item.quantity || 1,
          unit: unit,
          measureType: getMeasureType(unit),
          source: 'foodItem'
        });
        console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`);
      }
    }
    
    // 4. foodType array
    if (logmealData.foodType && Array.isArray(logmealData.foodType)) {
      console.log(`📍 Processing ${logmealData.foodType.length} food types`);
      for (const type of logmealData.foodType) {
        const name = type.name || type.food_name || type.type;
        const prob = type.probs || type.prob || type.confidence || 0.5;
        
        if (name && name !== 'food' && prob >= 0.2) {
          const unit = getUnitForFood(name);
          detectedIngredients.push({
            id: `type-${Date.now()}-${Math.random()}`,
            name: name,
            confidence: prob,
            amount: 1,
            unit: unit,
            measureType: getMeasureType(unit),
            source: 'foodType'
          });
          console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // 5. segmentation_results
    if (logmealData.segmentation_results && Array.isArray(logmealData.segmentation_results)) {
      console.log(`📍 Processing ${logmealData.segmentation_results.length} segmentation results`);
      for (const seg of logmealData.segmentation_results) {
        const name = seg.name || seg.food_name || seg.class;
        const prob = seg.prob || seg.confidence || 0.6;
        
        if (name && prob >= 0.2) {
          const unit = getUnitForFood(name);
          detectedIngredients.push({
            id: `seg-${Date.now()}-${Math.random()}`,
            name: name,
            confidence: prob,
            amount: 1,
            unit: unit,
            measureType: getMeasureType(unit),
            source: 'segmentation'
          });
          console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // 6. ingredients array
    if (logmealData.ingredients && Array.isArray(logmealData.ingredients)) {
      console.log(`📍 Processing ${logmealData.ingredients.length} ingredients`);
      for (const ing of logmealData.ingredients) {
        const name = typeof ing === 'string' ? ing : (ing.name || ing.ingredient);
        if (name) {
          const unit = getUnitForFood(name);
          detectedIngredients.push({
            id: `ing-${Date.now()}-${Math.random()}`,
            name: name,
            confidence: ing.confidence || 0.8,
            amount: ing.quantity || ing.amount || 1,
            unit: unit,
            measureType: getMeasureType(unit),
            source: 'ingredient'
          });
          console.log(`  ✅ Added: ${name}`);
        }
      }
    }
    
    // 7. items array (general)
    if (logmealData.items && Array.isArray(logmealData.items)) {
      console.log(`📍 Processing ${logmealData.items.length} general items`);
      for (const item of logmealData.items) {
        const name = item.name || item.food_name || item.title;
        const prob = item.confidence || item.score || 0.7;
        
        if (name && prob >= 0.2) {
          const unit = getUnitForFood(name);
          detectedIngredients.push({
            id: `gen-${Date.now()}-${Math.random()}`,
            name: name,
            confidence: prob,
            amount: item.quantity || 1,
            unit: unit,
            measureType: getMeasureType(unit),
            source: 'item'
          });
          console.log(`  ✅ Added: ${name} (${(prob * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // 8. Check for any other food-related fields
    const otherFields = Object.keys(logmealData).filter(key => 
      !['recognition_results', 'result', 'foodItem', 'foodType', 'segmentation_results', 'ingredients', 'items'].includes(key) &&
      (key.toLowerCase().includes('food') || key.toLowerCase().includes('dish') || key.toLowerCase().includes('meal'))
    );
    
    if (otherFields.length > 0) {
      console.log('📍 Found additional fields:', otherFields);
      for (const field of otherFields) {
        console.log(`  Field ${field}:`, JSON.stringify(logmealData[field]).substring(0, 200));
      }
    }
    
    console.log(`\n✅ Total ingredients detected: ${detectedIngredients.length}`);
    
    if (detectedIngredients.length === 0) {
      console.log('⚠️ No ingredients detected - full response for debugging:');
      console.log(JSON.stringify(logmealData, null, 2));
    }
    
    // Return response
    const response = {
      ingredients: detectedIngredients,
      raw: {
        hasRecognitionResults: !!(logmealData.recognition_results && logmealData.recognition_results.length > 0),
        hasFoodTypes: !!(logmealData.foodType && logmealData.foodType.length > 0),
        hasIngredients: !!(logmealData.ingredients && logmealData.ingredients.length > 0),
        hasFoodItems: !!(logmealData.foodItem || (logmealData.items && logmealData.items.length > 0)),
        hasSegmentation: !!(logmealData.segmentation_results && logmealData.segmentation_results.length > 0),
        hasResult: !!logmealData.result,
        responseKeys: Object.keys(logmealData)
      }
    };
    
    console.log('📤 Sending response with', detectedIngredients.length, 'ingredients');
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Error in LogMeal endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}