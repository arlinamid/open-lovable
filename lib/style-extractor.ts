// Style extraction and conversion utilities for advanced crawling

export interface ExtractedStyle {
  selector: string;
  properties: Record<string, string>;
  specificity: number;
  isInline: boolean;
}

export interface TailwindMapping {
  originalSelector: string;
  tailwindClasses: string[];
  customStyles?: Record<string, string>;
}

// CSS property to Tailwind class mappings
const CSS_TO_TAILWIND: Record<string, Record<string, string>> = {
  // Colors
  'background-color': {
    '#ffffff': 'bg-white',
    '#000000': 'bg-black',
    '#f3f4f6': 'bg-gray-100',
    '#e5e7eb': 'bg-gray-200',
    '#d1d5db': 'bg-gray-300',
    '#9ca3af': 'bg-gray-400',
    '#6b7280': 'bg-gray-500',
    '#4b5563': 'bg-gray-600',
    '#374151': 'bg-gray-700',
    '#1f2937': 'bg-gray-800',
    '#111827': 'bg-gray-900',
    '#3b82f6': 'bg-blue-500',
    '#1d4ed8': 'bg-blue-700',
    '#10b981': 'bg-green-500',
    '#059669': 'bg-green-600',
    '#f59e0b': 'bg-yellow-500',
    '#d97706': 'bg-yellow-600',
    '#ef4444': 'bg-red-500',
    '#dc2626': 'bg-red-600',
    '#8b5cf6': 'bg-purple-500',
    '#7c3aed': 'bg-purple-600',
    '#ec4899': 'bg-pink-500',
    '#db2777': 'bg-pink-600'
  },
  'color': {
    '#ffffff': 'text-white',
    '#000000': 'text-black',
    '#6b7280': 'text-gray-500',
    '#374151': 'text-gray-700',
    '#1f2937': 'text-gray-900',
    '#3b82f6': 'text-blue-500',
    '#1d4ed8': 'text-blue-700',
    '#10b981': 'text-green-500',
    '#059669': 'text-green-600',
    '#f59e0b': 'text-yellow-500',
    '#d97706': 'text-yellow-600',
    '#ef4444': 'text-red-500',
    '#dc2626': 'text-red-600'
  },
  // Typography
  'font-size': {
    '12px': 'text-xs',
    '14px': 'text-sm',
    '16px': 'text-base',
    '18px': 'text-lg',
    '20px': 'text-xl',
    '24px': 'text-2xl',
    '30px': 'text-3xl',
    '36px': 'text-4xl',
    '48px': 'text-5xl',
    '60px': 'text-6xl'
  },
  'font-weight': {
    '300': 'font-light',
    '400': 'font-normal',
    '500': 'font-medium',
    '600': 'font-semibold',
    '700': 'font-bold',
    '800': 'font-extrabold',
    '900': 'font-black'
  },
  'text-align': {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify'
  },
  // Spacing
  'margin': {
    '0': 'm-0',
    '4px': 'm-1',
    '8px': 'm-2',
    '12px': 'm-3',
    '16px': 'm-4',
    '20px': 'm-5',
    '24px': 'm-6',
    '32px': 'm-8',
    '40px': 'm-10',
    '48px': 'm-12',
    '64px': 'm-16'
  },
  'padding': {
    '0': 'p-0',
    '4px': 'p-1',
    '8px': 'p-2',
    '12px': 'p-3',
    '16px': 'p-4',
    '20px': 'p-5',
    '24px': 'p-6',
    '32px': 'p-8',
    '40px': 'p-10',
    '48px': 'p-12',
    '64px': 'p-16'
  },
  // Layout
  'display': {
    'block': 'block',
    'inline': 'inline',
    'inline-block': 'inline-block',
    'flex': 'flex',
    'inline-flex': 'inline-flex',
    'grid': 'grid',
    'inline-grid': 'inline-grid',
    'none': 'hidden'
  },
  'position': {
    'static': 'static',
    'relative': 'relative',
    'absolute': 'absolute',
    'fixed': 'fixed',
    'sticky': 'sticky'
  },
  // Flexbox
  'justify-content': {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    'center': 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly'
  },
  'align-items': {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    'center': 'items-center',
    'baseline': 'items-baseline',
    'stretch': 'items-stretch'
  },
  // Borders
  'border-radius': {
    '0': 'rounded-none',
    '4px': 'rounded',
    '6px': 'rounded-md',
    '8px': 'rounded-lg',
    '12px': 'rounded-xl',
    '16px': 'rounded-2xl',
    '9999px': 'rounded-full'
  },
  'border-width': {
    '0': 'border-0',
    '1px': 'border',
    '2px': 'border-2',
    '4px': 'border-4',
    '8px': 'border-8'
  }
};

