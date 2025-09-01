import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Configure stealth mode
puppeteer.use(StealthPlugin());

class UrlDiscoveryService {
  constructor() {
    this.discoveredUrls = new Set();
    this.processed = new Set();
  }

  // Main discovery method - tries multiple strategies
  async discoverRecipeUrls(homepageUrl) {
    console.log(`🔍 Starting URL discovery for: ${homepageUrl}`);
    
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
      ]
    });

    try {
      // Try multiple discovery methods in parallel
      const discoveryPromises = [
        this.discoverFromSitemap(homepageUrl),
        this.discoverFromHomepage(browser, homepageUrl),
        this.discoverFromNavigation(browser, homepageUrl)
      ];

      const results = await Promise.allSettled(discoveryPromises);
      
      // Combine results from all methods
      const allUrls = new Set();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          result.value.forEach(url => allUrls.add(url));
          console.log(`✅ Method ${index + 1} found ${result.value.length} URLs`);
        } else {
          console.log(`⚠️ Method ${index + 1} failed: ${result.reason.message}`);
        }
      });

      const finalUrls = Array.from(allUrls);
      console.log(`🎯 Total unique recipe URLs discovered: ${finalUrls.length}`);
      
      return finalUrls;

    } catch (error) {
      console.error('🚨 URL discovery error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  // Method 1: Try to find sitemap.xml
  async discoverFromSitemap(baseUrl) {
    console.log('📋 Method 1: Checking sitemap...');
    
    try {
      const sitemapUrls = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap_index.xml`,
        `${baseUrl}/recipe-sitemap.xml`,
        `${baseUrl}/wp-sitemap-posts-post-1.xml`
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await fetch(sitemapUrl);
          if (response.ok) {
            const sitemapText = await response.text();
            const urls = this.extractUrlsFromSitemap(sitemapText);
            if (urls.length > 0) {
              console.log(`✅ Found sitemap at ${sitemapUrl} with ${urls.length} URLs`);
              return urls;
            }
          }
        } catch (e) {
          // Try next sitemap URL
        }
      }
      
      console.log('⚠️ No accessible sitemap found');
      return [];
    } catch (error) {
      console.log('⚠️ Sitemap discovery failed:', error.message);
      return [];
    }
  }

  // Method 2: Analyze homepage structure
  async discoverFromHomepage(browser, homepageUrl) {
    console.log('🏠 Method 2: Analyzing homepage...');
    
    const page = await browser.newPage();
    
    try {
      // Set stealth headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      await page.goto(homepageUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(3000);

      const urls = await page.evaluate((baseUrl) => {
        const recipeUrls = new Set();
        
        // Common recipe URL patterns
        const recipePatterns = [
          /\/recipe\//i,
          /\/recipes\//i,
          /\/cooking\//i,
          /\/food\//i,
          /\/dish\//i,
          /\/meal\//i
        ];

        // Find all links on the page
        const links = Array.from(document.querySelectorAll('a[href]'));
        
        links.forEach(link => {
          const href = link.href;
          
          // Check if URL matches recipe patterns
          if (recipePatterns.some(pattern => pattern.test(href))) {
            // Ensure it's from the same domain
            try {
              const linkUrl = new URL(href);
              const baseUrlObj = new URL(baseUrl);
              if (linkUrl.hostname === baseUrlObj.hostname) {
                recipeUrls.add(href);
              }
            } catch (e) {
              // Skip invalid URLs
            }
          }
        });

        return Array.from(recipeUrls);
      }, homepageUrl);

      console.log(`🏠 Homepage analysis found ${urls.length} potential recipe URLs`);
      return urls;

    } catch (error) {
      console.log('⚠️ Homepage analysis failed:', error.message);
      return [];
    } finally {
      await page.close();
    }
  }

  // Method 3: Navigate through recipe sections
  async discoverFromNavigation(browser, homepageUrl) {
    console.log('🧭 Method 3: Navigation discovery...');
    
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      await page.goto(homepageUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await page.waitForTimeout(3000);

      const urls = await page.evaluate((baseUrl) => {
        const recipeUrls = new Set();
        
        // Look for recipe category links
        const categorySelectors = [
          'a[href*="recipe"]',
          'a[href*="cooking"]',
          'a[href*="food"]',
          'nav a',
          '.menu a',
          '.navigation a',
          '.recipe-categories a',
          '.category a'
        ];

        categorySelectors.forEach(selector => {
          try {
            const links = Array.from(document.querySelectorAll(selector));
            links.forEach(link => {
              const href = link.href;
              if (href && href.includes(new URL(baseUrl).hostname)) {
                const text = link.textContent.toLowerCase();
                
                // Look for recipe-related navigation
                if (text.includes('recipe') || text.includes('cooking') || 
                    text.includes('food') || text.includes('meal') ||
                    text.includes('appetizer') || text.includes('main') ||
                    text.includes('dessert') || text.includes('breakfast')) {
                  recipeUrls.add(href);
                }
              }
            });
          } catch (e) {
            // Skip invalid selectors
          }
        });

        return Array.from(recipeUrls);
      }, homepageUrl);

      console.log(`🧭 Navigation discovery found ${urls.length} category URLs`);
      
      // TODO: Could expand this to actually visit category pages and extract recipe links
      return urls;

    } catch (error) {
      console.log('⚠️ Navigation discovery failed:', error.message);
      return [];
    } finally {
      await page.close();
    }
  }

  // Helper: Extract URLs from sitemap XML
  extractUrlsFromSitemap(sitemapText) {
    const urls = [];
    
    // Basic XML parsing for URLs
    const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
    
    if (urlMatches) {
      urlMatches.forEach(match => {
        const url = match.replace(/<\/?loc>/g, '');
        
        // Filter for recipe-like URLs
        if (this.isRecipeUrl(url)) {
          urls.push(url);
        }
      });
    }
    
    return urls;
  }

  // Helper: Check if URL looks like a recipe
  isRecipeUrl(url) {
    const recipeIndicators = [
      '/recipe/',
      '/recipes/',
      '/cooking/',
      '/food/',
      '/dish/',
      '/meal/',
      'recipe',
      'cooking'
    ];
    
    const lowercaseUrl = url.toLowerCase();
    return recipeIndicators.some(indicator => lowercaseUrl.includes(indicator));
  }

  // Get domain from URL
  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return null;
    }
  }
}

export default UrlDiscoveryService;