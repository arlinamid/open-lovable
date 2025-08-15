import { NextRequest, NextResponse } from 'next/server';

// Function to sanitize smart quotes and other problematic characters
function sanitizeQuotes(text: string): string {
  return text
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace other quote-like characters
    .replace(/[\u00AB\u00BB]/g, '"') // Guillemets
    .replace(/[\u2039\u203A]/g, "'") // Single guillemets
    // Replace other problematic characters
    .replace(/[\u2013\u2014]/g, '-') // En dash and em dash
    .replace(/[\u2026]/g, '...') // Ellipsis
    .replace(/[\u00A0]/g, ' '); // Non-breaking space
}

// Function to extract CSS styles from HTML
function extractStyles(html: string): { styles: string[], inlineStyles: Record<string, string> } {
  const styles: string[] = [];
  const inlineStyles: Record<string, string> = {};
  
  // Extract <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(match[1]);
  }
  
  // Extract external stylesheets
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    styles.push(`/* External stylesheet: ${match[1]} */`);
  }
  
  // Extract inline styles from elements
  const inlineStyleRegex = /<([^>]+)style=["']([^"']+)["']([^>]*)>/gi;
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    const tagName = match[1].split(' ')[0];
    const styleContent = match[2];
    const className = match[3].match(/class=["']([^"']+)["']/)?.[1] || '';
    const id = match[3].match(/id=["']([^"']+)["']/)?.[1] || '';
    
    const selector = id ? `#${id}` : className ? `.${className.split(' ')[0]}` : tagName;
    inlineStyles[selector] = styleContent;
  }
  
  return { styles, inlineStyles };
}

// Function to extract JavaScript from HTML
function extractJavaScript(html: string): { scripts: string[], inlineScripts: string[] } {
  const scripts: string[] = [];
  const inlineScripts: string[] = [];
  
  // Extract <script> tags with src
  const scriptSrcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  let match;
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  
  // Extract inline <script> tags
  const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    if (!match[1].includes('src=')) {
      inlineScripts.push(match[1]);
    }
  }
  
  return { scripts, inlineScripts };
}

// Function to extract images from HTML
function extractImages(html: string, baseUrl: string): Array<{ src: string; alt: string; title: string; width?: string; height?: string }> {
  const images: Array<{ src: string; alt: string; title: string; width?: string; height?: string }> = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    const src = match[1];
    
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      try {
        const absoluteSrc = new URL(src, baseUrl).href;
        
        // Extract additional attributes
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
        const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);
        const widthMatch = imgTag.match(/width=["']([^"']*)["']/i);
        const heightMatch = imgTag.match(/height=["']([^"']*)["']/i);
        
        images.push({
          src: absoluteSrc,
          alt: altMatch ? altMatch[1] : '',
          title: titleMatch ? titleMatch[1] : '',
          width: widthMatch ? widthMatch[1] : undefined,
          height: heightMatch ? heightMatch[1] : undefined
        });
      } catch (e) {
        // Skip invalid URLs
      }
    }
  }
  
  return images;
}