// Extract CSS properties from a style string
export function extractCSSProperties(styleString: string): Record<string, string> {
  const properties: Record<string, string> = {};
  const styleRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);?/g;
  let match;
  
  while ((match = styleRegex.exec(styleString)) !== null) {
    const [, property, value] = match;
    properties[property.trim()] = value.trim();
  }
  
  return properties;
}

// Convert CSS properties to Tailwind classes
export function convertToTailwind(properties: Record<string, string>): {
  tailwindClasses: string[];
  customStyles: Record<string, string>;
} {
  const tailwindClasses: string[] = [];
  const customStyles: Record<string, string> = {};
  
  for (const [property, value] of Object.entries(properties)) {
    const mapping = CSS_TO_TAILWIND[property];
    
    if (mapping && mapping[value]) {
      tailwindClasses.push(mapping[value]);
    } else {
      // Keep custom styles that don't have Tailwind equivalents
      customStyles[property] = value;
    }
  }
  
  return { tailwindClasses, customStyles };
}

// Parse CSS rules from a stylesheet
export function parseCSSRules(cssText: string): ExtractedStyle[] {
  const styles: ExtractedStyle[] = [];
  
  // Simple CSS parser for basic rules
  const ruleRegex = /([^{]+)\s*\{\s*([^}]+)\s*\}/g;
  let match;
  
  while ((match = ruleRegex.exec(cssText)) !== null) {
    const [, selector, declarations] = match;
    const properties = extractCSSProperties(declarations);
    
    if (Object.keys(properties).length > 0) {
      styles.push({
        selector: selector.trim(),
        properties,
        specificity: calculateSpecificity(selector.trim()),
        isInline: false
      });
    }
  }
  
  return styles;
}

// Calculate CSS specificity (simplified)
function calculateSpecificity(selector: string): number {
  let specificity = 0;
  
  // ID selectors
  const idMatches = selector.match(/#[a-zA-Z0-9_-]+/g);
  if (idMatches) specificity += idMatches.length * 100;
  
  // Class selectors and attributes
  const classMatches = selector.match(/\.[a-zA-Z0-9_-]+|\[[^\]]+\]/g);
  if (classMatches) specificity += classMatches.length * 10;
  
  // Element selectors
  const elementMatches = selector.match(/[a-zA-Z0-9_-]+/g);
  if (elementMatches) specificity += elementMatches.length;
  
  return specificity;
}

// Extract styles from HTML and convert to Tailwind
export function extractAndConvertStyles(html: string): {
  styles: ExtractedStyle[];
  tailwindMappings: TailwindMapping[];
} {
  const styles: ExtractedStyle[] = [];
  const tailwindMappings: TailwindMapping[] = [];
  
  // Extract <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  
  while ((match = styleRegex.exec(html)) !== null) {
    const cssRules = parseCSSRules(match[1]);
    styles.push(...cssRules);
  }
  
  // Extract inline styles
  const inlineStyleRegex = /<([^>]+)style=["']([^"']+)["']([^>]*)>/gi;
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    const tagName = match[1].split(' ')[0];
    const styleContent = match[2];
    const className = match[3].match(/class=["']([^"']+)["']/)?.[1] || '';
    const id = match[3].match(/id=["']([^"']+)["']/)?.[1] || '';
    
    const selector = id ? `#${id}` : className ? `.${className.split(' ')[0]}` : tagName;
    const properties = extractCSSProperties(styleContent);
    
    if (Object.keys(properties).length > 0) {
      styles.push({
        selector,
        properties,
        specificity: calculateSpecificity(selector),
        isInline: true
      });
    }
  }
  
  // Convert styles to Tailwind mappings
  for (const style of styles) {
    const { tailwindClasses, customStyles } = convertToTailwind(style.properties);
    
    if (tailwindClasses.length > 0 || Object.keys(customStyles).length > 0) {
      tailwindMappings.push({
        originalSelector: style.selector,
        tailwindClasses,
        customStyles: Object.keys(customStyles).length > 0 ? customStyles : undefined
      });
    }
  }
  
  return { styles, tailwindMappings };
}

