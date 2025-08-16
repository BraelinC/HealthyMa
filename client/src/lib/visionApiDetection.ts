// Google Cloud Vision API integration for ingredient detection
import { INGREDIENT_DATABASE } from './ingredientDatabase';

interface VisionIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  confidence: number;
  included: boolean;
  isManual?: boolean;
  measureType?: 'weight' | 'volume' | 'count';
  bbox?: number[]; // [x, y, width, height] for visualization
}

interface VisionAPIResponse {
  ingredients: Array<{
    id: string;
    name: string;
    confidence: number;
    bbox?: number[];
    source: 'object' | 'label';
  }>;
  raw: {
    objects: number;
    labels: number;
    hasText: boolean;
  };
}

// Compress image before sending to reduce size
function compressImage(imageDataUrl: string, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression (0.7 quality)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      console.log(`📸 Image compressed: ${imageDataUrl.length} → ${compressedDataUrl.length} bytes (${Math.round((1 - compressedDataUrl.length/imageDataUrl.length) * 100)}% reduction)`);
      resolve(compressedDataUrl);
    };
    img.src = imageDataUrl;
  });
}

// Call backend Vision API endpoint
export async function detectIngredientsWithVisionAPI(imageDataUrl: string): Promise<VisionIngredient[]> {
  const startTime = Date.now();
  console.log('🌐 Starting Google Vision API detection...');
  console.log('📡 API Endpoint: /api/detect-ingredients');
  console.log('📊 Original image length:', imageDataUrl.length);
  
  try {
    // Compress image if it's too large
    let imageToSend = imageDataUrl;
    if (imageDataUrl.length > 100000) { // If larger than 100KB
      console.log('🗜️ Compressing large image...');
      imageToSend = await compressImage(imageDataUrl);
    }
    
    // Call our backend endpoint which handles the Vision API
    console.log('🔄 Sending request to backend...');
    const response = await fetch('/api/detect-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageToSend
      })
    });
    
    console.log('📨 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vision API error response:', errorText);
      throw new Error(`Vision API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check if it's an error response
    if (data.error) {
      console.error('❌ Backend error:', data.error);
      if (data.status) console.error('❌ API Status:', data.status);
      if (data.details) console.error('❌ Error details:', data.details);
      throw new Error(data.error);
    }
    
    console.log(`✅ Vision API response: ${data.ingredients?.length || 0} ingredients detected`);
    if (data.raw) {
      console.log(`📊 Raw stats: ${data.raw.objects} objects, ${data.raw.labels} labels, text: ${data.raw.hasText}`);
    }
    
    // Convert Vision API results to our ingredient format
    const detectedIngredients: VisionIngredient[] = [];
    
    for (const item of data.ingredients) {
      // Look up ingredient in our database
      const ingredientKey = item.name.replace(/\s+/g, '_');
      const ingredientInfo = INGREDIENT_DATABASE[ingredientKey] || INGREDIENT_DATABASE['default'];
      
      console.log(`🥕 Mapping "${item.name}" (${item.source}) to ${ingredientInfo.name} - ${(item.confidence * 100).toFixed(1)}%`);
      
      detectedIngredients.push({
        id: item.id,
        name: ingredientInfo.name,
        amount: ingredientInfo.defaultAmount,
        unit: ingredientInfo.unit,
        confidence: item.confidence,
        included: true,
        isManual: false,
        measureType: ingredientInfo.measureType || 'count',
        bbox: item.bbox
      });
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Vision API detection completed in ${elapsed}ms`);
    
    if (detectedIngredients.length > 0) {
      console.log(`📊 Average confidence: ${
        (detectedIngredients.reduce((sum, f) => sum + f.confidence, 0) / detectedIngredients.length * 100).toFixed(1)
      }%`);
      console.log('📋 Detected ingredients:', detectedIngredients.map(i => 
        `${i.name} (${i.amount}${i.unit}) - ${(i.confidence * 100).toFixed(1)}%`
      ));
    } else {
      console.log('⚠️ No ingredients detected by Vision API');
    }
    
    return detectedIngredients;
    
  } catch (error) {
    console.error('❌ Vision API detection error:', error);
    throw error;
  }
}

// Get Vision API status/info
export function getVisionAPIInfo() {
  return {
    name: 'Google Cloud Vision API',
    version: '1.0',
    provider: 'Google Cloud',
    features: ['Object Localization', 'Label Detection', 'Text Detection'],
    status: 'ready',
    endpoint: '/api/detect-ingredients'
  };
}