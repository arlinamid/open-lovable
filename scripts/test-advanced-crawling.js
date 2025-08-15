#!/usr/bin/env node

/**
 * Advanced Crawling Test Script
 * 
 * This script demonstrates the advanced crawling capabilities including:
 * - JavaScript execution
 * - Style extraction and Tailwind conversion
 * - Multi-page crawling
 * - Comprehensive website analysis
 * 
 * Run with: node scripts/test-advanced-crawling.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!FIRECRAWL_API_KEY) {
  console.error('❌ FIRECRAWL_API_KEY environment variable is not set');
  process.exit(1);
}

console.log('🚀 Advanced Crawling Test Script');
console.log('================================\n');

// Test URLs
const testUrls = [
  'https://nordthemes.com/wild-book-demo/memories-from-the-last-summer/',
  'https://tailwindcss.com/',
  'https://react.dev/'
];

async function testBasicScraping(url) {
  console.log(`📄 Testing Basic Scraping: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-url-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Basic scraping successful`);
      console.log(`   Title: ${data.structured.title}`);
      console.log(`   Content length: ${data.structured.content.length} characters`);
      console.log(`   Cached: ${data.metadata.cached}`);
    } else {
      console.log(`❌ Basic scraping failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Basic scraping error: ${error.message}`);
  }
  
  console.log('');
}

async function testAdvancedScraping(url) {
  console.log(`🔬 Testing Advanced Scraping: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-url-advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        options: {
          enableJavaScript: true,
          extractStyles: true,
          extractScripts: true,
          extractImages: true,
          multiPage: false,
          screenshot: false,
          waitForSelectors: ['.content', 'main', 'article'],
          customActions: [
            { type: 'wait', milliseconds: 2000 }
          ]
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Advanced scraping successful`);
      console.log(`   Title: ${data.structured.title}`);
      console.log(`   Content length: ${data.structured.content.length} characters`);
      
      if (data.advanced.styles) {
        console.log(`   Styles extracted: ${data.advanced.styles.styles.length} style blocks`);
        console.log(`   Inline styles: ${Object.keys(data.advanced.styles.inlineStyles).length} elements`);
      }
      
      if (data.advanced.scripts) {
        console.log(`   External scripts: ${data.advanced.scripts.scripts.length}`);
        console.log(`   Inline scripts: ${data.advanced.scripts.inlineScripts.length}`);
      }
      
      if (data.advanced.links) {
        console.log(`   Links found: ${data.advanced.links.length}`);
      }
      
      if (data.advanced.images) {
        console.log(`   Images found: ${data.advanced.images.length}`);
        console.log(`   Images with alt text: ${data.advanced.images.filter(img => img.alt.trim() !== '').length}`);
        console.log(`   Images with title: ${data.advanced.images.filter(img => img.title.trim() !== '').length}`);
        
        // Show first few images
        const sampleImages = data.advanced.images.slice(0, 3);
        sampleImages.forEach((img, index) => {
          console.log(`     Image ${index + 1}: ${img.src.split('/').pop()} (${img.alt || 'no alt'})`);
        });
      }
    } else {
      console.log(`❌ Advanced scraping failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Advanced scraping error: ${error.message}`);
  }
  
  console.log('');
}

async function testComprehensiveScraping(url) {
  console.log(`🌐 Testing Comprehensive Scraping: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-website-comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        options: {
          // Basic scraping options
          enableJavaScript: true,
          extractStyles: true,
          extractScripts: true,
          extractImages: true,
          screenshot: false,
          
          // Multi-page crawling options
          multiPage: true,
          maxPages: 3,
          maxDepth: 1,
          sameDomain: true,
          includePatterns: ['/blog/', '/post/', '/article/'],
          excludePatterns: ['/admin/', '/login/'],
          waitBetweenRequests: 1000,
          
          // Advanced options
          waitForSelectors: ['.content', 'main', 'article'],
          generateReport: true,
          analyzeStyles: true
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Comprehensive scraping successful`);
      console.log(`   Title: ${data.structured.title}`);
      console.log(`   Content length: ${data.structured.content.length} characters`);
      
      // Style analysis
      if (data.analysis.styleAnalysis) {
        const analysis = data.analysis.styleAnalysis;
        console.log(`   Style Analysis:`);
        console.log(`     Total styles: ${analysis.styleAnalysis.totalStyles}`);
        console.log(`     Inline styles: ${analysis.styleAnalysis.inlineStyles}`);
        console.log(`     Color scheme: ${analysis.styleAnalysis.colorScheme.slice(0, 3).join(', ')}`);
        console.log(`     Typography: ${analysis.styleAnalysis.typography.slice(0, 3).join(', ')}`);
      }
      
      // AI summary
      if (data.analysis.aiSummary) {
        const summary = data.analysis.aiSummary;
        console.log(`   AI Summary:`);
        console.log(`     Style recommendations: ${summary.styleRecommendations.length}`);
        console.log(`     Component structure: ${summary.componentStructure.join(', ')}`);
        console.log(`     Has JavaScript: ${summary.hasJavaScript}`);
        console.log(`     Has styles: ${summary.hasStyles}`);
        console.log(`     Has images: ${summary.hasImages}`);
      }
      
      // Image analysis
      if (data.advanced.images) {
        const imageAnalysis = data.advanced.images;
        console.log(`   Image Analysis:`);
        console.log(`     Total images: ${imageAnalysis.totalImages}`);
        console.log(`     Images with alt text: ${imageAnalysis.imagesWithAlt}`);
        console.log(`     Images with title: ${imageAnalysis.imagesWithTitle}`);
        console.log(`     Image types: ${imageAnalysis.imageTypes.join(', ')}`);
        
        // Show first few images
        const sampleImages = imageAnalysis.images.slice(0, 3);
        sampleImages.forEach((img, index) => {
          console.log(`     Image ${index + 1}: ${img.src.split('/').pop()} (${img.alt || 'no alt'})`);
        });
      }
      
      // Multi-page results
      if (data.advanced.crawl) {
        const crawl = data.advanced.crawl;
        console.log(`   Multi-page Crawl:`);
        console.log(`     Pages crawled: ${crawl.totalPages}`);
        console.log(`     Total links: ${crawl.totalLinks}`);
        console.log(`     Crawl time: ${crawl.crawlTime}ms`);
        console.log(`     Errors: ${crawl.errors.length}`);
      }
      
      // Tailwind mappings
      if (data.analysis.tailwindMappings) {
        console.log(`   Tailwind Mappings: ${data.analysis.tailwindMappings.length} conversions`);
      }
      
    } else {
      console.log(`❌ Comprehensive scraping failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Comprehensive scraping error: ${error.message}`);
  }
  
  console.log('');
}

async function testStyleExtraction(url) {
  console.log(`🎨 Testing Style Extraction: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-url-advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        options: {
          enableJavaScript: true,
          extractStyles: true,
          extractScripts: false,
          multiPage: false
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.advanced.styles) {
      console.log(`✅ Style extraction successful`);
      
      const styles = data.advanced.styles;
      console.log(`   Style blocks: ${styles.styles.length}`);
      console.log(`   Inline styles: ${Object.keys(styles.inlineStyles).length}`);
      
      // Show some example styles
      if (styles.styles.length > 0) {
        console.log(`   Example style block:`);
        console.log(`     ${styles.styles[0].substring(0, 100)}...`);
      }
      
      if (Object.keys(styles.inlineStyles).length > 0) {
        const firstInline = Object.entries(styles.inlineStyles)[0];
        console.log(`   Example inline style:`);
        console.log(`     ${firstInline[0]}: ${firstInline[1]}`);
      }
    } else {
      console.log(`❌ Style extraction failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Style extraction error: ${error.message}`);
  }
  
  console.log('');
}

async function testMultiPageCrawling(url) {
  console.log(`🕷️ Testing Multi-page Crawling: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-website-comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        options: {
          enableJavaScript: true,
          extractStyles: false,
          extractScripts: false,
          multiPage: true,
          maxPages: 2,
          maxDepth: 1,
          sameDomain: true,
          generateReport: true,
          analyzeStyles: false
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.advanced.crawl) {
      console.log(`✅ Multi-page crawling successful`);
      
      const crawl = data.advanced.crawl;
      console.log(`   Pages crawled: ${crawl.totalPages}`);
      console.log(`   Total links found: ${crawl.totalLinks}`);
      console.log(`   Crawl time: ${crawl.crawlTime}ms`);
      
      // Show crawled pages
      crawl.pages.forEach((page, index) => {
        console.log(`   Page ${index + 1}: ${page.title || 'Untitled'}`);
        console.log(`     URL: ${page.url}`);
        console.log(`     Links: ${page.links.length}`);
        console.log(`     Content length: ${page.content.length} characters`);
      });
      
      if (data.analysis.crawlReport) {
        console.log(`   Crawl report generated (${data.analysis.crawlReport.length} characters)`);
      }
      
    } else {
      console.log(`❌ Multi-page crawling failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Multi-page crawling error: ${error.message}`);
  }
  
  console.log('');
}

async function runTests() {
  console.log('Starting advanced crawling tests...\n');
  
  for (const url of testUrls) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing URL: ${url}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Test basic scraping
    await testBasicScraping(url);
    
    // Test advanced scraping
    await testAdvancedScraping(url);
    
    // Test style extraction
    await testStyleExtraction(url);
    
    // Test multi-page crawling (only for the first URL to avoid too many requests)
    if (url === testUrls[0]) {
      await testMultiPageCrawling(url);
    }
    
    // Test comprehensive scraping (only for the first URL)
    if (url === testUrls[0]) {
      await testComprehensiveScraping(url);
    }
    
    // Wait between tests to be respectful
    if (url !== testUrls[testUrls.length - 1]) {
      console.log('⏳ Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📊 Summary:');
  console.log('- Basic scraping: Tests enhanced URL scraping with caching');
  console.log('- Advanced scraping: Tests JavaScript execution and style/script extraction');
  console.log('- Style extraction: Tests CSS parsing and analysis');
  console.log('- Multi-page crawling: Tests website crawling with link discovery');
  console.log('- Comprehensive scraping: Tests full website analysis with AI-friendly summaries');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
