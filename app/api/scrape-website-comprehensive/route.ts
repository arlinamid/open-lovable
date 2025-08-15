import { NextRequest, NextResponse } from 'next/server';
import { extractAndConvertStyles, analyzeWebsiteStyles } from '@/lib/style-extractor';
import { crawlWebsite, generateCrawlReport, CrawlOptions } from '@/lib/multi-page-crawler';

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

// Function to sanitize smart quotes and other problematic characters
function sanitizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00AB\u00BB]/g, '"')
    .replace(/[\u2039\u203A]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ');
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
      // Basic scraping options
      enableJavaScript = true,
      extractStyles = true,
      extractScripts = true,
      extractImages = true,
      screenshot = false,
      fullPage = false,
      viewport = { width: 1920, height: 1080 },
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      
      // Multi-page crawling options
      multiPage = false,
      maxPages = 5,
      maxDepth = 2,
      sameDomain = true,
      includePatterns = [],
      excludePatterns = [],
      waitBetweenRequests = 1000,
      
      // Advanced options
      waitForSelectors = [],
      customActions = [],
      generateReport = true,
      analyzeStyles = true
    } = options;
    
    console.log('[scrape-website-comprehensive] Comprehensive scraping:', url, options);
    
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    
    // Build actions array for the main page
    const actions = [
      { type: 'wait', milliseconds: 3000 },
      ...waitForSelectors.map(selector => ({
        type: 'waitForSelector',
        selector
      })),
      ...customActions,
      { type: 'wait', milliseconds: 2000 }
    ];
    
    // Step 1: Scrape the main page with advanced options
    console.log('[scrape-website-comprehensive] Step 1: Scraping main page');
    
    const mainPageResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
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
        maxAge: 3600000,
        actions,
        screenshot: screenshot ? {
          fullPage,
          viewport
        } : undefined,
        userAgent,
        ...(enableJavaScript && {
          javascript: true,
          waitForNetworkIdle: true
        })
      })
    });
    
    if (!mainPageResponse.ok) {
      const error = await mainPageResponse.text();
      throw new Error(`Firecrawl API error: ${error}`);
    }
    
    const mainPageData = await mainPageResponse.json();
    
    if (!mainPageData.success || !mainPageData.data) {
      throw new Error('Failed to scrape main page');
    }
    
    const { markdown, html, metadata, screenshot: screenshotData } = mainPageData.data;
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    const title = metadata?.title || '';
    const description = metadata?.description || '';
    
    // Step 2: Extract and analyze styles
    let styleAnalysis = null;
    let tailwindMappings = null;
    
    if (extractStyles && html && analyzeStyles) {
      console.log('[scrape-website-comprehensive] Step 2: Analyzing styles');
      
      const { styles, tailwindMappings: mappings } = extractAndConvertStyles(html);
      const analysis = analyzeWebsiteStyles(html, sanitizedMarkdown);
      
      styleAnalysis = {
        extractedStyles: styles,
        tailwindMappings: mappings,
        analysis
      };
      tailwindMappings = mappings;
    }
    
    // Step 3: Multi-page crawling
    let crawlResult = null;
    let crawlReport = null;
    
    if (multiPage) {
      console.log('[scrape-website-comprehensive] Step 3: Multi-page crawling');
      
      const crawlOptions: CrawlOptions = {
        maxPages,
        maxDepth,
        sameDomain,
        includePatterns,
        excludePatterns,
        waitBetweenRequests,
        timeout: 30000
      };
      
      crawlResult = await crawlWebsite(url, crawlOptions);
      
      if (generateReport) {
        crawlReport = generateCrawlReport(crawlResult);
      }
    }
    
    // Step 4: Extract scripts if requested
    let scriptAnalysis = null;
    
    if (extractScripts && html) {
      console.log('[scrape-website-comprehensive] Step 4: Analyzing scripts');
      
      const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
      const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      
      const externalScripts: string[] = [];
      const inlineScripts: string[] = [];
      
      let match;
      while ((match = scriptRegex.exec(html)) !== null) {
        externalScripts.push(match[1]);
      }
      
      while ((match = inlineScriptRegex.exec(html)) !== null) {
        if (!match[1].includes('src=')) {
          inlineScripts.push(match[1]);
        }
      }
      
      scriptAnalysis = {
        externalScripts,
        inlineScripts,
        totalScripts: externalScripts.length + inlineScripts.length
      };
    }
    
    // Step 5: Extract images if requested
    let imageAnalysis = null;
    
    if (extractImages && html) {
      console.log('[scrape-website-comprehensive] Step 5: Analyzing images');
      
      const images = extractImages(html, url);
      
      imageAnalysis = {
        images,
        totalImages: images.length,
        imagesWithAlt: images.filter(img => img.alt.trim() !== '').length,
        imagesWithTitle: images.filter(img => img.title.trim() !== '').length,
        imageTypes: [...new Set(images.map(img => {
          const extension = img.src.split('.').pop()?.toLowerCase();
          return extension || 'unknown';
        }))]
      };
    }
    
    // Step 6: Generate comprehensive content
    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

Main Content:
${sanitizedMarkdown}
    `.trim();
    
    // Step 7: Generate AI-friendly summary
    const aiSummary = {
      website: {
        title,
        description,
        url,
        mainContent: sanitizedMarkdown
      },
      styleRecommendations: styleAnalysis?.analysis.tailwindRecommendations || [],
      componentStructure: styleAnalysis?.analysis.componentStructure || [],
      pageCount: crawlResult?.totalPages || 1,
      hasJavaScript: scriptAnalysis?.totalScripts > 0,
      hasStyles: styleAnalysis?.extractedStyles.length > 0,
      hasImages: imageAnalysis?.totalImages > 0
    };
    
    // Step 8: Prepare response
    const response = {
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
        styles: styleAnalysis,
        scripts: scriptAnalysis,
        images: imageAnalysis,
        crawl: crawlResult,
        screenshot: screenshotData
      },
      analysis: {
        aiSummary,
        crawlReport,
        styleAnalysis: styleAnalysis?.analysis,
        tailwindMappings
      },
      metadata: {
        scraper: 'firecrawl-comprehensive',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: mainPageData.data.cached || false,
        options: {
          enableJavaScript,
          extractStyles,
          extractScripts,
          extractImages,
          multiPage,
          maxPages,
          maxDepth,
          screenshot,
          fullPage,
          analyzeStyles
        },
        ...metadata
      },
      message: `Comprehensive scraping completed successfully${
        multiPage && crawlResult ? ` (${crawlResult.totalPages} pages)` : ''
      }`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[scrape-website-comprehensive] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
