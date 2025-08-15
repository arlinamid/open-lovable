# Advanced Crawling Features

This document describes the advanced crawling capabilities implemented in Open Lovable, including JavaScript execution, style extraction, multi-page crawling, and comprehensive website analysis.

## Overview

The advanced crawling system provides three levels of scraping capabilities:

1. **Basic Scraping** (`/api/scrape-url-enhanced`) - Enhanced single-page scraping with caching
2. **Advanced Scraping** (`/api/scrape-url-advanced`) - JavaScript execution, style/script extraction
3. **Comprehensive Scraping** (`/api/scrape-website-comprehensive`) - Multi-page crawling with AI analysis

## Features

### 🚀 JavaScript Execution

Enable JavaScript rendering for dynamic content that requires client-side execution.

```javascript
// Example: Scrape a React SPA
const response = await fetch('/api/scrape-url-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      enableJavaScript: true,
      waitForSelectors: ['.content-loaded', '#app'],
      customActions: [
        { type: 'wait', milliseconds: 3000 },
        { type: 'click', selector: '.load-more' },
        { type: 'wait', milliseconds: 2000 }
      ]
    }
  })
});
```

**Available Actions:**
- `wait` - Wait for specified milliseconds
- `waitForSelector` - Wait for a CSS selector to appear
- `click` - Click on an element
- `scroll` - Scroll the page
- `type` - Type text into an input field
- `screenshot` - Take a screenshot

### 🎨 Style Extraction & Analysis

Extract and analyze CSS styles from websites, including conversion to Tailwind classes.

```javascript
// Example: Extract and analyze styles
const response = await fetch('/api/scrape-url-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      extractStyles: true,
      analyzeStyles: true
    }
  })
});

// Response includes:
// - Extracted CSS from <style> tags
// - External stylesheet URLs
// - Inline styles from elements
// - Tailwind class mappings
// - Style analysis and recommendations
```

**Style Analysis Features:**
- **CSS Parsing**: Extract styles from `<style>` tags and external stylesheets
- **Inline Style Detection**: Parse inline styles from HTML elements
- **Tailwind Conversion**: Convert common CSS properties to Tailwind classes
- **Color Scheme Analysis**: Identify primary colors and color patterns
- **Typography Analysis**: Analyze font families, sizes, and weights
- **Layout Analysis**: Detect flexbox, grid, and positioning patterns

### 🖼️ Image Extraction & Analysis

Extract and analyze images from websites, including metadata and accessibility information.

```javascript
// Example: Extract and analyze images
const response = await fetch('/api/scrape-url-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      extractImages: true
    }
  })
});

// Response includes:
// - All images with absolute URLs
// - Alt text and title attributes
// - Width and height dimensions
// - Image type analysis
// - Accessibility metrics
```

**Image Analysis Features:**
- **Complete Image Extraction**: Extract all `<img>` tags with absolute URLs
- **Metadata Analysis**: Parse alt text, title attributes, and dimensions
- **Accessibility Metrics**: Count images with/without alt text
- **Image Type Detection**: Identify file types (jpg, png, webp, etc.)
- **Multi-page Image Support**: Extract images from all crawled pages
- **Relative URL Resolution**: Convert relative URLs to absolute URLs

### 🕷️ Multi-Page Crawling

Crawl multiple pages from a website to build comprehensive understanding.

```javascript
// Example: Multi-page crawling
const response = await fetch('/api/scrape-website-comprehensive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      multiPage: true,
      maxPages: 10,
      maxDepth: 2,
      sameDomain: true,
      includePatterns: ['/blog/', '/products/'],
      excludePatterns: ['/admin/', '/login/'],
      waitBetweenRequests: 1000
    }
  })
});
```

**Crawling Options:**
- **maxPages**: Maximum number of pages to crawl
- **maxDepth**: Maximum link depth from the starting URL
- **sameDomain**: Only crawl pages from the same domain
- **includePatterns**: URL patterns to include (regex or string)
- **excludePatterns**: URL patterns to exclude
- **waitBetweenRequests**: Delay between requests (milliseconds)

### 🤖 AI-Friendly Analysis

Generate comprehensive analysis for AI code generation.

