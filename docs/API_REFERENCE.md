### API Reference

## Core Endpoints

### Sandbox Management

#### POST `/api/create-ai-sandbox`
- **Purpose**: Creates a new E2B sandbox for AI development.
- **Request**: `{ sandboxId?: string }`
- **Response**: `{ success, url, sandboxId }`

#### GET `/api/sandbox-status`
- **Purpose**: Checks the status of an E2B sandbox.
- **Response**: `{ success, status, url }`

### Code Generation & Application

#### POST `/api/generate-ai-code-stream`
- **Purpose**: Streams AI-generated React code with conversation context awareness.
- **Request**: `{ prompt: string, isEdit?: boolean, model?: string }`
- **Response**: Server-Sent Events stream with `{ type, content, files?, currentFile?, isComplete }`

#### POST `/api/apply-ai-code-stream`
- **Purpose**: Applies streamed code changes to the sandbox filesystem.
- **Request**: `{ files: FileData[], isEdit?: boolean }`
- **Response**: Server-Sent Events stream with `{ type, message, file?, error? }`

### Package Management

#### POST `/api/install-packages`
- **Purpose**: Installs npm packages in the sandbox environment.
- **Request**: `{ packages: string[] }`
- **Response**: Server-Sent Events stream with `{ type, message, package?, error? }`

### File Management

#### GET `/api/get-sandbox-files`
- **Purpose**: Retrieves the current file manifest from the sandbox.
- **Response**: `{ success, files: FileManifest }`

#### POST `/api/update-sandbox-file`
- **Purpose**: Updates a single file in the sandbox.
- **Request**: `{ path: string, content: string }`
- **Response**: `{ success, message }`

### Conversation State

#### GET/POST `/api/conversation-state`
- **Purpose**: Lightweight conversation/session state management used by the AI flows.
- **GET**: `{ success, state|null }`
- **POST**: `{ action: 'reset'|'clear-old'|'update', data? }` → `{ success, state }`
- **DELETE**: `{ success, message }`

#### POST `/api/analyze-edit-intent`
- **Purpose**: Uses an LLM to produce a structured search plan (not file edits) for targeted code changes.
- **Request**: `{ prompt: string, manifest: FileManifest, model?: string }`
- **Response**: `{ success, searchPlan }` where `searchPlan` = `{ editType, reasoning, searchTerms, regexPatterns?, fileTypesToSearch?, expectedMatches?, fallbackSearch? }`

## Web Scraping Endpoints

### Basic Scraping

#### POST `/api/scrape-url-enhanced`
- **Purpose**: Scrapes a URL via Firecrawl, returns sanitized markdown + metadata (with caching via `maxAge`).
- **Request**: `{ url: string }`
- **Response**: `{ success, url, content, structured, metadata, message }`

#### POST `/api/scrape-screenshot`
- **Purpose**: Captures a regular viewport screenshot via Firecrawl.
- **Request**: `{ url: string }`
- **Response**: `{ success, screenshot, metadata }`

### Advanced Scraping

#### POST `/api/scrape-url-advanced`
- **Purpose**: Advanced scraping with JavaScript execution, style extraction, and custom actions.
- **Request**: `{ 
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
  }`
- **Response**: `{ 
    success, 
    url, 
    content, 
    structured, 
    advanced: {
      styles: { styles: string[], inlineStyles: Record<string, string> },
      scripts: { scripts: string[], inlineScripts: string[] },
      images: Array<{ src: string, alt: string, title: string, width?: string, height?: string }>,
      links: string[],
      additionalPages: Array<{url, title, content, metadata, images?: Array<{ src: string, alt: string, title: string, width?: string, height?: string }>}>,
      screenshot?: string
    },
    metadata 
  }`

#### POST `/api/scrape-website-comprehensive`
- **Purpose**: Comprehensive website analysis with multi-page crawling, style analysis, and AI-friendly summaries.
- **Request**: `{ 
    url: string, 
    options?: {
      // Basic scraping options
      enableJavaScript?: boolean,
      extractStyles?: boolean,
      extractScripts?: boolean,
      extractImages?: boolean,
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
  }`
- **Response**: `{ 
    success, 
    url, 
    content, 
    structured, 
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
        images: {
          images: Array<{ src: string, alt: string, title: string, width?: string, height?: string }>,
          totalImages: number,
          imagesWithAlt: number,
          imagesWithTitle: number,
          imageTypes: string[]
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
        hasStyles: boolean,
        hasImages: boolean
      },
      crawlReport?: string,
      styleAnalysis?: StyleAnalysis,
      tailwindMappings?: TailwindMapping[]
    },
    metadata 
  }`

## Supabase v2 API Endpoints

### Sessions

#### GET `/api/v2/sessions`
- **Purpose**: List all sessions with pagination.
- **Query Parameters**: `{ page?: number, limit?: number }`
- **Response**: `{ success, sessions: Session[], pagination: { page, limit, total } }`

