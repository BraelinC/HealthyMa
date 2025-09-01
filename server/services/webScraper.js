import puppeteer from 'puppeteer';

class WebScraperService {
  // Extract JSON-LD structured data from page
  async extractJsonLd(page) {
    console.log('🔍 Checking for JSON-LD recipe schema...');
    
    const jsonLdData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const recipeSchemas = [];
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          
          // Handle single objects or arrays
          const items = Array.isArray(data) ? data : [data];
          
          for (const item of items) {
            // Check if it's a recipe schema
            if (item['@type'] === 'Recipe' || 
                (item['@graph'] && item['@graph'].some(g => g['@type'] === 'Recipe'))) {
              
              // Extract recipe from @graph if present
              const recipe = item['@type'] === 'Recipe' ? item : 
                            item['@graph'].find(g => g['@type'] === 'Recipe');
              
              if (recipe) {
                recipeSchemas.push(recipe);
              }
            }
          }
        } catch (e) {
          // Skip malformed JSON-LD
          continue;
        }
      }
      
      return recipeSchemas;
    });
    
    console.log(`📋 Found ${jsonLdData.length} JSON-LD recipe schemas`);
    return jsonLdData;
  }
  
  // Check if JSON-LD recipe data is complete
  validateRecipeCompleteness(recipeData) {
    if (!recipeData || recipeData.length === 0) {
      return { isComplete: false, reason: 'No JSON-LD recipe data found' };
    }
    
    const recipe = recipeData[0]; // Use first recipe found
    
    // Check for required fields
    const hasName = recipe.name && recipe.name.trim().length > 0;
    const hasIngredients = recipe.recipeIngredient && recipe.recipeIngredient.length > 0;
    const hasInstructions = recipe.recipeInstructions && recipe.recipeInstructions.length > 0;
    
    if (!hasName) {
      return { isComplete: false, reason: 'Missing recipe name' };
    }
    
    if (!hasIngredients) {
      return { isComplete: false, reason: 'Missing ingredients list' };
    }
    
    if (!hasInstructions) {
      return { isComplete: false, reason: 'Missing instructions' };
    }
    
    console.log('✅ JSON-LD recipe data is complete');
    return { isComplete: true, recipe };
  }
  
  // Transform JSON-LD to our format
  transformJsonLdRecipe(jsonLdRecipe) {
    const ingredients = jsonLdRecipe.recipeIngredient || [];
    const instructions = jsonLdRecipe.recipeInstructions || [];
    
    // Extract instruction text (handle different instruction formats)
    const instructionTexts = instructions.map(instruction => {
      if (typeof instruction === 'string') return instruction;
      if (instruction.text) return instruction.text;
      if (instruction.name) return instruction.name;
      return String(instruction);
    });
    
    return {
      title: jsonLdRecipe.name || 'Unknown Recipe',
      description: jsonLdRecipe.description || '',
      ingredients: ingredients,
      instructions: instructionTexts,
      image: jsonLdRecipe.image?.[0]?.url || jsonLdRecipe.image?.url || jsonLdRecipe.image,
      prepTime: jsonLdRecipe.prepTime,
      cookTime: jsonLdRecipe.cookTime,
      totalTime: jsonLdRecipe.totalTime,
      servings: jsonLdRecipe.recipeYield,
      difficulty: jsonLdRecipe.difficulty,
      cuisine: jsonLdRecipe.recipeCuisine,
      category: jsonLdRecipe.recipeCategory
    };
  }

  async scrapeRecipePage(url) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ] // Enhanced for Replit environment
    });
    
    const page = await browser.newPage();
    
    try {
      console.log(`🔍 Scraping recipe from: ${url}`);
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // METHOD 1: Fast JSON-LD Extraction (5-second wait)
      console.log('🚀 Method 1: Fast JSON-LD extraction');
      try {
        await page.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        // Continue if no specific selector found
      }
      
      // Try JSON-LD extraction first
      const jsonLdData = await this.extractJsonLd(page);
      const validation = this.validateRecipeCompleteness(jsonLdData);
      
      if (validation.isComplete) {
        console.log('✅ JSON-LD extraction successful - using fast method');
        
        // Still extract images for final output
        const imageUrls = await this.extractImages(page);
        const transformedRecipe = this.transformJsonLdRecipe(validation.recipe);
        
        return {
          method: 'json-ld',
          jsonLdRecipe: transformedRecipe,
          textContent: '', // Empty since we have structured data
          imageUrls,
          pdfUrls: [],
          originalUrl: url
        };
      }
      
      // METHOD 2: Enhanced HTML Scraping (20-30 second wait)
      console.log(`⚠️ JSON-LD incomplete: ${validation.reason}`);
      console.log('🔄 Method 2: Enhanced HTML scraping with extended wait');
      
      // Wait longer for dynamic content
      try {
        await page.waitForTimeout(20000); // 20 second wait for dynamic content
        console.log('⏱️ Waited 20 seconds for dynamic content to load');
      } catch (e) {
        console.log('⚠️ Extended wait completed');
      }
      
      // Extract text content with enhanced selectors
      const textContent = await this.extractTextContent(page);
      const imageUrls = await this.extractImages(page);
      const pdfUrls = await this.extractPdfUrls(page);
      
      console.log(`📄 Extracted ${textContent.length} characters of text`);
      console.log(`🖼️ Found ${imageUrls.length} potential recipe images`);
      console.log(`📋 Found ${pdfUrls.length} PDF documents`);
      
      return {
        method: 'html-scraping',
        textContent: textContent.trim(),
        imageUrls,
        pdfUrls,
        originalUrl: url
      };
      
    } catch (error) {
      console.error('🚨 Scraping error:', error);
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    } finally {
      await browser.close();
    }
  }
  
  // Helper method to extract images
  async extractImages(page) {
    return await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => {
          // Filter by size - recipe images are usually substantial
          if (img.naturalWidth < 200 || img.naturalHeight < 150) return false;
          
          // Filter out common non-recipe images
          const src = img.src.toLowerCase();
          const alt = (img.alt || '').toLowerCase();
          const excludePatterns = [
            'logo', 'icon', 'avatar', 'profile', 'social', 'share',
            'advertisement', 'banner', 'header', 'footer', 'sidebar'
          ];
          
          return !excludePatterns.some(pattern => 
            src.includes(pattern) || alt.includes(pattern)
          );
        })
        .map(img => img.src)
        .filter(src => src && src.startsWith('http'));
    });
  }
  
  // Helper method to extract text content
  async extractTextContent(page) {
    return await page.evaluate(() => {
      // Remove scripts, styles, and other non-content elements
      const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, .ad, .advertisement, .social-share, .newsletter');
      elementsToRemove.forEach(el => el.remove());
      
      // Try to find recipe-specific content first
      const recipeSelectors = [
        '.recipe',
        '.recipe-content', 
        '.recipe-container',
        '.recipe-card',
        '[itemtype*="Recipe"]',
        '.post-content',
        '.entry-content',
        'main'
      ];
      
      let recipeContent = '';
      for (const selector of recipeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          recipeContent = element.innerText;
          break;
        }
      }
      
      // Fallback to body content if no recipe-specific content found
      return recipeContent || document.body.innerText;
    });
  }
  
  // Helper method to extract PDF URLs
  async extractPdfUrls(page) {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]'));
      return links.map(link => link.href).filter(href => href);
    });
  }
  
  async downloadPdf(pdfUrl) {
    console.log(`📥 Downloading PDF: ${pdfUrl}`);
    
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('🚨 PDF download error:', error);
      throw error;
    }
  }
}

export default WebScraperService;