// Generate React component with Tailwind classes
export function generateTailwindComponent(
  componentName: string,
  tailwindMappings: TailwindMapping[],
  content: string
): string {
  let component = `import React from 'react';\n\n`;
  component += `const ${componentName} = () => {\n`;
  component += `  return (\n`;
  
  // Find the most relevant mapping for the main content
  const mainMapping = tailwindMappings.find(m => 
    m.originalSelector.includes('body') || 
    m.originalSelector.includes('main') || 
    m.originalSelector.includes('container')
  ) || tailwindMappings[0];
  
  const mainClasses = mainMapping?.tailwindClasses.join(' ') || '';
  const mainStyles = mainMapping?.customStyles;
  
  component += `    <div className="${mainClasses}"`;
  
  if (mainStyles && Object.keys(mainStyles).length > 0) {
    const styleString = Object.entries(mainStyles)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');
    component += `\n      style={{ ${styleString} }}`;
  }
  
  component += `>\n`;
  component += `      ${content}\n`;
  component += `    </div>\n`;
  component += `  );\n`;
  component += `};\n\n`;
  component += `export default ${componentName};\n`;
  
  return component;
}

// Extract and analyze styles from a scraped website
export function analyzeWebsiteStyles(html: string, markdown: string): {
  styleAnalysis: {
    totalStyles: number;
    inlineStyles: number;
    externalStylesheets: number;
    colorScheme: string[];
    typography: string[];
    layout: string[];
  };
  tailwindRecommendations: string[];
  componentStructure: string[];
} {
  const { styles, tailwindMappings } = extractAndConvertStyles(html);
  
  // Analyze styles
  const colorScheme: string[] = [];
  const typography: string[] = [];
  const layout: string[] = [];
  
  for (const style of styles) {
    for (const [property, value] of Object.entries(style.properties)) {
      if (property.includes('color') || property.includes('background')) {
        colorScheme.push(value);
      } else if (property.includes('font') || property.includes('text')) {
        typography.push(value);
      } else if (property.includes('display') || property.includes('position') || property.includes('flex')) {
        layout.push(value);
      }
    }
  }
  
  // Generate recommendations
  const tailwindRecommendations: string[] = [];
  
  if (colorScheme.length > 0) {
    tailwindRecommendations.push(`Use color scheme: ${[...new Set(colorScheme)].slice(0, 5).join(', ')}`);
  }
  
  if (typography.length > 0) {
    tailwindRecommendations.push(`Typography: ${[...new Set(typography)].slice(0, 3).join(', ')}`);
  }
  
  if (layout.length > 0) {
    tailwindRecommendations.push(`Layout approach: ${[...new Set(layout)].slice(0, 3).join(', ')}`);
  }
  
  // Suggest component structure based on content
  const componentStructure: string[] = [];
  if (markdown.includes('header') || markdown.includes('nav')) {
    componentStructure.push('Header/Navigation component');
  }
  if (markdown.includes('hero') || markdown.includes('banner')) {
    componentStructure.push('Hero/Banner component');
  }
  if (markdown.includes('section') || markdown.includes('content')) {
    componentStructure.push('Content sections');
  }
  if (markdown.includes('footer')) {
    componentStructure.push('Footer component');
  }
  
  return {
    styleAnalysis: {
      totalStyles: styles.length,
      inlineStyles: styles.filter(s => s.isInline).length,
      externalStylesheets: styles.filter(s => !s.isInline).length,
      colorScheme: [...new Set(colorScheme)],
      typography: [...new Set(typography)],
      layout: [...new Set(layout)]
    },
    tailwindRecommendations,
    componentStructure
  };
}
