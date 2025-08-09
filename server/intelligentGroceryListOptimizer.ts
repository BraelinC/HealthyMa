/**
 * Intelligent Grocery List Optimizer
 * Uses GPT-5 mini to consolidate ingredients and convert to sensible purchase quantities
 */

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConsolidatedIngredient {
  name: string;
  displayText: string;
  quantity: number;
  unit: string;
  category?: string;
  notes?: string;
}

interface GroceryOptimizationResult {
  consolidatedIngredients: ConsolidatedIngredient[];
  savings: {
    duplicatesRemoved: number;
    itemsConsolidated: number;
  };
  recommendations: string[];
}

/**
 * Consolidate ingredients from meal plan using GPT-5 mini
 */
export async function consolidateIngredientsWithAI(
  ingredients: string[]
): Promise<GroceryOptimizationResult> {
  try {
    const prompt = `You are a grocery shopping expert. Consolidate this list of ingredients into a smart shopping list.

INGREDIENTS TO CONSOLIDATE:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

RULES:
1. Combine duplicate ingredients (e.g., "2 eggs" + "3 eggs" = "5 eggs")
2. Convert to realistic purchase quantities:
   - Eggs: 1-6 → "half dozen eggs", 7-12 → "1 dozen eggs", 13-18 → "1.5 dozen eggs"
   - Milk: <2 cups → "1 pint milk", 2-4 cups → "1 quart milk", >4 cups → "half gallon milk"
   - Flour: <3 cups → "2 lb bag flour", 3-6 cups → "5 lb bag flour", >6 cups → "10 lb bag flour"
   - Chicken: combine all and round up to nearest pound
   - Produce: round to nearest whole or half pound
   - Spices/condiments: only buy once regardless of quantity
3. Group similar items (e.g., "olive oil" and "extra virgin olive oil" → "1 bottle olive oil")
4. For oils/vinegars/condiments: always just "1 bottle" regardless of how many times they appear
5. Use realistic grocery store units (dozen, pound, gallon, bag, bottle, container)

Return ONLY a JSON object with this structure:
{
  "consolidatedIngredients": [
    {
      "name": "eggs",
      "displayText": "1 dozen eggs",
      "quantity": 12,
      "unit": "eggs",
      "category": "dairy",
      "notes": "Combined from 5 recipes"
    }
  ],
  "savings": {
    "duplicatesRemoved": 3,
    "itemsConsolidated": 8
  },
  "recommendations": [
    "Buy eggs in dozen for better value",
    "Single olive oil bottle will cover all recipes"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const result = JSON.parse(content) as GroceryOptimizationResult;
    
    // Validate and enhance the result
    if (!result.consolidatedIngredients || !Array.isArray(result.consolidatedIngredients)) {
      throw new Error("Invalid response format from AI");
    }

    // Ensure all ingredients have required fields
    result.consolidatedIngredients = result.consolidatedIngredients.map(ing => ({
      ...ing,
      name: ing.name || "Unknown item",
      displayText: ing.displayText || ing.name || "Unknown item",
      quantity: ing.quantity || 1,
      unit: ing.unit || "unit",
      category: ing.category || categorizeIngredient(ing.name)
    }));

    return result;

  } catch (error) {
    console.error('AI ingredient consolidation error:', error);
    
    // Fallback to basic consolidation
    return fallbackConsolidation(ingredients);
  }
}

/**
 * Convert consolidated ingredients to Instacart format
 */
export function formatForInstacart(ingredients: ConsolidatedIngredient[]) {
  return ingredients.map(ing => ({
    name: ing.name,
    display_text: ing.displayText,
    measurements: [{
      quantity: ing.quantity,
      unit: normalizeUnitForInstacart(ing.unit)
    }]
  }));
}

/**
 * Fallback consolidation if AI fails
 */
function fallbackConsolidation(ingredients: string[]): GroceryOptimizationResult {
  // Group identical ingredients
  const ingredientMap = new Map<string, number>();
  
  ingredients.forEach(ing => {
    const normalized = ing.toLowerCase().trim();
    ingredientMap.set(normalized, (ingredientMap.get(normalized) || 0) + 1);
  });

  const consolidated: ConsolidatedIngredient[] = Array.from(ingredientMap.entries()).map(([name, count]) => ({
    name: name,
    displayText: count > 1 ? `${name} (×${count})` : name,
    quantity: count,
    unit: "unit",
    category: categorizeIngredient(name)
  }));

  return {
    consolidatedIngredients: consolidated,
    savings: {
      duplicatesRemoved: ingredients.length - consolidated.length,
      itemsConsolidated: 0
    },
    recommendations: [
      "Consider buying in bulk for frequently used items",
      "Check your pantry before shopping"
    ]
  };
}

/**
 * Categorize ingredient for better organization
 */
function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
      lowerIngredient.includes('pork') || lowerIngredient.includes('turkey') ||
      lowerIngredient.includes('lamb') || lowerIngredient.includes('bacon')) {
    return 'meat';
  }
  
  if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') ||
      lowerIngredient.includes('shrimp') || lowerIngredient.includes('crab')) {
    return 'seafood';
  }
  
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') ||
      lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter') ||
      lowerIngredient.includes('cream')) {
    return 'dairy';
  }
  
  if (lowerIngredient.includes('egg')) {
    return 'dairy';
  }
  
  if (lowerIngredient.includes('bread') || lowerIngredient.includes('tortilla') ||
      lowerIngredient.includes('roll') || lowerIngredient.includes('bagel')) {
    return 'bakery';
  }
  
  if (lowerIngredient.includes('tomato') || lowerIngredient.includes('lettuce') ||
      lowerIngredient.includes('onion') || lowerIngredient.includes('garlic') ||
      lowerIngredient.includes('carrot') || lowerIngredient.includes('pepper') ||
      lowerIngredient.includes('apple') || lowerIngredient.includes('banana')) {
    return 'produce';
  }
  
  return 'pantry';
}

/**
 * Normalize units for Instacart compatibility
 */
function normalizeUnitForInstacart(unit: string): string {
  const unitMap: { [key: string]: string } = {
    'dozen': 'unit',
    'half dozen': 'unit',
    'eggs': 'unit',
    'cups': 'cup',
    'tbsp': 'tablespoon',
    'tsp': 'teaspoon',
    'lbs': 'pound',
    'lb': 'pound',
    'oz': 'ounce',
    'kg': 'kilogram',
    'g': 'gram',
    'ml': 'milliliter',
    'l': 'liter',
    'gallon': 'gallon',
    'quart': 'quart',
    'pint': 'pint'
  };
  
  const lowerUnit = unit.toLowerCase();
  return unitMap[lowerUnit] || lowerUnit;
}