```javascript
// Example: Comprehensive analysis
const response = await fetch('/api/scrape-website-comprehensive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      enableJavaScript: true,
      extractStyles: true,
      extractScripts: true,
      multiPage: true,
      generateReport: true,
      analyzeStyles: true
    }
  })
});
```

**AI Analysis Features:**
- **Component Structure Recommendations**: Suggest React component hierarchy
- **Style Recommendations**: Provide Tailwind class suggestions
- **Page Type Detection**: Identify home pages, blog posts, product pages, etc.
- **Content Analysis**: Analyze text content and structure
- **Link Structure Analysis**: Map relationships between pages
- **Comprehensive Reports**: Generate detailed crawl reports

## API Endpoints

### `/api/scrape-url-advanced`

Advanced single-page scraping with JavaScript execution and style extraction.

**Request:**
```javascript
{
  url: string,
  options?: {
    enableJavaScript?: boolean,
    extractStyles?: boolean,
    extractScripts?: boolean,
    extractImages?: boolean,
    multiPage?: boolean,
    maxPages?: number,
    waitForSelectors?: string[],
    customActions?: any[],
    screenshot?: boolean,
    fullPage?: boolean,
    viewport?: { width: number, height: number },
    userAgent?: string
  }
}
```

**Response:**
```javascript
{
  success: boolean,
  url: string,
  content: string,
  structured: {
    title: string,
    description: string,
    content: string,
    url: string
  },
  advanced: {
    styles: {
      styles: string[],
      inlineStyles: Record<string, string>
    },
    scripts: {
      scripts: string[],
      inlineScripts: string[]
    },
    links: string[],
    additionalPages: Array<{
      url: string,
      title: string,
      content: string,
      metadata: any
    }>,
    screenshot?: string
  },
  metadata: any
}
```

### `/api/scrape-website-comprehensive`

Comprehensive website analysis with multi-page crawling and AI-friendly summaries.

**Request:**
```javascript
{
  url: string,
  options?: {
    // Basic scraping options
    enableJavaScript?: boolean,
    extractStyles?: boolean,
    extractScripts?: boolean,
    screenshot?: boolean,
    fullPage?: boolean,
    viewport?: { width: number, height: number },
    userAgent?: string,
    
    // Multi-page crawling options
    multiPage?: boolean,
    maxPages?: number,
    maxDepth?: number,
    sameDomain?: boolean,
    includePatterns?: string[],
    excludePatterns?: string[],
    waitBetweenRequests?: number,
    
    // Advanced options
    waitForSelectors?: string[],
    customActions?: any[],
    generateReport?: boolean,
    analyzeStyles?: boolean
  }
}
```

**Response:**
```javascript
{
  success: boolean,
  url: string,
  content: string,
  structured: {
    title: string,
    description: string,
    content: string,
    url: string
  },
  advanced: {
    styles: {
      extractedStyles: ExtractedStyle[],
      tailwindMappings: TailwindMapping[],
      analysis: StyleAnalysis
    },
    scripts: {
      externalScripts: string[],
      inlineScripts: string[],
      totalScripts: number
    },
    crawl: CrawlResult,
    screenshot?: string
  },
  analysis: {
    aiSummary: {
      website: { title, description, url, mainContent },
      styleRecommendations: string[],
      componentStructure: string[],
      pageCount: number,
      hasJavaScript: boolean,
      hasStyles: boolean
    },
    crawlReport?: string,
    styleAnalysis?: StyleAnalysis,
    tailwindMappings?: TailwindMapping[]
  },
  metadata: any
}
```

## Data Types

### ExtractedStyle
```typescript
interface ExtractedStyle {
  selector: string;
  properties: Record<string, string>;
  specificity: number;
  isInline: boolean;
}
```

### TailwindMapping
```typescript
interface TailwindMapping {
  originalSelector: string;
  tailwindClasses: string[];
  customStyles?: Record<string, string>;
}
```

### CrawlPage
```typescript
interface CrawlPage {
  url: string;
  title: string;
  content: string;
  metadata: any;
  links: string[];
  depth: number;
  timestamp: string;
}
```

