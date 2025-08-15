#!/usr/bin/env node

/**
 * Image Extraction Test Script
 * 
 * This script tests the image extraction functionality without requiring
 * the Firecrawl API key.
 * 
 * Run with: node scripts/test-image-extraction.js
 */

// Function to extract images from HTML (copied from the API)
function extractImages(html, baseUrl) {
  const images = [];
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

console.log('🖼️ Image Extraction Test Script');
console.log('================================\n');

// Test HTML with various image scenarios
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <h1>Test Images</h1>
  
  <!-- Basic image -->
  <img src="/images/logo.png" alt="Company Logo" title="Our Company Logo">
  
  <!-- Image with dimensions -->
  <img src="https://example.com/hero.jpg" alt="Hero Image" width="800" height="600">
  
  <!-- Image with relative path -->
  <img src="./assets/photo.jpg" alt="Team Photo">
  
  <!-- Image without alt text -->
  <img src="/decorative.jpg" title="Decorative Element">
  
  <!-- Image with data URL (should be skipped) -->
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Data URL Image">
  
  <!-- Image with blob URL (should be skipped) -->
  <img src="blob:https://example.com/12345678-1234-1234-1234-123456789012" alt="Blob Image">
  
  <!-- Image with absolute URL -->
  <img src="https://cdn.example.com/banner.webp" alt="Banner" width="1200" height="400">
  
  <!-- Image with complex attributes -->
  <img src="/products/phone.jpg" 
       alt="Smartphone Product Image" 
       title="Latest Smartphone Model" 
       width="500" 
       height="300" 
       class="product-image" 
       id="main-product">
</body>
</html>
`;

const baseUrl = 'https://example.com';

console.log('📄 Testing Image Extraction...\n');

const extractedImages = extractImages(testHtml, baseUrl);

console.log(`✅ Extracted ${extractedImages.length} images:\n`);

extractedImages.forEach((img, index) => {
  console.log(`Image ${index + 1}:`);
  console.log(`  Source: ${img.src}`);
  console.log(`  Alt: "${img.alt}"`);
  console.log(`  Title: "${img.title}"`);
  console.log(`  Dimensions: ${img.width || 'auto'} x ${img.height || 'auto'}`);
  console.log('');
});

// Test analysis
const totalImages = extractedImages.length;
const imagesWithAlt = extractedImages.filter(img => img.alt.trim() !== '').length;
const imagesWithTitle = extractedImages.filter(img => img.title.trim() !== '').length;
const imageTypes = [...new Set(extractedImages.map(img => {
  const extension = img.src.split('.').pop()?.toLowerCase();
  return extension || 'unknown';
}))];

console.log('📊 Image Analysis:');
console.log(`  Total images: ${totalImages}`);
console.log(`  Images with alt text: ${imagesWithAlt}`);
console.log(`  Images with title: ${imagesWithTitle}`);
console.log(`  Image types: ${imageTypes.join(', ')}`);
console.log('');

// Test URL resolution
console.log('🔗 URL Resolution Test:');
const relativeUrl = './assets/photo.jpg';
const absoluteUrl = new URL(relativeUrl, baseUrl).href;
console.log(`  Relative: ${relativeUrl}`);
console.log(`  Absolute: ${absoluteUrl}`);
console.log('');

console.log('✅ Image extraction test completed successfully!');
