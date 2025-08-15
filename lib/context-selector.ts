import { FileManifest, EditIntent, EditType } from '@/types/file-manifest';
import { analyzeEditIntent } from '@/lib/edit-intent-analyzer';
import { getEditExamplesPrompt, getComponentPatternPrompt } from '@/lib/edit-examples';

export interface FileContext {
  primaryFiles: string[]; // Files to edit
  contextFiles: string[]; // Files to include for reference
  systemPrompt: string;   // Enhanced prompt with file info
  editIntent: EditIntent;
}

/**
 * Select files and build context based on user prompt
 */
export function selectFilesForEdit(
  userPrompt: string,
  manifest: FileManifest
): FileContext {
  // Analyze the edit intent
  const editIntent = analyzeEditIntent(userPrompt, manifest);
  
  // Get the files based on intent - only edit target files, but provide all others as context
  const primaryFiles = editIntent.targetFiles;
  const allFiles = Object.keys(manifest.files);
  let contextFiles = allFiles.filter(file => !primaryFiles.includes(file));
  
  // ALWAYS include key files in context if they exist and aren't already primary files
  const keyFiles: string[] = [];
  
  // App.jsx is most important - shows component structure
  const appFile = allFiles.find(f => f.endsWith('App.jsx') || f.endsWith('App.tsx'));
  if (appFile && !primaryFiles.includes(appFile)) {
    keyFiles.push(appFile);
  }
  
  // Include design system files for style context
  const tailwindConfig = allFiles.find(f => f.endsWith('tailwind.config.js') || f.endsWith('tailwind.config.ts'));
  if (tailwindConfig && !primaryFiles.includes(tailwindConfig)) {
    keyFiles.push(tailwindConfig);
  }
  
  const indexCss = allFiles.find(f => f.endsWith('index.css') || f.endsWith('globals.css'));
  if (indexCss && !primaryFiles.includes(indexCss)) {
    keyFiles.push(indexCss);
  }
  
  // Include package.json to understand dependencies
  const packageJson = allFiles.find(f => f.endsWith('package.json'));
  if (packageJson && !primaryFiles.includes(packageJson)) {
    keyFiles.push(packageJson);
  }
  
  // Put key files at the beginning of context for visibility
  contextFiles = [...keyFiles, ...contextFiles.filter(f => !keyFiles.includes(f))];
  
  // Build enhanced system prompt
  const systemPrompt = buildSystemPrompt(
    userPrompt,
    editIntent,
    primaryFiles,
    contextFiles,
    manifest
  );
  
  return {
    primaryFiles,
    contextFiles,
    systemPrompt,
    editIntent,
  };
}

/**
 * Build an enhanced system prompt with file structure context
 */
function buildSystemPrompt(
  userPrompt: string,
  editIntent: EditIntent,
  primaryFiles: string[],
  contextFiles: string[],
  manifest: FileManifest
): string {
  const sections: string[] = [];
  
  // Add edit examples first for better understanding
  if (editIntent.type !== EditType.FULL_REBUILD) {
    sections.push(getEditExamplesPrompt());
  }
  
  // Add enhanced styling and layout guidance
  sections.push(getEnhancedStylingPrompt());
  
  // Add edit intent section
  sections.push(`## Edit Intent
Type: ${editIntent.type}
Description: ${editIntent.description}
Confidence: ${(editIntent.confidence * 100).toFixed(0)}%

User Request: "${userPrompt}"`);
  
  // Add file structure overview
  sections.push(buildFileStructureSection(manifest));
  
  // Add component patterns
  const fileList = Object.keys(manifest.files).map(f => f.replace('/home/user/app/', '')).join('\n');
  sections.push(getComponentPatternPrompt(fileList));
  
  // Add primary files section
  if (primaryFiles.length > 0) {
    sections.push(`## Files to Edit
${primaryFiles.map(f => {
  const fileInfo = manifest.files[f];
  return `- ${f}${fileInfo?.componentInfo ? ` (${fileInfo.componentInfo.name} component)` : ''}`;
}).join('\n')}`);
  }
  
  // Add context files section
  if (contextFiles.length > 0) {
    sections.push(`## Context Files (for reference only)
${contextFiles.map(f => {
  const fileInfo = manifest.files[f];
  return `- ${f}${fileInfo?.componentInfo ? ` (${fileInfo.componentInfo.name} component)` : ''}`;
}).join('\n')}`);
  }
  
  // Add specific instructions based on edit type
  sections.push(buildEditInstructions(editIntent.type));
  
  // Add component relationships if relevant
  if (editIntent.type === EditType.UPDATE_COMPONENT || 
      editIntent.type === EditType.ADD_FEATURE) {
    sections.push(buildComponentRelationships(primaryFiles, manifest));
  }
  
  return sections.join('\n\n');
}

