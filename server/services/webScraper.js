import puppeteer from 'puppeteer';

class WebScraperService {
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
      
      // Wait for potential recipe content to load
      try {
        await page.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        // Continue if no specific selector found
      }
      
      // Extract text content
      const textContent = await page.evaluate(() => {
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
      
      // Extract image URLs (filter by size and relevance)
      const imageUrls = await page.evaluate(() => {
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
      
      // Check for PDF links
      const pdfUrls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]'));
        return links.map(link => link.href).filter(href => href);
      });
      
      console.log(`📄 Extracted ${textContent.length} characters of text`);
      console.log(`🖼️ Found ${imageUrls.length} potential recipe images`);
      console.log(`📋 Found ${pdfUrls.length} PDF documents`);
      
      return {
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