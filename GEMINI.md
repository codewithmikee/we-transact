# GEMINI.md - Instructional Context for Next.js Starter

This document provides essential context and instructions for AI agents working on the `next-starter` project.

## Project Overview

`next-starter` is a modern, high-performance web application template built with the latest React and Next.js ecosystem. It is designed to be a solid foundation for scalable web applications with a focus on developer experience and UI consistency.

### Core Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/postcss`)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (using Radix UI, Headless UI, and Motion)
- **Icons:** Lucide React
- **Theming:** `next-themes` for dark/light mode support

## Layouts & Navigation

The project supports two primary administrative perspectives, each with its own layout and navigation pattern:

### 1. System Admin Perspective (`/system/...`)
- **Desktop:** Features a horizontal navigation bar in the header (`SYSTEM_ADMIN_NAV_ITEMS`).
- **Mobile:** Navigation items are moved to a toggleable sidebar.
- **Key Components:** `SystemAdminLayout`, `NotificationBell`, `ProfilePopover`.

### 2. Organization Admin Perspective (`/org/[slug]/...`)
- **Desktop:** Features a persistent left sidebar (`ORGANIZATION_USER_NAV_ITEMS`) and the Organization Name in the header.
- **Mobile:** Sidebar is hidden by default and can be toggled via a hamburger menu.
- **Nested View:** System admins can access an organization's perspective under `/system/organizations/[slug]/...`, which uses the `OrgAdminLayout` with a "Back to System" contextual link.
- **Key Components:** `OrgAdminLayout`, `DynamicSidebar`.

## Navigation Configuration

Navigation is managed via `src/lib/nav-configs/nav-items.ts` and supports:
- **Simple Links:** `NavItemContent` with title and link.
- **Groups:** `NavGroup` with a title and an array of `NavItemContent`.
- **Role-based Prevention:** `preventerUserRoles` can be used to hide items from specific roles (logic implemented in sidebar/navbar).

## Core UI Components (Headless UI)
- **Tabs:** `src/components/ui/Tabs.tsx`
- **Toggle/Switch:** `src/components/ui/Toggle.tsx`
- **Menu/Dropdown:** `src/components/ui/Menu.tsx`
- **Modal/Dialog:** `src/components/ui/Dialog.tsx`
- **Select/Listbox:** `src/components/ui/Select.tsx`
- **NotificationBell:** `src/components/layout/NotificationBell.tsx` (Popover)
- **ProfilePopover:** `src/components/layout/ProfilePopover.tsx` (Menu)

- `src/app/`: Application routes, layouts, and global styles.
- `src/components/`:
  - `ui/`: Core reusable UI components (managed via shadcn/ui).
  - `layout/`: Structural components like Navbar, Sidebar, and Footer.
  - `cards/`: specialized card components (Feature, Product, Profile).
  - `demo/`: Components used for showcasing features.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions and shared library configurations (e.g., `utils.ts` with `cn`).
- `public/`: Static assets.

## Development Workflows

### Key Commands
- `pnpm dev`: Start the development server with Turbopack.
- `pnpm build`: Build the application for production.
- `pnpm start`: Run the production server.
- `pnpm lint`: Run ESLint for code quality checks.
- `pnpm format`: Format the codebase using Prettier.
- `pnpm typecheck`: Run TypeScript compiler to check for type errors.

### Component Guidelines
- **Importing:** Always use the `@/` path alias (e.g., `import { Button } from "@/components/ui/button"`).
- **Adding UI Components:** Use the shadcn CLI: `npx shadcn@latest add [component-name]`.
- **Styling:** Use Tailwind CSS 4 utility classes. For conditional classes, use the `cn()` utility from `@/lib/utils`.
- **Theming:** Use the `ThemeProvider` and `next-themes` hooks for theme-aware components.

## Architecture & Conventions

- **RSC (React Server Components):** Use Server Components by default. Add `"use client"` only when interactive features (state, effects, event listeners) are required.
- **Type Safety:** Maintain strict TypeScript definitions for all components and utility functions.
- **Naming:**
  - Components: PascalCase (e.g., `ProductCard.tsx`).
  - Hooks: `use` prefix (e.g., `useLocalStorage.ts`).
  - Utils/Others: camelCase (e.g., `utils.ts`).
- **Icons:** Prefer Lucide icons for consistency.
- **Animations:** Use `motion` (formerly Framer Motion) for complex animations and transitions.

## Instructions for Gemini CLI

- When creating new routes, use the `src/app/` directory structure.
- When adding new shared components, place them in `src/components/` and ensure they follow the established styling patterns.
- Prioritize using existing UI components from `src/components/ui/` before building custom ones.
- Ensure all new code is properly typed and formatted according to `.prettierrc`.
- Use the `cn` utility for any dynamic class merging.