/**
 * Build file structure overview section
 */
function buildFileStructureSection(manifest: FileManifest): string {
  const allFiles = Object.entries(manifest.files)
    .map(([path]) => path.replace('/home/user/app/', ''))
    .filter(path => !path.includes('node_modules'))
    .sort();
  
  const componentFiles = Object.entries(manifest.files)
    .filter(([, info]) => info.type === 'component' || info.type === 'page')
    .map(([path, info]) => ({
      path: path.replace('/home/user/app/', ''),
      name: info.componentInfo?.name || path.split('/').pop(),
      type: info.type,
    }));
  
  return `## 🚨 EXISTING PROJECT FILES - DO NOT CREATE NEW FILES WITH SIMILAR NAMES 🚨

### ALL PROJECT FILES (${allFiles.length} files)
\`\`\`
${allFiles.join('\n')}
\`\`\`

### Component Files (USE THESE EXACT NAMES)
${componentFiles.map(f => 
  `- ${f.name} → ${f.path} (${f.type})`
).join('\n')}

### CRITICAL: Component Relationships
**ALWAYS CHECK App.jsx FIRST** to understand what components exist and how they're imported!

Common component overlaps to watch for:
- "nav" or "navigation" → Often INSIDE Header.jsx, not a separate file
- "menu" → Usually part of Header/Nav, not separate
- "logo" → Typically in Header, not standalone

When user says "nav" or "navigation":
1. First check if Header.jsx exists
2. Look inside Header.jsx for navigation elements
3. Only create Nav.jsx if navigation doesn't exist anywhere

Entry Point: ${manifest.entryPoint}

### Routes
${manifest.routes.map(r => 
  `- ${r.path} → ${r.component.split('/').pop()}`
).join('\n') || 'No routes detected'}`;
}

/**
 * Build edit-type specific instructions
 */
function buildEditInstructions(editType: EditType): string {
  const instructions: Record<EditType, string> = {
    [EditType.UPDATE_COMPONENT]: `## SURGICAL EDIT INSTRUCTIONS
- You MUST preserve 99% of the original code
- ONLY edit the specific component(s) mentioned
- Make ONLY the minimal change requested
- DO NOT rewrite or refactor unless explicitly asked
- DO NOT remove any existing code unless explicitly asked
- DO NOT change formatting or structure
- Preserve all imports and exports
- Maintain the existing code style
- Return the COMPLETE file with the surgical change applied
- Think of yourself as a surgeon making a precise incision, not an artist repainting`,
    
    [EditType.ADD_FEATURE]: `## Instructions
- Create new components in appropriate directories
- IMPORTANT: Update parent components to import and use the new component
- Update routing if adding new pages
- Follow existing patterns and conventions
- Add necessary styles to match existing design
- Example workflow:
  1. Create NewComponent.jsx
  2. Import it in the parent: import NewComponent from './NewComponent'
  3. Use it in the parent's render: <NewComponent />`,
    
    [EditType.FIX_ISSUE]: `## Instructions
- Identify and fix the specific issue
- Test the fix doesn't break other functionality
- Preserve existing behavior except for the bug
- Add error handling if needed`,
    
    [EditType.UPDATE_STYLE]: `## SURGICAL STYLE EDIT INSTRUCTIONS
- Change ONLY the specific style/class mentioned
- If user says "change background to blue", change ONLY the background class
- DO NOT touch any other styles, classes, or attributes
- DO NOT refactor or "improve" the styling
- DO NOT change the component structure
- Preserve ALL other classes and styles exactly as they are
- Return the COMPLETE file with only the specific style change`,
    
    [EditType.REFACTOR]: `## Instructions
- Improve code quality without changing functionality
- Follow project conventions
- Maintain all existing features
- Improve readability and maintainability`,
    
    [EditType.FULL_REBUILD]: `## Instructions
- You may rebuild the entire application
- Keep the same core functionality
- Improve upon the existing design
- Use modern best practices`,
    
    [EditType.ADD_DEPENDENCY]: `## Instructions
- Update package.json with new dependency
- Add necessary import statements
- Configure the dependency if needed
- Update any build configuration`,
  };
  
  return instructions[editType] || instructions[EditType.UPDATE_COMPONENT];
}

