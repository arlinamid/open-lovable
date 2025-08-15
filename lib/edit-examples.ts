/**
 * Example-based prompts for teaching AI proper edit behavior
 */

export const EDIT_EXAMPLES = `
## Edit Strategy Examples

### Example 1: Update Header Color
USER: "Make the header background black"

CORRECT APPROACH:
1. Identify Header component location
2. Edit ONLY Header.jsx
3. Change background color class/style

INCORRECT APPROACH:
- Regenerating entire App.jsx
- Creating new Header.jsx from scratch
- Modifying unrelated files

EXPECTED OUTPUT:
<file path="src/components/Header.jsx">
// Only the Header component with updated background
// Preserving all existing functionality
</file>

### Example 2: Add New Page
USER: "Add a videos page"

CORRECT APPROACH:
1. Create Videos.jsx component
2. Update routing in App.jsx or Router component
3. Add navigation link if needed

INCORRECT APPROACH:
- Regenerating entire application
- Recreating all existing pages

EXPECTED OUTPUT:
<file path="src/components/Videos.jsx">
// New Videos component
</file>

<file path="src/App.jsx">
// ONLY the routing update, preserving everything else
</file>

### Example 3: Fix Styling Issue
USER: "Fix the button styling on mobile"

CORRECT APPROACH:
1. Identify which component has the button
2. Update only that component's Tailwind classes
3. Add responsive modifiers (sm:, md:, etc)

INCORRECT APPROACH:
- Regenerating all components
- Creating new CSS files
- Modifying global styles unnecessarily

### Example 4: Add Feature to Component
USER: "Add a search bar to the header"

CORRECT APPROACH:
1. Modify Header.jsx to add search functionality
2. Preserve all existing header content
3. Integrate search seamlessly

INCORRECT APPROACH:
- Creating Header.jsx from scratch
- Losing existing navigation/branding

### Example 5: Add New Component
USER: "Add a newsletter signup to the footer"

CORRECT APPROACH:
1. Create Newsletter.jsx component
2. UPDATE Footer.jsx to import Newsletter
3. Add <Newsletter /> in the appropriate place in Footer

EXPECTED OUTPUT:
<file path="src/components/Newsletter.jsx">
// New Newsletter component
</file>

<file path="src/components/Footer.jsx">
// Updated Footer with Newsletter import and usage
import Newsletter from './Newsletter';
// ... existing code ...
// Add <Newsletter /> in the render
</file>

### Example 6: Add External Library
USER: "Add animations with framer-motion to the hero"

CORRECT APPROACH:
1. Import framer-motion in Hero.jsx
2. Use motion components
3. System will auto-install framer-motion

EXPECTED OUTPUT:
<file path="src/components/Hero.jsx">
import { motion } from 'framer-motion';
// ... rest of Hero with motion animations
</file>

### Example 7: Remove Element
USER: "Remove start deploying button"

CORRECT APPROACH:
1. Search for "start deploying" in all component files
2. Find it in Hero.jsx
3. Edit ONLY Hero.jsx to remove that button

INCORRECT APPROACH:
- Creating a new file
- Editing multiple files
- Redesigning the entire Hero

EXPECTED OUTPUT:
<file path="src/components/Hero.jsx">
// Hero component with "start deploying" button removed
// All other content preserved
</file>

### Example 8: Delete Section
USER: "Delete the testimonials section"

CORRECT APPROACH:
1. Find which file contains testimonials
2. Remove only that section from the file
3. Keep all other content intact

INCORRECT APPROACH:
- Deleting the entire file
- Recreating the page without testimonials

### Example 9: Change a Single Style (CRITICAL EXAMPLE)
USER: "update the hero to bg blue"

CORRECT APPROACH:
1. Identify the Hero component file: 'src/components/Hero.jsx'.
2. Locate the outermost 'div' or container element.
3. Find the existing background color class (e.g., 'bg-gray-900').
4. Replace ONLY that class with 'bg-blue-500'.
5. Return the entire file, completely unchanged except for that single class modification.

**Original File Content (BEFORE):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-gray-900 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

**Expected Output (AFTER):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-blue-500 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

NOTICE: Everything remains EXACTLY the same except 'bg-gray-900' → 'bg-blue-500'. 
- The button still has bg-blue-600 (unchanged)
- All text, structure, imports are identical
- No reformatting, no "improvements", no cleanup

### Example 10: Add Responsive Image with Proper Styling
USER: "add a hero image to the header"

CORRECT APPROACH:
1. Find the Header component
2. Add an optimized image with proper responsive classes
3. Include alt text and loading optimization
4. Use appropriate sizing and positioning

**Expected Output:**
<file path="src/components/Header.jsx">
import React from 'react';

export default function Header() {
  return (
    <header className="relative w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/images/logo.png" 
              alt="Company Logo" 
              className="w-12 h-12 object-contain"
              loading="eager"
            />
            <h1 className="text-2xl font-bold text-gray-900">Company Name</h1>
          </div>
          
          {/* Hero Image */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64">
            <img 
              src="/images/hero-image.jpg" 
              alt="Hero illustration showing our product in action" 
              className="w-full h-full object-cover rounded-lg shadow-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
</file>

### Example 11: Create Responsive Grid Layout
USER: "create a product grid with images"

CORRECT APPROACH:
1. Use CSS Grid for responsive layout
2. Include proper image optimization
3. Add hover effects and transitions
4. Ensure accessibility with alt text

**Expected Output:**
<file path="src/components/ProductGrid.jsx">
import React from 'react';

export default function ProductGrid({ products }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <article 
            key={product.id} 
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative aspect-square">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">{product.price}</span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
</file>

### Example 12: Add Animated Hero Section
USER: "add an animated hero with background image"

CORRECT APPROACH:
1. Use Framer Motion for animations
2. Include background image with proper overlay
3. Add responsive text sizing
4. Include proper image optimization

**Expected Output:**
<file path="src/components/AnimatedHero.jsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Hero background showing modern workspace"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          Build Something
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Amazing
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto"
        >
          Create stunning websites with modern design patterns and cutting-edge technology.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
            Get Started
          </button>
          <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg font-semibold transition-all duration-300">
            Learn More
          </button>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          ></motion.div>
        </div>
      </motion.div>
    </section>
  );
}
</file>

## Key Principles

1. **Minimal Changes**: Only modify what's necessary
2. **Preserve Functionality**: Keep all existing features
3. **Respect Structure**: Follow existing patterns
4. **Target Precision**: Edit specific files, not everything
5. **Context Awareness**: Use imports/exports to understand relationships

## File Identification Patterns

- "header" → src/components/Header.jsx
- "navigation" → src/components/Nav.jsx or Header.jsx
- "footer" → src/components/Footer.jsx
- "home page" → src/App.jsx or src/pages/Home.jsx
- "styling" → Component files (Tailwind) or index.css
- "routing" → App.jsx or Router component
- "layout" → Layout components or App.jsx

## Edit Intent Classification

UPDATE_COMPONENT: Modify existing component
- Keywords: update, change, modify, edit, fix
- Action: Edit single file

ADD_FEATURE: Add new functionality
- Keywords: add, create, implement, build
- Action: Create new files + minimal edits

FIX_ISSUE: Resolve problems
- Keywords: fix, resolve, debug, repair
- Action: Targeted fixes

UPDATE_STYLE: Change appearance
- Keywords: style, color, theme, design
- Action: Update Tailwind classes

REFACTOR: Improve code quality
- Keywords: refactor, clean, optimize
- Action: Restructure without changing behavior
`;

export function getEditExamplesPrompt(): string {
  return EDIT_EXAMPLES;
}

export function getComponentPatternPrompt(fileStructure: string): string {
  return `
## Current Project Structure

${fileStructure}

## Component Naming Patterns
Based on your file structure, here are the patterns to follow:

1. Component files are in: src/components/
2. Page components might be in: src/pages/ or src/components/
3. Utility functions are in: src/utils/ or src/lib/
4. Styles use Tailwind classes inline
5. Main app entry is: src/App.jsx

When the user mentions a component by name, look for:
- Exact matches first (Header → Header.jsx)
- Partial matches (nav → Navigation.jsx, NavBar.jsx)
- Semantic matches (top bar → Header.jsx)
`;
}