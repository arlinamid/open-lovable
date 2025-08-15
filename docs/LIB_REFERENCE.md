### Lib Reference

Reference for utilities under `lib/*` used by API routes and UI flows.

#### `lib/utils.ts`
- Exports: `cn(...inputs: ClassValue[]): string`
- Purpose: Tailwind-aware class merger using `clsx` + `tailwind-merge`.

#### `lib/icons.ts`
- Purpose: Centralized icon re-exports from `react-icons` to avoid dynamic import issues in Turbopack environments.
- Exports: `FiFile`, `FiChevronRight`, `FiChevronDown`, `FiGithub`, `BsFolderFill`, `BsFolder2Open`, `SiJavascript`, `SiReact`, `SiCss3`, `SiJson`.

#### `lib/context-selector.ts`
- Key exports:
  - `selectFilesForEdit(userPrompt, manifest): FileContext`
  - `getFileContents(files, manifest)`
  - `formatFilesForAI(primaryFiles, contextFiles)`
- Purpose: Given a user prompt and a `FileManifest`, determines which files to edit vs provide as context and composes a rich system prompt. Ensures key files like `App.jsx`, `index.css`, `tailwind.config.js`, and `package.json` are surfaced first as context.

`FileContext` shape:
```ts
{
  primaryFiles: string[]
  contextFiles: string[]
  systemPrompt: string
  editIntent: EditIntent
}
```

#### `lib/edit-intent-analyzer.ts`
- Exports: `analyzeEditIntent(prompt, manifest): EditIntent`
- Purpose: Classifies requested change into `EditType` and selects target files using patterns:
  - `UPDATE_COMPONENT`, `ADD_FEATURE`, `FIX_ISSUE`, `UPDATE_STYLE`, `REFACTOR`, `FULL_REBUILD`, `ADD_DEPENDENCY`.
- Internals: Helper resolvers search for component names, content matches, likely routing parents, style files, etc., returning a minimal target set and suggested context.

#### `lib/edit-examples.ts`
- Exports:
  - `EDIT_EXAMPLES` example-rich guidance
  - `getEditExamplesPrompt()`, `getComponentPatternPrompt(fileStructure)`
- Purpose: Prompt snippets ensuring surgical edits and correct file targeting.

#### `lib/file-parser.ts`
- Exports:
  - `parseJavaScriptFile(content, filePath): Partial<FileInfo>` → derives `imports`, `exports`, `componentInfo`, `type`
  - `buildComponentTree(files): Record<string, { file, imports, importedBy, type }>`
- Purpose: Light AST-less parsing via regex to annotate files and build a component dependency map for manifests.

`ComponentInfo` fields:
- `name`, `hooks[]`, `hasState`, `childComponents[]`

File type heuristics:
- `style`, `config`, `hook`, `context`, `layout`, `page`, `utility`, default `component`.

#### `lib/file-search-executor.ts`
- Exports:
  - `executeSearchPlan(searchPlan, files): SearchExecutionResult`
  - `formatSearchResultsForAI(results): string`
  - `selectTargetFile(results, editType)`
- Purpose: Executes AI-provided search strategies over in-memory files to find exact edit locations and provide high-confidence anchors for surgical edits.

`SearchPlan`:
```ts
{
  editType: string
  reasoning: string
  searchTerms: string[]
  regexPatterns?: string[]
  fileTypesToSearch?: string[]
  expectedMatches?: number
  fallbackSearch?: { terms: string[], patterns?: string[] }
}
```

#### Relationships

- `generate-ai-code-stream` → uses `context-selector`, `file-search-executor` to build targeted context and show results.
- `get-sandbox-files` → uses `file-parser` to build `FileManifest` and component tree.