#### POST `/api/v2/sessions`
- **Purpose**: Create a new session.
- **Request**: `{ title?: string, metadata?: any }`
- **Response**: `{ success, session: Session }`

#### GET `/api/v2/sessions/[id]`
- **Purpose**: Get a specific session with optional details.
- **Query Parameters**: `{ include?: 'messages'|'jobs'|'sandboxes'|'all' }`
- **Response**: `{ success, session: Session, details?: any }`

#### PATCH `/api/v2/sessions/[id]`
- **Purpose**: Update a session.
- **Request**: `{ title?: string, status?: string, metadata?: any }`
- **Response**: `{ success, session: Session }`

#### DELETE `/api/v2/sessions/[id]`
- **Purpose**: Archive a session (soft delete).
- **Response**: `{ success, message }`

#### GET `/api/v2/sessions/[id]/checkpoints`
- **Purpose**: List checkpoints for a session.
- **Response**: `{ success, checkpoints: Checkpoint[] }`

#### POST `/api/v2/sessions/[id]/checkpoints`
- **Purpose**: Create a new checkpoint for a session.
- **Request**: `{ label: string, snapshotRef: string, metadata?: any }`
- **Response**: `{ success, checkpoint: Checkpoint }`

### Jobs

#### GET `/api/v2/jobs`
- **Purpose**: List jobs with optional filtering.
- **Query Parameters**: `{ sessionId?: string, type?: string, state?: string }`
- **Response**: `{ success, jobs: Job[] }`

#### POST `/api/v2/jobs`
- **Purpose**: Create a new job.
- **Request**: `{ sessionId: string, type: string, input: any, parentJobId?: string }`
- **Response**: `{ success, job: Job }`

#### GET `/api/v2/jobs/[id]`
- **Purpose**: Get a specific job with optional details.
- **Query Parameters**: `{ include?: 'tasks'|'artifacts'|'toolRuns'|'all' }`
- **Response**: `{ success, job: Job, details?: any }`

#### PATCH `/api/v2/jobs/[id]`
- **Purpose**: Update a job.
- **Request**: `{ state?: string, output?: any, error?: string }`
- **Response**: `{ success, job: Job }`

#### POST `/api/v2/jobs/[id]`
- **Purpose**: Perform job actions (e.g., cancel).
- **Request**: `{ action: 'cancel' }`
- **Response**: `{ success, job: Job }`

### Migration

#### POST `/api/v2/migrate`
- **Purpose**: Migrate existing conversation state to database.
- **Request**: `{ force?: boolean }`
- **Response**: `{ success, migrated: { sessions: number, messages: number } }`

### Conversation State v2

#### GET/POST `/api/conversation-state-v2`
- **Purpose**: Database-backed conversation state with backward compatibility.
- **GET**: `{ success, state: ConversationState }`
- **POST**: `{ action: 'reset'|'clear-old'|'update', data?: any }` → `{ success, state: ConversationState }`
- **DELETE**: `{ success, message }`

## Streaming Protocol

Endpoints `/api/generate-ai-code-stream`, `/api/apply-ai-code-stream`, `/api/install-packages` use Server-Sent Events. Responses use `Content-Type: text/event-stream` and emit lines prefixed with `data: {json}\n\n`.

## Error Handling

- Errors are returned as `{ success: false, error }` with appropriate HTTP status.
- Package install streams forward npm stderr lines as `type: 'error' or `type: 'warning'`.

## Common Flows

- **Initialize sandbox**: `POST /api/create-ai-sandbox` → open `url` → check `GET /api/sandbox-status`.
- **Generate code**: Stream `POST /api/generate-ai-code-stream` with `isEdit=false` → parse output → apply via `/api/apply-ai-code-stream`.
- **Targeted edits**: Ensure manifest via `GET /api/get-sandbox-files` → `POST /api/analyze-edit-intent` → `POST /api/generate-ai-code-stream` with `isEdit=true`.
- **Advanced scraping**: `POST /api/scrape-website-comprehensive` with multi-page and style analysis options.
- **Dependencies**: Provide `<package>`/`<packages>` tags or rely on auto-detection; installer streams via `/api/install-packages`.

## Advanced Scraping Features

### JavaScript Execution
- Enable JavaScript rendering for dynamic content
- Wait for specific selectors to load
- Execute custom actions (clicks, scrolls, form fills)
- Network idle detection

### Style Analysis
- Extract CSS styles from `<style>` tags and external stylesheets
- Convert CSS properties to Tailwind classes
- Analyze color schemes, typography, and layout patterns
- Generate style recommendations for React components

### Multi-Page Crawling
- Crawl multiple pages from the same domain
- Configurable depth and page limits
- Pattern-based filtering (include/exclude)
- Generate comprehensive crawl reports
- Create XML sitemaps

### AI-Friendly Analysis
- Generate component structure recommendations
- Provide Tailwind class mappings
- Analyze website patterns and common elements
- Create detailed reports for code generation

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



