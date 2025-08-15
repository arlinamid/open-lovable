// Multi-page crawling utilities for advanced website scraping

export interface CrawlPage {
  url: string;
  title: string;
  content: string;
  metadata: any;
  links: string[];
  depth: number;
  timestamp: string;
}

export interface CrawlOptions {
  maxPages: number;
  maxDepth: number;
  sameDomain: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
  waitBetweenRequests?: number;
  timeout?: number;
}

export interface CrawlResult {
  pages: CrawlPage[];
  totalPages: number;
  totalLinks: number;
  crawlTime: number;
  errors: string[];
  sitemap: Map<string, CrawlPage>;
}

// Extract all links from HTML content
export function extractLinksFromHTML(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        links.push(absoluteUrl);
      } catch (e) {
        // Skip invalid URLs
      }
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

// Filter links based on patterns and domain
export function filterLinks(
  links: string[], 
  baseUrl: string, 
  options: CrawlOptions
): string[] {
  const baseDomain = new URL(baseUrl).hostname;
  
  return links.filter(link => {
    try {
      const url = new URL(link);
      
      // Check domain restriction
      if (options.sameDomain && url.hostname !== baseDomain) {
        return false;
      }
      
      // Check include patterns
      if (options.includePatterns && options.includePatterns.length > 0) {
        const matchesInclude = options.includePatterns.some(pattern => 
          link.includes(pattern)
        );
        if (!matchesInclude) return false;
      }
      
      // Check exclude patterns
      if (options.excludePatterns && options.excludePatterns.length > 0) {
        const matchesExclude = options.excludePatterns.some(pattern => 
          link.includes(pattern)
        );
        if (matchesExclude) return false;
      }
      
      // Exclude common non-content URLs
      const excludeExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
      if (excludeExtensions.some(ext => link.toLowerCase().includes(ext))) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  });
}

// Crawl a single page using Firecrawl
export async function crawlSinglePage(
  url: string, 
  options: CrawlOptions,
  firecrawlApiKey: string
): Promise<CrawlPage | null> {
  try {
    console.log(`[multi-page-crawler] Crawling: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        waitFor: 3000,
        timeout: options.timeout || 30000,
        blockAds: true,
        maxAge: 3600000,
        actions: [
          { type: 'wait', milliseconds: 2000 }
        ],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Failed to scrape content');
    }
    
    const { markdown, html, metadata } = data.data;
    
    // Extract links from HTML
    const links = extractLinksFromHTML(html, url);
    const filteredLinks = filterLinks(links, url, options);
    
    return {
      url,
      title: metadata?.title || '',
      content: markdown || '',
      metadata,
      links: filteredLinks,
      depth: 0, // Will be set by the crawler
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`[multi-page-crawler] Error crawling ${url}:`, error);
    return null;
  }
}

// Main multi-page crawler function
export async function crawlWebsite(
  startUrl: string,
  options: CrawlOptions = {
    maxPages: 10,
    maxDepth: 2,
    sameDomain: true,
    waitBetweenRequests: 1000
  }
): Promise<CrawlResult> {
  const startTime = Date.now();
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  
  if (!firecrawlApiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }
  
  const pages: CrawlPage[] = [];
  const sitemap = new Map<string, CrawlPage>();
  const errors: string[] = [];
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  
  console.log(`[multi-page-crawler] Starting crawl from: ${startUrl}`);
  console.log(`[multi-page-crawler] Options:`, options);
  
  while (queue.length > 0 && pages.length < options.maxPages) {
    const { url, depth } = queue.shift()!;
    
    if (visited.has(url) || depth > options.maxDepth) {
      continue;
    }
    
    visited.add(url);
    
    // Crawl the page
    const page = await crawlSinglePage(url, options, firecrawlApiKey);
    
    if (page) {
      page.depth = depth;
      pages.push(page);
      sitemap.set(url, page);
      
      console.log(`[multi-page-crawler] Successfully crawled: ${url} (depth: ${depth})`);
      
      // Add new links to queue if we haven't reached max depth
      if (depth < options.maxDepth) {
        for (const link of page.links) {
          if (!visited.has(link) && !queue.some(item => item.url === link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } else {
      errors.push(`Failed to crawl: ${url}`);
    }
    
    // Wait between requests to be respectful
    if (options.waitBetweenRequests && queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, options.waitBetweenRequests));
    }
  }
  
  const totalLinks = pages.reduce((sum, page) => sum + page.links.length, 0);
  const crawlTime = Date.now() - startTime;
  
  console.log(`[multi-page-crawler] Crawl completed:`);
  console.log(`  - Pages crawled: ${pages.length}`);
  console.log(`  - Total links found: ${totalLinks}`);
  console.log(`  - Crawl time: ${crawlTime}ms`);
  console.log(`  - Errors: ${errors.length}`);
  
  return {
    pages,
    totalPages: pages.length,
    totalLinks,
    crawlTime,
    errors,
    sitemap
  };
}

// Generate a sitemap from crawled pages
export function generateSitemap(crawlResult: CrawlResult): string {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const page of crawlResult.pages) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${page.url}</loc>\n`;
    sitemap += `    <lastmod>${page.timestamp}</lastmod>\n`;
    if (page.title) {
      sitemap += `    <title>${page.title}</title>\n`;
    }
    sitemap += '  </url>\n';
  }
  
  sitemap += '</urlset>';
  return sitemap;
}

// Analyze crawled pages for common patterns
export function analyzeCrawledPages(crawlResult: CrawlResult): {
  commonElements: string[];
  pageTypes: Map<string, number>;
  linkStructure: Map<string, string[]>;
  contentSummary: {
    totalContent: number;
    averageContentLength: number;
    longestPage: string;
    shortestPage: string;
  };
} {
  const commonElements: string[] = [];
  const pageTypes = new Map<string, number>();
  const linkStructure = new Map<string, string[]>();
  
  // Analyze page types based on URL patterns
  for (const page of crawlResult.pages) {
    const url = new URL(page.url);
    const path = url.pathname;
    
    // Determine page type
    let pageType = 'page';
    if (path.includes('/blog/') || path.includes('/post/') || path.includes('/article/')) {
      pageType = 'blog';
    } else if (path.includes('/product/') || path.includes('/item/')) {
      pageType = 'product';
    } else if (path.includes('/category/') || path.includes('/tag/')) {
      pageType = 'category';
    } else if (path === '/' || path === '') {
      pageType = 'home';
    } else if (path.includes('/about/') || path.includes('/contact/')) {
      pageType = 'info';
    }
    
    pageTypes.set(pageType, (pageTypes.get(pageType) || 0) + 1);
    
    // Analyze link structure
    linkStructure.set(page.url, page.links);
  }
  
  // Find common elements across pages
  const allContent = crawlResult.pages.map(p => p.content).join(' ');
  const commonWords = allContent
    .toLowerCase()
    .match(/\b\w+\b/g)
    ?.reduce((acc: Record<string, number>, word: string) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {}) || {};
  
  const sortedWords = Object.entries(commonWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
  
  commonElements.push(...sortedWords);
  
  // Content summary
  const contentLengths = crawlResult.pages.map(p => p.content.length);
  const totalContent = contentLengths.reduce((sum, len) => sum + len, 0);
  const averageContentLength = totalContent / crawlResult.pages.length;
  
  const longestPage = crawlResult.pages.reduce((longest, current) => 
    current.content.length > longest.content.length ? current : longest
  ).url;
  
  const shortestPage = crawlResult.pages.reduce((shortest, current) => 
    current.content.length < shortest.content.length ? current : shortest
  ).url;
  
  return {
    commonElements,
    pageTypes,
    linkStructure,
    contentSummary: {
      totalContent,
      averageContentLength,
      longestPage,
      shortestPage
    }
  };
}

// Generate a comprehensive report from crawled data
export function generateCrawlReport(crawlResult: CrawlResult): string {
  const analysis = analyzeCrawledPages(crawlResult);
  
  let report = `# Website Crawl Report\n\n`;
  report += `**Crawl Summary:**\n`;
  report += `- Start URL: ${crawlResult.pages[0]?.url || 'N/A'}\n`;
  report += `- Total Pages: ${crawlResult.totalPages}\n`;
  report += `- Total Links: ${crawlResult.totalLinks}\n`;
  report += `- Crawl Time: ${crawlResult.crawlTime}ms\n`;
  report += `- Errors: ${crawlResult.errors.length}\n\n`;
  
  report += `**Page Types:**\n`;
  for (const [type, count] of analysis.pageTypes) {
    report += `- ${type}: ${count} pages\n`;
  }
  report += `\n`;
  
  report += `**Content Analysis:**\n`;
  report += `- Total Content: ${analysis.contentSummary.totalContent} characters\n`;
  report += `- Average Content Length: ${Math.round(analysis.contentSummary.averageContentLength)} characters\n`;
  report += `- Longest Page: ${analysis.contentSummary.longestPage}\n`;
  report += `- Shortest Page: ${analysis.contentSummary.shortestPage}\n\n`;
  
  report += `**Common Elements:**\n`;
  report += analysis.commonElements.slice(0, 10).join(', ') + '\n\n';
  
  report += `**Pages Crawled:**\n`;
  for (const page of crawlResult.pages) {
    report += `- [${page.title || 'Untitled'}](${page.url}) (${page.links.length} links)\n`;
  }
  
  if (crawlResult.errors.length > 0) {
    report += `\n**Errors:**\n`;
    for (const error of crawlResult.errors) {
      report += `- ${error}\n`;
    }
  }
  
  return report;
}
