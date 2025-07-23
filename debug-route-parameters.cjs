/**
 * Debug Route Parameters
 * 
 * This checks what parameters the meal plan generation route actually receives
 * and processes, to understand why cultural integration isn't working.
 */

const fs = require('fs');

console.log('🔍 Debugging Route Parameters and Cultural Integration\n');

// Read the routes file to analyze parameter extraction
try {
  const routesContent = fs.readFileSync('/home/runner/workspace/server/routes.ts', 'utf8');
  
  // Find the meal-plan/generate route
  const generateRouteStart = routesContent.indexOf('app.post("/api/meal-plan/generate"');
  const generateRouteEnd = routesContent.indexOf('app.post(', generateRouteStart + 1);
  
  if (generateRouteStart === -1) {
    console.log('❌ Could not find meal-plan/generate route');
    process.exit(1);
  }
  
  const routeSection = routesContent.substring(generateRouteStart, generateRouteEnd !== -1 ? generateRouteEnd : generateRouteStart + 3000);
  
  console.log('=== Route Parameter Extraction Analysis ===');
  
  // Check what parameters are extracted from req.body
  const bodyDestructureMatch = routeSection.match(/const\s*{\s*([^}]+)\s*}\s*=\s*req\.body/);
  
  if (bodyDestructureMatch) {
    const extractedParams = bodyDestructureMatch[1]
      .split(',')
      .map(param => param.trim().split('=')[0].trim())
      .filter(param => param.length > 0);
    
    console.log('✅ Parameters extracted from req.body:');
    extractedParams.forEach(param => console.log(`   - ${param}`));
    
    console.log('\n🔍 Cultural Integration Parameters:');
    const culturalParams = ['culturalBackground', 'culturalCuisineData', 'cultural_background'];
    culturalParams.forEach(param => {
      const isExtracted = extractedParams.includes(param);
      console.log(`   ${isExtracted ? '✅' : '❌'} ${param}`);
    });
    
  } else {
    console.log('❌ Could not find parameter extraction pattern');
  }
  
  console.log('\n=== Intelligent Prompt Trigger Analysis ===');
  
  // Check conditions for intelligent prompt
  const intelligentPromptConditions = [
    'userId !== \'anonymous\'',
    'useIntelligentPrompt',
    'userProfile',
    'cultural_background'
  ];
  
  intelligentPromptConditions.forEach(condition => {
    const hasCondition = routeSection.includes(condition);
    console.log(`   ${hasCondition ? '✅' : '❌'} ${condition}`);
  });
  
  console.log('\n=== Enhancement Integration Analysis ===');
  
  // Check if our enhancements are in this route
  const enhancements = [
    'DIETARY VALIDATION',
    'DISH NAME ENHANCEMENT', 
    'validateMealPlanDietaryCompliance',
    'enhanceMealPlanNames',
    'culturalBackground'
  ];
  
  enhancements.forEach(enhancement => {
    const hasEnhancement = routeSection.includes(enhancement);
    console.log(`   ${hasEnhancement ? '✅' : '❌'} ${enhancement}`);
  });
  
  console.log('\n=== Cultural Data Flow Analysis ===');
  
  // Check cultural data flow
  const culturalFlow = [
    'getCachedCulturalCuisine',
    'buildIntelligentPrompt',
    'culturalCuisineData',
    'culturalBackground'
  ];
  
  culturalFlow.forEach(flow => {
    const hasFlow = routeSection.includes(flow);
    console.log(`   ${hasFlow ? '✅' : '❌'} ${flow}`);
  });
  
  console.log('\n=== Missing Integration Points ===');
  
  // Identify what's missing
  const missing = [];
  if (!routeSection.includes('culturalBackground')) {
    missing.push('culturalBackground parameter extraction from req.body');
  }
  if (!routeSection.includes('DIETARY VALIDATION')) {
    missing.push('Dietary validation integration');
  }
  if (!routeSection.includes('enhanceMealPlanNames')) {
    missing.push('Dish name enhancement integration');
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing integrations:');
    missing.forEach(item => console.log(`   - ${item}`));
  } else {
    console.log('✅ All integrations appear to be present');
  }
  
  console.log('\n=== Route Branch Analysis ===');
  
  // Check which branch the route takes
  if (routeSection.includes('if (userProfile && useIntelligentPrompt)')) {
    console.log('✅ Route has intelligent prompt branch');
    if (routeSection.includes('buildIntelligentPrompt')) {
      console.log('✅ Uses buildIntelligentPrompt function');
    } else {
      console.log('❌ Does not use buildIntelligentPrompt function');
    }
  } else {
    console.log('❌ Route does not have intelligent prompt branching');
  }
  
  console.log('\n🎯 **ROOT CAUSE ANALYSIS**');
  console.log('=' .repeat(50));
  
  if (!routeSection.includes('culturalBackground')) {
    console.log('🚨 CRITICAL ISSUE: Route does not extract culturalBackground from request');
    console.log('   This means cultural preferences sent by client are ignored');
  }
  
  if (routeSection.includes('userId !== \'anonymous\'')) {
    console.log('🚨 AUTH ISSUE: Route requires authentication for intelligent features');
    console.log('   Anonymous users get basic prompt without enhancements');
  }
  
  if (!routeSection.includes('enhanceMealPlanNames')) {
    console.log('🚨 ENHANCEMENT ISSUE: Dish name enhancements not integrated in this route');
  }
  
  console.log('\n💡 **RECOMMENDED FIXES**');
  console.log('1. Add culturalBackground to req.body destructuring');
  console.log('2. Pass culturalBackground to buildIntelligentPrompt when available');
  console.log('3. Enable enhancements for anonymous users with cultural preferences');
  console.log('4. Integrate dietary validation and dish name enhancement in this route');
  
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
}

console.log('\n📋 **NEXT STEPS**');
console.log('1. Fix parameter extraction to include culturalBackground');
console.log('2. Test with fixed route to verify cultural integration');
console.log('3. Measure actual cultural authenticity in generated plans');
console.log('4. Validate that enhancements are actually applied');