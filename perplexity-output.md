# Perplexity API Output for "Peruvian" Cuisine

## Raw Response Structure

The Perplexity API returns a comprehensive response with:

- **Citations**: Links to authoritative sources (YouTube, culinary websites, recipe sites)
- **Search Results**: Structured metadata from web search
- **Usage Stats**: Token consumption and search context
- **Structured Content**: The actual cultural cuisine data

## Formatted Cultural Cuisine Data

```json
{
  "culture": "Peruvian",
  "meals": [
    {
      "name": "Ceviche",
      "description": "Fresh raw fish marinated in lime juice with onions, chili peppers, and cilantro, served cold.",
      "healthy_mods": ["Use lean fish like sea bass", "Limit added salt", "Serve with fresh vegetables"],
      "macros": {"calories": 200, "protein_g": 30, "carbs_g": 10, "fat_g": 2}
    },
    {
      "name": "Pollo a la Brasa",
      "description": "Peruvian rotisserie chicken marinated with spices, herbs, soy sauce, and roasted to perfection.",
      "healthy_mods": ["Use skinless chicken", "Reduce soy sauce for lower sodium", "Serve with salad instead of fries"],
      "macros": {"calories": 350, "protein_g": 40, "carbs_g": 5, "fat_g": 15}
    },
    {
      "name": "Lomo Saltado",
      "description": "Stir-fried beef with onions, tomatoes, and Peruvian spices, typically served with rice and potatoes.",
      "healthy_mods": ["Use lean beef cuts", "Reduce oil used for frying", "Serve with brown rice"],
      "macros": {"calories": 450, "protein_g": 35, "carbs_g": 40, "fat_g": 18}
    },
    {
      "name": "Ají de Gallina",
      "description": "Shredded chicken in a spicy, creamy sauce made with ají amarillo peppers, walnuts, and milk.",
      "healthy_mods": ["Use low-fat milk", "Limit cream and nuts", "Serve with quinoa instead of white rice"],
      "macros": {"calories": 400, "protein_g": 30, "carbs_g": 30, "fat_g": 12}
    },
    {
      "name": "Pachamanca",
      "description": "Traditional Andean dish of various meats and vegetables cooked underground with hot stones.",
      "healthy_mods": ["Use lean meats", "Increase vegetable portions", "Limit added salt"],
      "macros": {"calories": 400, "protein_g": 35, "carbs_g": 25, "fat_g": 15}
    }
  ],
  "styles": ["Marinating", "Roasting", "Stir-frying", "Underground baking"],
  "key_ingredients": ["aji amarillo", "lime juice", "cilantro", "potatoes", "soy sauce", "chicken", "beef", "fresh fish"],
  "cooking_techniques": ["Marinating overnight", "Roasting over charcoal", "Stir-frying in wok", "Cooking with hot stones underground"],
  "health_benefits": [
    "High protein content supports muscle health",
    "Use of fresh herbs and spices with antioxidant properties",
    "Inclusion of nutrient-rich vegetables and tubers",
    "Lean meats and fish promote heart health",
    "Low in processed ingredients and refined sugars"
  ]
}
```

## Key Features of the Response

1. **Authentic Data**: All dishes are genuine Peruvian classics (Ceviche, Pollo a la Brasa, Lomo Saltado, etc.)
2. **Nutritional Info**: Realistic macro counts for each dish
3. **Health Modifications**: Practical suggestions to make dishes healthier
4. **Cultural Context**: Traditional cooking techniques and key ingredients
5. **Source Citations**: Backed by authoritative culinary sources

## API Performance

- **Response Time**: ~1-2 seconds
- **Token Usage**: ~835 tokens total (161 prompt + 674 completion)
- **Search Context**: Low (efficient for structured queries)
- **Citations**: 5 authoritative sources automatically included

This data is now cached locally for 24 hours to avoid duplicate API calls and ensure fast meal planning integration.