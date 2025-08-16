// Food detection main module - uses LogMeal AI
import { detectIngredientsWithLogMeal, getLogMealAPIInfo } from './logmealApiDetection';

// Re-export types for compatibility
export interface DetectedFood {
  id: string;
  name: string;
  amount: number;
  unit: string;
  confidence: number;
  included: boolean;
  isManual?: boolean;
  measureType?: 'weight' | 'volume' | 'count';
  source?: 'dish' | 'ingredient' | 'foodItem';
}

// Main detection function - uses LogMeal API
export async function detectFoods(imageDataUrl: string): Promise<DetectedFood[]> {
  const startTime = Date.now();
  
  try {
    console.log('🍔 Using LogMeal Food AI for advanced detection...');
    
    // Use LogMeal API for detection (better for complex meals)
    const detections = await detectIngredientsWithLogMeal(imageDataUrl);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ LogMeal detection completed in ${elapsed}ms`);
    
    if (detections && detections.length > 0) {
      console.log(`Detected ${detections.length} foods with average confidence: ${
        (detections.reduce((sum, f) => sum + f.confidence, 0) / detections.length * 100).toFixed(1)
      }%`);
      
      // Log detected foods for debugging
      console.log('Detected foods:', detections.map(d => 
        `${d.name} (${d.amount}${d.unit}) - ${(d.confidence * 100).toFixed(0)}%`
      ).join(', '));
    } else {
      console.log('No foods detected in image');
    }
    
    return detections;
  } catch (error) {
    console.error('❌ LogMeal detection failed:', error);
    
    // Return empty array on error
    return [];
  }
}

// Parse text input for missing ingredients (backend handles via GPT)
export function parseManualFoodInput(text: string): DetectedFood[] {
  // This is handled by the backend API now
  // Keeping function for compatibility
  return [];
}

// Export model info for debugging
export function getModelInfo() {
  const logmealInfo = getLogMealAPIInfo();
  
  return {
    name: logmealInfo.name,
    version: logmealInfo.version,
    provider: logmealInfo.provider,
    features: logmealInfo.features,
    status: logmealInfo.status,
    endpoint: logmealInfo.endpoint,
    architecture: 'Advanced AI with 1300+ dish recognition',
    realAI: true
  };
}