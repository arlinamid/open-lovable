### UI Components

This document catalogs reusable UI and app-level components under `components/*` and `app/components/*`.

#### `components/CodeApplicationProgress.tsx`
- Purpose: Minimal in-chat progress pill for “applying to sandbox” states with a spinner.
- Props:
  - `state: { stage: 'analyzing'|'installing'|'applying'|'complete'|null, packages?, installedPackages?, filesGenerated?, message? }`
- Behavior: Renders when `state.stage` is non-null and not `complete`. Uses `framer-motion` for subtle transitions.

Usage example:
```tsx
<CodeApplicationProgress state={{ stage: 'installing', message: 'Installing packages...' }} />
```

#### `components/HMRErrorDetector.tsx`
- Purpose: Polls a sandbox iframe for Vite HMR error overlay and extracts “Failed to resolve import” to detect missing npm packages.
- Props:
  - `iframeRef: RefObject<HTMLIFrameElement>`
  - `onErrorDetected: (errors: Array<{ type: string; message: string; package?: string }>) => void`
- Behavior: Every 2s, inspects the overlay and emits extracted errors.

#### `components/SandboxPreview.tsx`
- Purpose: Embedded preview of the E2B-hosted app with quick controls.
- Props:
  - `sandboxId: string`, `port: number`, `type: 'vite'|'nextjs'|'console'`, `output?: string`, `isLoading?: boolean`
- Behavior:
  - Constructs `https://{port}-{sandboxId}.e2b.app` URL for non-console.
  - Toggle embedded console; refresh iframe; open in new tab.
  - Polls `/api/sandbox-logs` when console visible for lightweight status.

#### `components/ui/button.tsx`
- Purpose: Button primitive with `class-variance-authority` variants.
- Exports: `Button`, `buttonVariants`
- Variants: `variant: default | secondary | outline | destructive | code | orange | ghost`; `size: default | sm | lg`
- Class utilities: Uses `cn` from `lib/utils`.

#### `components/ui/checkbox.tsx`
- Purpose: Controlled-like checkbox with custom styles.
- Props: `label?`, `defaultChecked?`, `disabled?`, `className?`, `onChange?(checked)`

#### `components/ui/input.tsx`
- Purpose: Styled input primitive.
- Props: All native `input` props.

#### `components/ui/label.tsx`
- Purpose: Styled label using `cva`.
- Props: All native `label` props.

#### `components/ui/select.tsx`
- Purpose: Styled select primitive.
- Props: All native `select` props.

#### `components/ui/textarea.tsx`
- Purpose: Styled textarea primitive.
- Props: All native `textarea` props.

#### `app/components/ui/switch.tsx`
- Purpose: Toggle switch built on `@radix-ui/react-switch`.
- Exports: `Switch`
- Notes: Marked `'use client'` for NextJS; relies on Tailwind classes.

#### `app/components/ui/toggle.tsx`
- Purpose: Pressable toggle button with variants.
- Exports: `Toggle`, `toggleVariants`

### Design System

- Tailwind CSS utilities throughout, with rounded 10px radius and layered shadow tokens for tactile feel.
- `lib/utils.ts` provides `cn(...)` to merge classes with `tailwind-merge`.



