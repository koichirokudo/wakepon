# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference

**IMPORTANT: Always respond in Japanese (日本語) when working on this project.** The application is built for Japanese users and all communication should be in Japanese to maintain consistency with the codebase and user experience.

## Commands

### Development
- `npm run dev` - Start development server (from `frontend/` directory)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Type Checking
- `npx tsc --noEmit` - Run TypeScript type checking without emitting files
- The build command includes TypeScript compilation (`tsc -b`)

## Architecture Overview

### Project Structure
This is a React-based expense tracking application with a **household sharing** concept, built on:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context (AuthContext)
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Styling**: CSS with normalize.css and custom styles

### Core Concepts

**Household System**: The app is built around households where multiple users can share expenses:
- Users belong to households via `household_members` table
- Expenses are tracked per household
- Categories can be shared across households

**Authentication Flow**:
- OTP-based authentication via Supabase Auth
- Users sign in with email → receive OTP → verify to access app
- Protected routes require authentication

### Key Components Architecture

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Centralized authentication state management
- Manages `session`, `user`, and `member` state
- Handles Supabase auth state changes
- Provides `signin`, `signout`, and `setUser` methods

**Layout System**:
- `Layout.tsx` - Main app shell with header, footer, drawer
- `ProtectedRoute.tsx` - HOC for authenticated-only pages
- `Header.tsx` - Navigation header
- `Footer.tsx` - Bottom navigation
- `Drawer.tsx` - Side navigation menu

**Page Structure**:
- `/` (Home) → `Expenses` - Main expense tracking page
- `/categories` → Category management
- `/profile` → User profile management
- `/invite` → Household member invitation
- `/signin` → Authentication page
- `/verify-otp` → OTP verification
- `/privacy-policy` → Privacy policy page

**Data Types** (`src/types.ts`):
- `User` - User profile data
- `Member` - Household membership data
- `Expense` - Expense records with category and user references
- `Category` - Expense categories (system + custom)
- Form input types for validation

### Routing Configuration

Routes are split into two categories in `main.tsx`:
1. **Public routes**: `/signin`, `/verify-otp` (no auth required)
2. **Protected routes**: All others wrapped in `<ProtectedRoute>` and `<Layout>`

### Supabase Integration

**Client Setup** (`src/lib/supabaseClient.ts`):
- Uses environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Single client instance exported for app-wide use

**Database Schema** (inferred from types):
- `users` - User profiles
- `household_members` - User-household relationships
- `expenses` - Expense records
- `categories` - Expense categories
- `household_categories` - Category-household relationships

### UI Component System

**Component Library** (`src/components/ui/`):
- `Card` - Container component with header/body/footer
- `Button` - Styled button component
- `Input` - Form input with validation support
- `Select` - Dropdown selection component
- `CheckBox` - Checkbox input
- `IconButton` - Button with icon support
- `OtpInput` - Specialized OTP input component
- `Drawer` - Side navigation drawer

**Form Handling**:
- React Hook Form for all forms
- Validation rules in `src/utils/validation.ts`
- Error handling utilities in `src/utils/errorHandler.ts`

### Development Notes

**Styling**:
- Uses M Plus 1 font family (Japanese support)
- normalize.css for cross-browser consistency
- Custom CSS with CSS variables
- Responsive design patterns

**Environment Variables Required**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**File Organization**:
- `pages/` - Route components
- `components/` - Reusable components
- `components/ui/` - Base UI components
- `contexts/` - React contexts
- `lib/` - External service clients
- `utils/` - Utility functions
- `types.ts` - TypeScript type definitions

### Common Patterns

**Protected Route Pattern**: All authenticated pages use `<ProtectedRoute>` wrapper which checks auth state and redirects to signin if needed.

**Form Pattern**: Components use React Hook Form with TypeScript validation, following the pattern in Profile.tsx for edit modes.

**Data Fetching**: Direct Supabase queries in components, with auth context providing user session for RLS policies.

**Error Handling**: Console logging for development, with user-friendly messages via form validation or context state.