import UrlDetectionService from './urlDetectionService.js';
import UrlDiscoveryService from './urlDiscoveryService.js';
import WebScraperService from './webScraper.js';
import GeminiVisionService from './geminiVision.js';
import GroqService from './groqService.js';
import TextProcessor from './textProcessor.js';

class SmartExtractionRouter {
  constructor() {
    this.urlDetector = new UrlDetectionService();
    this.urlDiscovery = new UrlDiscoveryService();
  }

  // Main routing function that determines the extraction strategy
  async extractFromUrl(url, options = {}) {
    console.log(`🎯 SmartRouter: Starting extraction for ${url}`);
    
    try {
      // Step 1: Analyze the URL to determine type
      const urlAnalysis = this.urlDetector.detectUrlType(url);
      console.log(`📊 URL Analysis: ${urlAnalysis.type} → ${urlAnalysis.action}`);
      console.log(`💡 Reasoning: ${urlAnalysis.reason}`);

      // Step 2: Route based on URL type
      switch (urlAnalysis.action) {
        case 'discovery':
          return await this.handleDiscoveryRoute(url, urlAnalysis, options);
        
        case 'extract':
          return await this.handleExtractionRoute(url, urlAnalysis, options);
        
        default:
          throw new Error(`Unknown action: ${urlAnalysis.action}`);
      }

    } catch (error) {
      console.error('🚨 SmartRouter error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          originalUrl: url,
          routerError: true
        }
      };
    }
  }

  // Handle discovery route (homepages, category pages)
  async handleDiscoveryRoute(url, urlAnalysis, options) {
    console.log(`🔍 Discovery Route: Finding recipes on ${urlAnalysis.type}`);
    
    try {
      // Discover all recipe URLs from the page
      const discoveredUrls = await this.urlDiscovery.discoverRecipeUrls(url);
      
      if (discoveredUrls.length === 0) {
        return {
          success: false,
          error: 'No recipe URLs found on this page',
          metadata: {
            originalUrl: url,
            urlType: urlAnalysis.type,
            discoveredUrls: 0
          }
        };
      }

      console.log(`✅ Found ${discoveredUrls.length} recipe URLs`);

      // Limit the number of recipes to extract (default: 10 for single endpoint)
      const maxRecipes = options.maxRecipes || 10;
      const urlsToExtract = discoveredUrls.slice(0, maxRecipes);
      
      console.log(`📋 Extracting from ${urlsToExtract.length} recipe URLs`);

      // Extract recipes from discovered URLs
      const extractionResults = [];
      const extractionErrors = [];

      for (let i = 0; i < urlsToExtract.length; i++) {
        const recipeUrl = urlsToExtract[i];
        console.log(`🍳 [${i + 1}/${urlsToExtract.length}] Extracting: ${recipeUrl}`);

        try {
          const result = await this.extractSingleRecipe(recipeUrl);
          
          if (result.success) {
            extractionResults.push({
              url: recipeUrl,
              recipe: result.recipe,
              metadata: result.metadata
            });
            console.log(`✅ [${i + 1}/${urlsToExtract.length}] Success: ${result.recipe.title}`);
          } else {
            extractionErrors.push({
              url: recipeUrl,
              error: result.error
            });
            console.log(`❌ [${i + 1}/${urlsToExtract.length}] Failed: ${result.error}`);
          }
        } catch (error) {
          extractionErrors.push({
            url: recipeUrl,
            error: error.message
          });
          console.log(`🚨 [${i + 1}/${urlsToExtract.length}] Error: ${error.message}`);
        }

        // Add delay between extractions to be respectful
        if (i < urlsToExtract.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        }
      }

      // Return results
      const successCount = extractionResults.length;
      const failureCount = extractionErrors.length;

      if (successCount === 0) {
        return {
          success: false,
          error: 'Failed to extract any recipes from discovered URLs',
          metadata: {
            originalUrl: url,
            urlType: urlAnalysis.type,
            discoveredUrls: discoveredUrls.length,
            attemptedExtractions: urlsToExtract.length,
            failures: extractionErrors
          }
        };
      }

      return {
        success: true,
        type: 'multi-recipe',
        recipes: extractionResults,
        summary: {
          originalUrl: url,
          urlType: urlAnalysis.type,
          totalDiscovered: discoveredUrls.length,
          attempted: urlsToExtract.length,
          successful: successCount,
          failed: failureCount,
          successRate: `${Math.round((successCount / urlsToExtract.length) * 100)}%`
        },
        errors: extractionErrors.length > 0 ? extractionErrors : undefined
      };

    } catch (error) {
      console.error('🚨 Discovery route error:', error);
      return {
        success: false,
        error: `Discovery failed: ${error.message}`,
        metadata: {
          originalUrl: url,
          urlType: urlAnalysis.type,
          discoveryError: true
        }
      };
    }
  }

  // Handle extraction route (specific recipe pages)
  async handleExtractionRoute(url, urlAnalysis, options) {
    console.log(`🍳 Extraction Route: Direct recipe extraction from ${urlAnalysis.type}`);
    
    try {
      const result = await this.extractSingleRecipe(url);
      
      if (result.success) {
        return {
          success: true,
          type: 'single-recipe',
          recipe: result.recipe,
          metadata: {
            ...result.metadata,
            urlType: urlAnalysis.type,
            routingReason: urlAnalysis.reason
          }
        };
      } else {
        return {
          success: false,
          error: result.error,
          metadata: {
            originalUrl: url,
            urlType: urlAnalysis.type,
            extractionError: true
          }
        };
      }

    } catch (error) {
      console.error('🚨 Extraction route error:', error);
      return {
        success: false,
        error: `Extraction failed: ${error.message}`,
        metadata: {
          originalUrl: url,
          urlType: urlAnalysis.type,
          extractionError: true
        }
      };
    }
  }

  // Single recipe extraction using our proven multi-step pipeline
  async extractSingleRecipe(url) {
    try {
      console.log(`🔧 Using multi-step extractor for: ${url}`);

      // Initialize services
      const webScraper = new WebScraperService();
      const gemini = new GeminiVisionService();
      const groq = new GroqService();
      const textProcessor = new TextProcessor();

      // Step 1: Web scraping with stealth mode
      const scrapedData = await webScraper.scrapeRecipePage(url);

      let extractedRecipe;
      let mainImageUrl = '';

      if (scrapedData.method === 'json-ld') {
        // Fast JSON-LD path
        console.log(`⚡ Using fast JSON-LD extraction`);
        const imageUrls = scrapedData.imageUrls || [];
        if (imageUrls.length > 0) {
          mainImageUrl = await gemini.identifyMainRecipeImage(imageUrls);
        }

        const jsonLdText = JSON.stringify(scrapedData.jsonLdRecipe);
        extractedRecipe = await groq.extractStructuredRecipe(jsonLdText, mainImageUrl);

      } else {
        // Enhanced HTML scraping path
        console.log(`🐌 Using enhanced HTML extraction`);
        const imageUrls = scrapedData.imageUrls || [];
        let geminiResponse = null;
        
        if (imageUrls.length > 0) {
          mainImageUrl = await gemini.identifyMainRecipeImage(imageUrls);
        }

        // Text processing and extraction
        const combinedText = textProcessor.combineTexts(
          scrapedData.textContent,
          '',
          ''
        );

        const cleanedText = textProcessor.cleanText(combinedText);
        extractedRecipe = await groq.extractStructuredRecipe(cleanedText, mainImageUrl);
      }

      return {
        success: true,
        recipe: extractedRecipe,
        metadata: {
          originalUrl: url,
          extractionMethod: scrapedData.method,
          extractedImages: scrapedData.imageUrls?.length || 0,
          mainImageSelected: !!mainImageUrl,
          textLength: scrapedData.method === 'json-ld' ? 
            JSON.stringify(scrapedData.jsonLdRecipe).length :
            scrapedData.textContent.length
        }
      };

    } catch (error) {
      console.error(`🚨 Single recipe extraction error for ${url}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get URL analysis without extraction (for debugging)
  analyzeUrl(url) {
    return this.urlDetector.detectUrlType(url);
  }
}

export default SmartExtractionRouter;