/**
 * Build component relationship information
 */
function buildComponentRelationships(
  files: string[],
  manifest: FileManifest
): string {
  const relationships: string[] = ['## Component Relationships'];
  
  for (const file of files) {
    const fileInfo = manifest.files[file];
    if (!fileInfo?.componentInfo) continue;
    
    const componentName = fileInfo.componentInfo.name;
    const treeNode = manifest.componentTree[componentName];
    
    if (treeNode) {
      relationships.push(`\n### ${componentName}`);
      
      if (treeNode.imports.length > 0) {
        relationships.push(`Imports: ${treeNode.imports.join(', ')}`);
      }
      
      if (treeNode.importedBy.length > 0) {
        relationships.push(`Used by: ${treeNode.importedBy.join(', ')}`);
      }
      
      if (fileInfo.componentInfo.childComponents?.length) {
        relationships.push(`Renders: ${fileInfo.componentInfo.childComponents.join(', ')}`);
      }
    }
  }
  
  return relationships.join('\n');
}

/**
 * Get file content for selected files
 */
export async function getFileContents(
  files: string[],
  manifest: FileManifest
): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};
  
  for (const file of files) {
    const fileInfo = manifest.files[file];
    if (fileInfo) {
      contents[file] = fileInfo.content;
    }
  }
  
  return contents;
}

/**
 * Format files for AI context
 */
export function formatFilesForAI(
  primaryFiles: Record<string, string>,
  contextFiles: Record<string, string>
): string {
  const sections: string[] = [];
  
  // Add primary files
  sections.push('## Files to Edit (ONLY OUTPUT THESE FILES)\n');
  sections.push('🚨 You MUST ONLY generate the files listed below. Do NOT generate any other files! 🚨\n');
  sections.push('⚠️ CRITICAL: Return the COMPLETE file - NEVER truncate with "..." or skip any lines! ⚠️\n');
  sections.push('The file MUST include ALL imports, ALL functions, ALL JSX, and ALL closing tags.\n\n');
  for (const [path, content] of Object.entries(primaryFiles)) {
    sections.push(`### ${path}
**IMPORTANT: This is the COMPLETE file. Your output must include EVERY line shown below, modified only where necessary.**
\`\`\`${getFileExtension(path)}
${content}
\`\`\`
`);
  }
  
  // Add context files if any - but truncate large files
  if (Object.keys(contextFiles).length > 0) {
    sections.push('\n## Context Files (Reference Only - Do Not Edit)\n');
    for (const [path, content] of Object.entries(contextFiles)) {
      // Truncate very large context files to save tokens
      let truncatedContent = content;
      if (content.length > 2000) {
        truncatedContent = content.substring(0, 2000) + '\n// ... [truncated for context length]';
      }
      
      sections.push(`### ${path}
\`\`\`${getFileExtension(path)}
${truncatedContent}
\`\`\`
`);
    }
  }
  
  return sections.join('\n');
}

/**
 * Get file extension for syntax highlighting
 */
function getFileExtension(path: string): string {
  const ext = path.split('.').pop() || '';
  const mapping: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'json': 'json',
  };
  return mapping[ext] || ext;
}

/**
 * Enhanced styling and layout guidance for AI
 */
