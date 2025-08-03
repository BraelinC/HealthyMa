# Show Individual Meal Cards as They're Generated

## Goal
When user clicks "Generate Meal Plan", show individual meal cards appearing one by one as they're parsed from the OpenAI stream. No progress bars - just real-time meal cards appearing.

## Backend Changes
In `server/routes.ts` streaming endpoint, parse meals in real-time and send them as they're completed:

```typescript
// Stream from OpenAI and parse meals in real-time
let buffer = '';
let parsedMeals = [];

for await (const chunk of openaiStream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    buffer += content;
    sendData(content); // Send raw content for debugging
    
    // Try to extract complete meals from buffer
    const mealMatches = buffer.match(/"breakfast":\s*{[^}]*}(?=\s*,|\s*})/g);
    if (mealMatches) {
      mealMatches.forEach(match => {
        try {
          const meal = JSON.parse(`{${match}}`);
          if (meal.breakfast && !parsedMeals.find(m => m.id === `breakfast_${Date.now()}`)) {
            // Send complete meal card
            res.write(`data: ${JSON.stringify({ 
              type: 'meal', 
              meal: meal.breakfast,
              mealType: 'breakfast'
            })}\n\n`);
            parsedMeals.push({ id: `breakfast_${Date.now()}`, ...meal.breakfast });
          }
        } catch {} // Continue parsing
      });
    }
    
    // Parse lunch and dinner similarly...
  }
}
```

## Frontend Changes
In `StreamingMealPlanGenerator.tsx`, show meal cards as they arrive:

```typescript
const [liveParsingMeals, setLiveParsingMeals] = useState([]);

// In stream processing:
if (data.startsWith('{')) {
  try {
    const jsonData = JSON.parse(data);
    if (jsonData.type === 'meal') {
      // Add new meal card to display
      setLiveParsingMeals(prev => [...prev, {
        ...jsonData.meal,
        mealType: jsonData.mealType,
        id: `${jsonData.mealType}_${Date.now()}`
      }]);
      return; // Don't process as content
    }
  } catch {} // Continue to content processing
}

// In render:
{liveParsingMeals.map(meal => (
  <Card key={meal.id} className="animate-in slide-in-from-bottom duration-500">
    <CardHeader>
      <CardTitle>{meal.title}</CardTitle>
      <Badge>{meal.mealType}</Badge>
    </CardHeader>
    <CardContent>
      <p>Cook time: {meal.cook_time_minutes} min</p>
      <p>Difficulty: {meal.difficulty}/5</p>
    </CardContent>
  </Card>
))}
```

## Expected Result
User sees meal cards appear one by one with smooth animations as the AI generates each meal, creating an engaging real-time experience.