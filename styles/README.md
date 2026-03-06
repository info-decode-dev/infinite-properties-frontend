# Styles Directory Structure

This directory contains all SCSS stylesheets for the Infinite Properties project, organized following a professional 7-1 architecture pattern.

## Directory Structure

```
styles/
├── abstracts/          # Sass tools and helpers (variables, functions, mixins)
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _breakpoints.scss
│   └── _utils.scss
├── base/              # Base styles (reset, typography, fonts)
│   ├── _reset.scss
│   ├── _fonts.scss
│   └── _typography.scss
├── layout/            # Layout-related styles (grid, containers)
│   └── _grid.scss
├── components/         # Component-specific styles
│   └── _index.scss
├── pages/             # Page-specific styles
│   └── _index.scss
├── themes/            # Theme variations
│   └── _index.scss
└── main.scss          # Main entry point (imports all other files)
```

## Usage

### Importing Styles

The main SCSS file (`main.scss`) is automatically imported in `app/globals.css`. All styles are compiled and available throughout the application.

### Using Variables and Mixins

```scss
// In any component or page SCSS file
@use "../abstracts/variables" as v;
@use "../abstracts/utils" as u;

.my-component {
  color: map-get(v.$colors, primary);
  padding: map-get(v.$spacing, 4);
  
  @include u.flex-center;
}
```

### Breakpoints

```scss
@use "../abstracts/breakpoints" as bp;

.my-element {
  width: 100%;
  
  @include bp.breakpoint(medium) {
    width: 50%;
  }
  
  @include bp.breakpoint-down(small) {
    width: 100%;
  }
}
```

## Available Variables

### Colors
- `primary`, `primary-light`, `primary-dark`
- `secondary`, `secondary-light`, `secondary-dark`
- `accent`, `accent-light`, `accent-dark`
- `white`, `black`, `gray-100` through `gray-900`
- Semantic colors: `success`, `info`, `warning`, `danger`

### Spacing
- Scale from `0` to `64` (in rem units)
- Example: `map-get(v.$spacing, 4)` = `1rem` (16px)

### Typography
- Font families: `primary`, `secondary`, `mono`
- Font weights: `light`, `regular`, `medium`, `semi-bold`, `bold`, `extra-bold`
- Font sizes: `xs` through `9xl`
- Line heights: `none`, `tight`, `snug`, `normal`, `relaxed`, `loose`

### Breakpoints
- `small`: 480px
- `medium`: 700px
- `medium-large`: 800px
- `large`: 900px
- `xlarge`: 1440px
- `xxlarge`: 1920px

## Utility Mixins

Available in `abstracts/_utils.scss`:

- Layout: `flex-center`, `flex-between`, `flex-column`, `grid-center`, `grid-columns`
- Positioning: `absolute-center`, `absolute-fill`
- Text: `text-truncate`, `text-clamp`, `elegant-text`, `script-text`
- Visual: `card-style`, `button-reset`, `link-reset`
- Accessibility: `sr-only`, `focus-visible`
- Animation: `smooth-transition`, `hover-lift`, `fade-in`
- Property-specific: `property-card`, `transparent-background`, `decorative-border`

## Adding New Styles

### Component Styles
1. Create a new file in `components/` (e.g., `_button.scss`)
2. Import it in `components/_index.scss`
3. Use variables and mixins from abstracts

### Page Styles
1. Create a new file in `pages/` (e.g., `_home.scss`)
2. Import it in `pages/_index.scss`
3. Use component styles and utilities

## Best Practices

1. **Always use variables** - Don't hardcode colors, spacing, or other values
2. **Use mixins** - Leverage utility mixins for common patterns
3. **Follow BEM naming** - Use Block__Element--Modifier convention
4. **Mobile-first** - Write base styles for mobile, then add breakpoints
5. **Keep it modular** - One component/feature per file
6. **Use @use instead of @import** - Modern Sass syntax

## Fonts

Font files should be placed in `/public/fonts/` directory. The font-face declarations are in `base/_fonts.scss`.

Currently configured fonts:
- **Lato** (Primary - body text)
- **Marcellus** (Secondary - headings)