### CrawlResult
```typescript
interface CrawlResult {
  pages: CrawlPage[];
  totalPages: number;
  totalLinks: number;
  crawlTime: number;
  errors: string[];
  sitemap: Map<string, CrawlPage>;
}
```

## Use Cases

### 1. React SPA Scraping
```javascript
// Scrape a React application with dynamic content
const response = await fetch('/api/scrape-url-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://react-app.example.com',
    options: {
      enableJavaScript: true,
      waitForSelectors: ['#root', '.app-loaded'],
      customActions: [
        { type: 'wait', milliseconds: 5000 },
        { type: 'scroll', selector: 'body' }
      ]
    }
  })
});
```

### 2. Style Analysis for Component Generation
```javascript
// Extract styles to help generate React components
const response = await fetch('/api/scrape-url-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://design-system.example.com',
    options: {
      extractStyles: true,
      analyzeStyles: true
    }
  })
});

// Use the extracted styles to generate Tailwind-based components
const tailwindMappings = response.analysis.tailwindMappings;
```

### 3. Multi-Page Website Analysis
```javascript
// Analyze an entire website structure
const response = await fetch('/api/scrape-website-comprehensive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://ecommerce.example.com',
    options: {
      multiPage: true,
      maxPages: 20,
      maxDepth: 3,
      includePatterns: ['/products/', '/categories/'],
      generateReport: true
    }
  })
});

// Generate a comprehensive report
const report = response.analysis.crawlReport;
```

### 4. AI-Powered Code Generation
```javascript
// Get AI-friendly analysis for code generation
const response = await fetch('/api/scrape-website-comprehensive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://website-to-clone.example.com',
    options: {
      enableJavaScript: true,
      extractStyles: true,
      multiPage: true,
      maxPages: 5,
      generateReport: true,
      analyzeStyles: true
    }
  })
});

// Use the AI summary for code generation
const aiSummary = response.analysis.aiSummary;
const componentStructure = aiSummary.componentStructure;
const styleRecommendations = aiSummary.styleRecommendations;
```

## Testing

Run the advanced crawling test suite:

```bash
npm run test:crawling
```

This will test:
- Basic scraping functionality
- Advanced scraping with JavaScript execution
- Style extraction and analysis
- Multi-page crawling
- Comprehensive website analysis

## Best Practices

### 1. Respectful Crawling
- Use appropriate delays between requests (`waitBetweenRequests`)
- Limit the number of pages crawled (`maxPages`)
- Respect robots.txt and website terms of service
- Use caching when possible (`maxAge`)

### 2. JavaScript Execution
- Wait for dynamic content to load (`waitForSelectors`)
- Use custom actions for complex interactions
- Consider network idle detection for SPAs
- Handle timeouts appropriately

### 3. Style Analysis
- Extract styles for better component generation
- Use Tailwind mappings for consistent styling
- Analyze color schemes and typography patterns
- Consider responsive design patterns

### 4. Multi-Page Crawling
- Start with small page limits and increase gradually
- Use include/exclude patterns to focus on relevant content
- Monitor crawl time and adjust settings accordingly
- Handle errors gracefully

## Troubleshooting

### Common Issues

1. **JavaScript not executing**: Ensure `enableJavaScript: true` and use appropriate wait times
2. **Styles not extracted**: Check that `extractStyles: true` is set
3. **Crawling too many pages**: Reduce `maxPages` and `maxDepth`
4. **Timeout errors**: Increase timeout values and add wait actions
5. **Rate limiting**: Increase `waitBetweenRequests` delay

### Performance Optimization

1. **Use caching**: Set appropriate `maxAge` values
2. **Limit scope**: Use include/exclude patterns
3. **Parallel processing**: Consider running multiple focused crawls
4. **Incremental crawling**: Start with basic scraping, then add advanced features

## Integration with AI Code Generation

The advanced crawling features are designed to work seamlessly with the AI code generation system:

1. **Style Analysis** → Tailwind class recommendations
2. **Component Structure** → React component hierarchy
3. **Content Analysis** → Text and layout structure
4. **Multi-page Data** → Complete website understanding
5. **AI Summary** → Optimized prompts for code generation

This integration enables the AI to generate more accurate and contextually appropriate React components based on the scraped website analysis.