// Function to extract links for multi-page crawling
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        if (absoluteUrl.startsWith(baseUrl)) {
          links.push(absoluteUrl);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

export async function POST(request: NextRequest) {
  try {
    const { 
      url, 
      options = {} 
    } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }
    
    const {
      enableJavaScript = true,
      extractStyles = true,
      extractScripts = true,
      extractImages = true,
      multiPage = false,
      maxPages = 5,
      waitForSelectors = [],
      customActions = [],
      screenshot = false,
      fullPage = false,
      viewport = { width: 1920, height: 1080 },
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    } = options;
    
    console.log('[scrape-url-advanced] Advanced scraping with Firecrawl:', url, options);
    
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    
    // Build actions array
    const actions = [
      // Wait for page load
      {
        type: 'wait',
        milliseconds: 3000
      },
      // Wait for any specified selectors
      ...waitForSelectors.map((selector: string) => ({
        type: 'waitForSelector',
        selector
      })),
      // Execute custom actions
      ...customActions,
      // Additional wait for dynamic content
      {
        type: 'wait',
        milliseconds: 2000
      }
    ];
    
    // Make request to Firecrawl API with advanced options
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html', ...(screenshot ? ['screenshot'] : [])],
        waitFor: 5000,
        timeout: 60000,
        blockAds: true,
        maxAge: 3600000, // Use cached data if less than 1 hour old
        actions,
        screenshot: screenshot ? {
          fullPage,
          viewport
        } : undefined,
        userAgent,
        // Enable JavaScript execution
        ...(enableJavaScript && {
          javascript: true,
          waitForNetworkIdle: true
        })
      })
    });
    
    if (!firecrawlResponse.ok) {
      const error = await firecrawlResponse.text();
      throw new Error(`Firecrawl API error: ${error}`);
    }
    
    const data = await firecrawlResponse.json();
    
    if (!data.success || !data.data) {
      throw new Error('Failed to scrape content');
    }
    
    const { markdown, html, metadata, screenshot: screenshotData } = data.data;
    
    // Sanitize the markdown content
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    
    // Extract structured data
    const title = metadata?.title || '';
    const description = metadata?.description || '';
    
    // Extract styles, scripts, images, and links if requested
    let styles = null;
    let scripts = null;
    let images = null;
    let links = null;
    
    if (extractStyles && html) {
      styles = extractStyles(html);
    }
    
    if (extractScripts && html) {
      scripts = extractJavaScript(html);
    }
    
    if (extractImages && html) {
      images = extractImages(html, url);
    }
    
    if (multiPage && html) {
      links = extractLinks(html, url);
    }
    
    // Format content for AI
    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

Main Content:
${sanitizedMarkdown}
    `.trim();
    
    // Multi-page crawling
    let additionalPages = [];
    if (multiPage && links && links.length > 0) {
      console.log(`[scrape-url-advanced] Found ${links.length} links, crawling up to ${maxPages} additional pages`);
      
      const pagesToCrawl = links.slice(0, maxPages - 1); // -1 because we already have the main page
      
      for (const pageUrl of pagesToCrawl) {
        try {
          console.log(`[scrape-url-advanced] Crawling additional page: ${pageUrl}`);
          
          const pageResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: pageUrl,
              formats: ['markdown', 'html'],
              waitFor: 3000,
              timeout: 30000,
              blockAds: true,
              maxAge: 3600000,
              actions: [
                { type: 'wait', milliseconds: 2000 }
              ],
              userAgent
            })
          });
          
          if (pageResponse.ok) {
            const pageData = await pageResponse.json();
                         if (pageData.success && pageData.data) {
               const pageImages = extractImages ? extractImages(pageData.data.html || '', pageUrl) : null;
               additionalPages.push({
                 url: pageUrl,
                 title: pageData.data.metadata?.title || '',
                 content: sanitizeQuotes(pageData.data.markdown || ''),
                 metadata: pageData.data.metadata,
                 images: pageImages
               });
             }
          }
        } catch (error) {
          console.error(`[scrape-url-advanced] Error crawling ${pageUrl}:`, error);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      url,
      content: formattedContent,
      structured: {
        title: sanitizeQuotes(title),
        description: sanitizeQuotes(description),
        content: sanitizedMarkdown,
        url
      },
      advanced: {
        styles,
        scripts,
        images,
        links,
        additionalPages,
        screenshot: screenshotData
      },
      metadata: {
        scraper: 'firecrawl-advanced',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: data.data.cached || false,
        options: {
          enableJavaScript,
          extractStyles,
          extractScripts,
          extractImages,
          multiPage,
          maxPages,
          screenshot,
          fullPage
        },
        ...metadata
      },
      message: `Advanced scraping completed successfully${multiPage ? ` (${additionalPages.length + 1} pages)` : ''}`
    });
    
  } catch (error) {
    console.error('[scrape-url-advanced] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
