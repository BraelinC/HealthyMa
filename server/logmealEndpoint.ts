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
    console.log(`   API Key: ${LOGMEAL_API_KEY.substring(0, 10)}...${LOGMEAL_API_KEY.slice(-4)}`);
    console.log(`   Base URL: ${LOGMEAL_API_URL}`);
    
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
    
    // Function to process LogMeal response data into our format
    const processLogMealResponse = (data: any, endpointName: string, getUnitForFood: Function, getMeasureType: Function): any[] => {
      const detections: any[] = [];
      const timestamp = Date.now();
      
      console.log(`🔍 Processing ${endpointName} response...`);
      
      // 1. Process food_types array (from /image/recognition/type endpoint)
      if (data.food_types && Array.isArray(data.food_types)) {
        console.log(`📍 Found ${data.food_types.length} food types`);
        for (const foodType of data.food_types) {
          const name = foodType.name;
          const prob = foodType.probs || foodType.prob || 0.5;
          
          // Skip generic categories that don't provide useful information
          const genericTerms = ['food', 'non-food', 'drink', 'ingredients', 'meal', 'dish', 'cuisine', 'ingredient', 'meals', 'dishes', 'foods'];
          const isGeneric = genericTerms.some(term => name?.toLowerCase().trim() === term);
          
          // Only include meaningful food items, skip generic categories
          if (name && !isGeneric && prob >= 0.15) {
            const unit = getUnitForFood(name);
            detections.push({
              id: `type-${timestamp}-${Math.random()}`,
              name: name,
              confidence: prob,
              amount: 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-type`
            });
            console.log(`  ✅ Added food type: ${name} (${(prob * 100).toFixed(1)}%)`);
          } else if (name && isGeneric) {
            console.log(`  ⚠️ Skipped generic term: ${name} (${(prob * 100).toFixed(1)}%)`);
          }
        }
      }
      
      // 2. Process recognition_results (from /recognition/dish endpoint)
      if (data.recognition_results && Array.isArray(data.recognition_results)) {
        console.log(`📍 Found ${data.recognition_results.length} recognition results`);
        for (const result of data.recognition_results) {
          // Handle nested recognition_results (from segmentation endpoint)
          if (result.recognition_results && Array.isArray(result.recognition_results)) {
            console.log(`  📦 Processing nested recognition results`);
            for (const nestedResult of result.recognition_results) {
              const name = nestedResult.name || nestedResult.food_name || nestedResult.class;
              const prob = nestedResult.prob || nestedResult.probability || 0.5;
              
              if (name && prob >= 0.15 && !['food', 'non-food', 'drink', 'ingredients', 'unknown'].includes(name.toLowerCase())) {
                const unit = getUnitForFood(name);
                detections.push({
                  id: `nested-${timestamp}-${Math.random()}`,
                  name: name,
                  confidence: prob,
                  amount: 1,
                  unit: unit,
                  measureType: getMeasureType(unit),
                  source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-segmented`
                });
                console.log(`    ✅ Added segmented food: ${name} (${(prob * 100).toFixed(1)}%)`);
              }
            }
          }
          
          // Process direct results
          const name = result.name || result.food_name || result.class;
          const prob = result.prob || result.probability || result.score || 0.5;
          
          // Skip generic terms here too
          const genericTerms = ['food', 'non-food', 'drink', 'ingredients', 'meal', 'dish', 'cuisine', 'unknown'];
          const isGeneric = genericTerms.some(term => name?.toLowerCase().includes(term));
          
          if (name && prob >= 0.15 && !isGeneric) {
            const unit = getUnitForFood(name);
            detections.push({
              id: `dish-${timestamp}-${Math.random()}`,
              name: name,
              confidence: prob,
              amount: 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-dish`
            });
            console.log(`  ✅ Added dish: ${name} (${(prob * 100).toFixed(1)}%)`);
            
            // Also process subclasses if available (more specific classifications)
            if (result.subclasses && Array.isArray(result.subclasses)) {
              for (const subclass of result.subclasses) {
                const subName = subclass.name;
                const subProb = subclass.prob || 0.5;
                
                if (subName && subProb >= 0.2 && subName !== name && !genericTerms.some(t => subName?.toLowerCase().includes(t))) {
                  const subUnit = getUnitForFood(subName);
                  detections.push({
                    id: `subclass-${timestamp}-${Math.random()}`,
                    name: subName,
                    confidence: subProb,
                    amount: 1,
                    unit: subUnit,
                    measureType: getMeasureType(subUnit),
                    source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-subclass`
                  });
                  console.log(`    ✅ Added subclass: ${subName} (${(subProb * 100).toFixed(1)}%)`);
                }
              }
            }
          } else if (name && isGeneric) {
            console.log(`  ⚠️ Skipped generic result: ${name} (${(prob * 100).toFixed(1)}%)`);
          }
        }
      }
      
      // 2.5 Check for 'foodFamily' structure (another LogMeal format)
      if (data.foodFamily && Array.isArray(data.foodFamily)) {
        console.log(`📍 Found ${data.foodFamily.length} food families`);
        for (const family of data.foodFamily) {
          // Process each food in the family
          if (family.foods && Array.isArray(family.foods)) {
            for (const food of family.foods) {
              const name = food.name || food.food_name;
              const prob = food.prob || food.confidence || 0.5;
              
              if (name && prob >= 0.15) {
                const unit = getUnitForFood(name);
                detections.push({
                  id: `family-${timestamp}-${Math.random()}`,
                  name: name,
                  confidence: prob,
                  amount: food.quantity || 1,
                  unit: unit,
                  measureType: getMeasureType(unit),
                  source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-family`
                });
                console.log(`  ✅ Added from food family: ${name} (${(prob * 100).toFixed(1)}%)`);
              }
            }
          }
        }
      }
      
      // 3. Process segmentation_results (from /image/segmentation/complete)
      if (data.segmentation_results && Array.isArray(data.segmentation_results)) {
        console.log(`📍 Found ${data.segmentation_results.length} segmentation results`);
        for (const segment of data.segmentation_results) {
          // Each segment can have its own recognition_results
          if (segment.recognition_results && Array.isArray(segment.recognition_results)) {
            console.log(`  🔍 Segment has ${segment.recognition_results.length} recognition results`);
            for (const recResult of segment.recognition_results) {
              const name = recResult.name || recResult.food_name || recResult.class;
              const prob = recResult.prob || recResult.probability || 0.5;
              
              if (name && prob >= 0.15 && !['food', 'non-food', 'drink', 'ingredients', 'unknown'].includes(name.toLowerCase())) {
                const unit = getUnitForFood(name);
                detections.push({
                  id: `seg-rec-${timestamp}-${Math.random()}`,
                  name: name,
                  confidence: prob,
                  amount: 1,
                  unit: unit,
                  measureType: getMeasureType(unit),
                  source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-segmentation`
                });
                console.log(`    ✅ Added from segmentation: ${name} (${(prob * 100).toFixed(1)}%)`);
              }
            }
          }
          
          // Also check direct segment properties
          const name = segment.name || segment.food_name || segment.class;
          const prob = segment.prob || segment.confidence || 0.6;
          
          if (name && prob >= 0.15 && !['food', 'non-food', 'drink', 'ingredients', 'unknown'].includes(name.toLowerCase())) {
            const unit = getUnitForFood(name);
            detections.push({
              id: `seg-${timestamp}-${Math.random()}`,
              name: name,
              confidence: prob,
              amount: 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-segmentation`
            });
            console.log(`  ✅ Added segmentation: ${name} (${(prob * 100).toFixed(1)}%)`);
          }
        }
      }
      
      // 3.5 Process foodItem array (alternative format)
      if (data.foodItem && Array.isArray(data.foodItem)) {
        console.log(`📍 Found ${data.foodItem.length} food items`);
        for (const item of data.foodItem) {
          const name = item.name || item.food_name;
          const prob = item.prob || item.probability || 0.5;
          
          if (name && prob >= 0.15) {
            const unit = getUnitForFood(name);
            detections.push({
              id: `item-${timestamp}-${Math.random()}`,
              name: name,
              confidence: prob,
              amount: item.quantity || 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-fooditem`
            });
            console.log(`  ✅ Added food item: ${name} (${(prob * 100).toFixed(1)}%)`);
          }
        }
      }
      
      // 4. Process ingredients array
      if (data.ingredients && Array.isArray(data.ingredients)) {
        console.log(`📍 Found ${data.ingredients.length} ingredients`);
        for (const ingredient of data.ingredients) {
          const name = typeof ingredient === 'string' ? ingredient : (ingredient.name || ingredient.ingredient);
          if (name && typeof name === 'string' && name !== 'ingredients') {
            const unit = getUnitForFood(name);
            detections.push({
              id: `ing-${timestamp}-${Math.random()}`,
              name: name,
              confidence: ingredient.confidence || 0.8,
              amount: ingredient.quantity || ingredient.amount || 1,
              unit: unit,
              measureType: getMeasureType(unit),
              source: `${endpointName.toLowerCase().replace(/\s+/g, '-')}-ingredient`
            });
            console.log(`  ✅ Added ingredient: ${name}`);
          }
        }
      }
      
      return detections;
    };
    
    // Function to remove duplicate detections and keep the highest confidence ones
    const deduplicateDetections = (detections: any[]): any[] => {
      const uniqueDetections = new Map<string, any>();
      
      console.log(`🔄 Deduplicating ${detections.length} total detections...`);
      
      for (const detection of detections) {
        const key = detection.name.toLowerCase().trim();
        
        // If we haven't seen this food before, or this has higher confidence, keep it
        if (!uniqueDetections.has(key) || detection.confidence > uniqueDetections.get(key).confidence) {
          uniqueDetections.set(key, detection);
        }
      }
      
      const result = Array.from(uniqueDetections.values());
      console.log(`✨ After deduplication: ${result.length} unique foods`);
      
      // Sort by confidence descending
      result.sort((a, b) => b.confidence - a.confidence);
      
      return result;
    };
    
    // Use correct working endpoints from 2025 LogMeal API documentation
    let allDetections: any[] = [];
    const endpoints = [
      {
        path: '/image/recognition/type',             // Primary food type detection endpoint (confirmed working)
        name: 'Food Type Recognition',
        priority: 1
      }
    ];
    
    // Try multiple endpoints and combine results (with delay to avoid rate limits)
    for (const endpoint of endpoints) {
      console.log(`\n🚀 Trying ${endpoint.name}: ${endpoint.path}`);
      
      // Add delay between requests to avoid rate limiting
      if (endpoint.priority > 1) {
        console.log('   ⏳ Waiting 1 second to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      
      try {
        const response = await axios.post(
          `${LOGMEAL_API_URL}${endpoint.path}`,
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
        
        const endpointData = response.data;
        console.log(`✅ Success with ${endpoint.name}`);
        console.log('📊 Response keys:', Object.keys(endpointData));
        
        // Log raw response structure for debugging
        console.log(`\n🔍 RAW ${endpoint.name} Response:`);
        const responseStr = JSON.stringify(endpointData, null, 2);
        console.log(responseStr.substring(0, 3000)); // Increased to 3000 chars for more detail
        
        // Log specific fields we're looking for
        console.log(`\n📋 Field Analysis for ${endpoint.name}:`);
        console.log(`  - Has recognition_results: ${!!endpointData.recognition_results}`);
        console.log(`  - Has segmentation_results: ${!!endpointData.segmentation_results}`);
        console.log(`  - Has food_types: ${!!endpointData.food_types}`);
        console.log(`  - Has foodItem: ${!!endpointData.foodItem}`);
        console.log(`  - Has ingredients: ${!!endpointData.ingredients}`);
        console.log(`  - Has imageId: ${!!endpointData.imageId}`);
        
        // If we have nested structures, log them
        if (endpointData.segmentation_results && Array.isArray(endpointData.segmentation_results)) {
          console.log(`  - Segmentation results count: ${endpointData.segmentation_results.length}`);
          if (endpointData.segmentation_results[0]) {
            console.log(`  - First segment structure:`, Object.keys(endpointData.segmentation_results[0]));
          }
        }
        
        // Process this endpoint's data and add to allDetections
        const endpointDetections = processLogMealResponse(endpointData, endpoint.name, getUnitForFood, getMeasureType);
        if (endpointDetections.length > 0) {
          console.log(`📦 Added ${endpointDetections.length} detections from ${endpoint.name}:`);
          endpointDetections.forEach(d => {
            console.log(`    - ${d.name} (${(d.confidence * 100).toFixed(1)}%)`);
          });
          allDetections.push(...endpointDetections);
        } else {
          console.log(`⚠️ No valid detections from ${endpoint.name}`);
        }
        
      } catch (error: any) {
        console.log(`❌ Failed with ${endpoint.name}:`, error.response?.status || error.message);
        
        // Log more details about the error
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Status Text: ${error.response.statusText}`);
          if (error.response.status === 429) {
            console.log(`   ⚠️ RATE LIMIT: Too many requests to LogMeal API`);
            console.log(`   💡 The LogMeal API has rate limits. Try again later or use manual entry.`);
            // Add rate limit info to response
            if (!allDetections.find(d => d.name === 'RATE_LIMIT_ERROR')) {
              allDetections.push({
                id: 'rate-limit-error',
                name: 'RATE_LIMIT_ERROR',
                confidence: 0,
                amount: 0,
                unit: '',
                measureType: '',
                source: 'error'
              });
            }
          } else if (error.response.status === 401 || error.response.status === 403) {
            console.log(`   ⚠️ AUTH ERROR: API key may not have access to this endpoint`);
          } else if (error.response.status === 400) {
            console.log(`   ⚠️ BAD REQUEST: Endpoint or parameters may be incorrect`);
          } else if (error.response.status === 114 || error.response.data?.code === 114) {
            console.log(`   ⚠️ RATE LIMIT: LogMeal API quota exceeded for 24 hours`);
            console.log(`   💡 You've reached your daily limit. Try again tomorrow or upgrade your plan.`);
          }
          console.log(`   Error data:`, error.response.data ? JSON.stringify(error.response.data).substring(0, 200) : 'No error data');
        } else {
          console.log(`   Network/Other Error:`, error.message);
        }
        
        continue;
      }
    }
    
    if (allDetections.length === 0) {
      console.error('❌ No detections from any LogMeal endpoint');
      console.log('💡 This could be due to:');
      console.log('   - Daily rate limit reached (200 requests per day - resets at midnight)');
      console.log('   - Image quality (try better lighting/clearer photo)');
      console.log('   - Food not recognized (try simpler/common foods)');
      console.log('   - API service issues (check LogMeal status)');
    }
    
    // Remove duplicates based on name and confidence similarity
    let detectedIngredients = deduplicateDetections(allDetections);
    
    // Final filter to remove any remaining generic terms and error markers
    const genericTerms = ['food', 'non-food', 'drink', 'ingredients', 'meal', 'dish', 'cuisine', 'unknown', 'rate_limit_error'];
    detectedIngredients = detectedIngredients.filter(item => {
      const isGeneric = genericTerms.some(term => item.name.toLowerCase() === term);
      if (isGeneric) {
        if (item.name.toLowerCase() === 'rate_limit_error') {
          console.log(`⚠️ LogMeal API is rate limited. Users can add ingredients manually.`);
        } else {
          console.log(`🚫 Filtered out generic term from final results: ${item.name}`);
        }
        return false;
      }
      return true;
    });
    
    console.log(`\n✅ Final results: ${detectedIngredients.length} unique ingredients detected`);
    
    if (detectedIngredients.length === 0) {
      console.log('⚠️ No ingredients detected after processing all endpoints');
    } else {
      console.log('🍽️ Detected foods:');
      detectedIngredients.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - ${item.amount}${item.unit} (${(item.confidence * 100).toFixed(1)}% confidence, source: ${item.source})`);
      });
    }
    
    // Return response
    const response = {
      ingredients: detectedIngredients,
      raw: {
        totalDetections: allDetections.length,
        uniqueDetections: detectedIngredients.length,
        endpointsUsed: endpoints.map(e => e.name),
        sourceBreakdown: detectedIngredients.reduce((acc: any, item) => {
          acc[item.source] = (acc[item.source] || 0) + 1;
          return acc;
        }, {})
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