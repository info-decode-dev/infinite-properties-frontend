# Project Structure Guide

This document outlines the professional folder structure for the Infinite Properties project.

## Root Structure

```
client/
├── app/                    # Next.js App Router pages and routes
├── components/            # React components
│   ├── ui/                # Reusable UI components (Button, Card, Modal, etc.)
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (Header, Footer, Sidebar)
│   └── features/          # Feature-specific components
├── styles/                # SCSS stylesheets (see styles/README.md)
├── utils/                 # Utility functions and helpers
│   ├── helpers/           # General helper functions
│   ├── validators/        # Validation functions
│   ├── formatters/        # Formatting functions (date, currency, etc.)
│   └── constants/         # Constants and configuration
├── hooks/                 # Custom React hooks
├── context/               # React Context providers
├── lib/                   # Library configurations and utilities
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
├── assets/                # Static assets (images, fonts)
└── public/                # Public static files
```

## Component Organization

### UI Components (`components/ui/`)
Reusable, generic UI components that can be used across the application:
- Button
- Card
- Modal
- Input
- Select
- Checkbox
- Radio
- etc.

### Form Components (`components/forms/`)
Form-specific components and form-related utilities:
- FormField
- FormWrapper
- FormError
- etc.

### Layout Components (`components/layout/`)
Layout-related components:
- Header/Navbar
- Footer
- Sidebar
- Container
- Grid
- etc.

### Feature Components (`components/features/`)
Feature-specific components that are tied to business logic:
- PropertyCard
- PropertyForm
- CollectionCard
- TestimonialCard
- etc.

## Styles Organization

See `styles/README.md` for detailed information about the SCSS structure.

## Utils Organization

### Helpers (`utils/helpers/`)
General-purpose helper functions:
- `formatDate.ts`
- `debounce.ts`
- `throttle.ts`
- `classNames.ts`
- etc.

### Validators (`utils/validators/`)
Validation functions:
- `validateEmail.ts`
- `validatePhone.ts`
- `validateProperty.ts`
- etc.

### Formatters (`utils/formatters/`)
Data formatting functions:
- `formatCurrency.ts`
- `formatDate.ts`
- `formatAddress.ts`
- etc.

### Constants (`utils/constants/`)
Application constants:
- `apiEndpoints.ts`
- `routes.ts`
- `config.ts`
- etc.

## Best Practices

1. **Component Naming**: Use PascalCase for component files (e.g., `PropertyCard.tsx`)
2. **Utility Naming**: Use camelCase for utility files (e.g., `formatDate.ts`)
3. **Type Definitions**: Keep types close to where they're used, or in `types/` for shared types
4. **Import Paths**: Use `@/` alias for imports (configured in `tsconfig.json`)
5. **File Organization**: One component/utility per file
6. **Naming Conventions**: 
   - Components: PascalCase
   - Utilities: camelCase
   - Constants: UPPER_SNAKE_CASE
   - SCSS files: kebab-case with leading underscore

## Import Examples

```typescript
// Component imports
import Button from '@/components/ui/Button';
import PropertyCard from '@/components/features/PropertyCard';

// Utility imports
import { formatDate } from '@/utils/formatters/formatDate';
import { validateEmail } from '@/utils/validators/validateEmail';

// Type imports
import { Property } from '@/types/property';

// Style imports (in component)
import styles from './PropertyCard.module.scss';
```

## Next Steps

1. Move existing components to appropriate subdirectories
2. Create reusable UI components
3. Set up utility functions as needed
4. Add component-specific SCSS files
5. Create page-specific SCSS files for complex pages