export function getEnhancedStylingPrompt(): string {
  return `
## 🎨 ENHANCED STYLING & LAYOUT GUIDELINES

### Image Handling & Placement
- **Responsive Images**: Use \`w-full h-auto\` or specific responsive classes like \`w-full md:w-1/2 lg:w-1/3\`
- **Image Dimensions**: Always specify appropriate dimensions: \`w-[800px] h-[600px]\` or \`w-full max-w-md\`
- **Image Optimization**: Use \`object-cover\`, \`object-contain\`, or \`object-fill\` for proper scaling
- **Lazy Loading**: Add \`loading="lazy"\` for better performance
- **Alt Text**: Always include descriptive alt text for accessibility
- **Image Containers**: Wrap images in \`relative\` containers for overlays or positioning

### Advanced Layout Techniques
- **Grid Systems**: Use \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\` for responsive grids
- **Flexbox Layouts**: Use \`flex flex-col md:flex-row items-center justify-between\` for flexible layouts
- **Aspect Ratios**: Use \`aspect-video\`, \`aspect-square\`, or custom \`aspect-[16/9]\`
- **Container Queries**: Use \`@container\` for component-based responsive design
- **Sticky Positioning**: Use \`sticky top-0\` for navigation or important elements

### Color & Typography
- **Color Palettes**: Use semantic color classes: \`text-primary\`, \`bg-secondary\`, \`border-accent\`
- **Gradients**: Use \`bg-gradient-to-r from-blue-500 to-purple-600\` for modern gradients
- **Typography Scale**: Use \`text-xs\` to \`text-9xl\` with proper hierarchy
- **Font Weights**: Use \`font-light\`, \`font-normal\`, \`font-medium\`, \`font-bold\`, \`font-black\`
- **Line Heights**: Use \`leading-tight\`, \`leading-normal\`, \`leading-relaxed\` for readability

### Spacing & Sizing
- **Consistent Spacing**: Use Tailwind's spacing scale: \`p-4\`, \`m-6\`, \`gap-8\`
- **Responsive Spacing**: Use \`p-4 md:p-6 lg:p-8\` for adaptive spacing
- **Container Sizing**: Use \`max-w-7xl mx-auto\` for centered content
- **Viewport Units**: Use \`min-h-screen\`, \`w-screen\` for full viewport sizing

### Interactive Elements
- **Hover States**: Use \`hover:bg-blue-600 hover:scale-105 transition-all\`
- **Focus States**: Use \`focus:ring-2 focus:ring-blue-500 focus:outline-none\`
- **Active States**: Use \`active:scale-95\` for button interactions
- **Transitions**: Use \`transition-all duration-300 ease-in-out\` for smooth animations

### Component Structure Best Practices
- **Semantic HTML**: Use proper tags: \`<header>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<footer>\`
- **Accessibility**: Include \`aria-label\`, \`role\`, and proper heading hierarchy
- **SEO Optimization**: Use \`<meta>\` tags and structured data where appropriate
- **Performance**: Use \`loading="lazy"\` and optimize images with proper formats

### Responsive Design Patterns
- **Mobile-First**: Start with mobile styles, then add \`md:\`, \`lg:\`, \`xl:\` breakpoints
- **Breakpoint Strategy**: Use \`sm: 640px\`, \`md: 768px\`, \`lg: 1024px\`, \`xl: 1280px\`, \`2xl: 1536px\`
- **Flexible Images**: Use \`w-full h-auto\` with \`max-w-md\` containers
- **Adaptive Typography**: Use \`text-lg md:text-xl lg:text-2xl\` for responsive text

### Animation & Micro-interactions
- **Framer Motion**: Use \`motion.div\` with \`initial\`, \`animate\`, \`exit\` props
- **CSS Transitions**: Use \`transition-all duration-300\` for smooth state changes
- **Hover Effects**: Use \`hover:translate-y-[-2px] hover:shadow-lg\` for subtle interactions
- **Loading States**: Use \`animate-pulse\` or \`animate-spin\` for loading indicators

### Dark Mode Support
- **Theme Classes**: Use \`dark:bg-gray-900 dark:text-white\` for dark mode
- **Color Variables**: Use CSS custom properties for theme-aware colors
- **System Preference**: Respect user's system preference with \`prefers-color-scheme\`

### Performance Optimization
- **Image Optimization**: Use \`next/image\` or \`loading="lazy"\` for better performance
- **CSS Purge**: Ensure unused styles are removed in production
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Font Loading**: Use \`font-display: swap\` for better font loading performance
`;
}