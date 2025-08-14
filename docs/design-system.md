# AIForecast Hub Design System

## Design Philosophy

Based on the inspiration images, the design system follows a minimalist, premium aesthetic with emphasis on:
- **Ultra-clean typography** with generous spacing
- **Deep dark backgrounds** with subtle gradients
- **Minimal use of color** with strategic accent placement
- **Geometric shapes** as primary visual elements
- **Premium glassmorphism** with subtle transparency
- **Refined spacing** and micro-interactions

## Color System

### Dark Theme (Primary)
```css
--background-primary: hsl(0, 0%, 2%)         /* Pure black background */
--background-secondary: hsl(0, 0%, 4%)       /* Slightly elevated surfaces */
--background-tertiary: hsl(0, 0%, 8%)        /* Card backgrounds */
--text-primary: hsl(0, 0%, 98%)              /* Primary text */
--text-secondary: hsl(0, 0%, 65%)            /* Secondary text */
--text-muted: hsl(0, 0%, 45%)                /* Muted text */
--accent-blue: hsl(210, 100%, 60%)           /* Primary accent */
--accent-green: hsl(142, 76%, 36%)           /* Success/positive */
--border-subtle: hsl(0, 0%, 12%)             /* Subtle borders */
--border-prominent: hsl(0, 0%, 18%)          /* Prominent borders */
```

### Light Theme
```css
--background-primary: hsl(0, 0%, 99%)        /* Pure white background */
--background-secondary: hsl(0, 0%, 97%)      /* Slightly elevated surfaces */
--background-tertiary: hsl(0, 0%, 95%)       /* Card backgrounds */
--text-primary: hsl(0, 0%, 8%)               /* Primary text */
--text-secondary: hsl(0, 0%, 35%)            /* Secondary text */
--text-muted: hsl(0, 0%, 55%)                /* Muted text */
--accent-blue: hsl(210, 100%, 50%)           /* Primary accent */
--accent-green: hsl(142, 76%, 36%)           /* Success/positive */
--border-subtle: hsl(0, 0%, 88%)             /* Subtle borders */
--border-prominent: hsl(0, 0%, 82%)          /* Prominent borders */
```

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Type Scale
```css
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
```

### Font Weights
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## Spacing System

### Spacing Scale
```css
--space-1: 0.25rem      /* 4px */
--space-2: 0.5rem       /* 8px */
--space-3: 0.75rem      /* 12px */
--space-4: 1rem         /* 16px */
--space-5: 1.25rem      /* 20px */
--space-6: 1.5rem       /* 24px */
--space-8: 2rem         /* 32px */
--space-10: 2.5rem      /* 40px */
--space-12: 3rem        /* 48px */
--space-16: 4rem        /* 64px */
--space-20: 5rem        /* 80px */
--space-24: 6rem        /* 96px */
```

## Component Guidelines

### Cards
- **Background**: Extremely subtle transparency with dark backdrop
- **Border**: 1px solid with very low opacity
- **Border Radius**: 12px for cards, 8px for smaller elements
- **Padding**: Generous (24px minimum for cards)
- **Shadow**: Minimal, focused on depth rather than prominence

### Buttons
- **Primary**: Dark background with subtle border
- **Secondary**: Transparent background with border
- **Hover States**: Subtle scale (1.02x) and opacity changes
- **Border Radius**: 8px
- **Padding**: 12px 24px for regular buttons

### Navigation
- **Minimal design** with clean typography
- **No visible separators** between nav items
- **Subtle hover states** with opacity changes
- **Logo**: Simple geometric triangle shape

### Data Visualization
- **Minimal grid lines** with low opacity
- **Clean axes** with subtle typography
- **Strategic use of color** - limited palette
- **Smooth animations** and transitions

### Layout Principles
- **Generous whitespace** between sections
- **Maximum content width**: 1200px
- **Grid system**: 12-column responsive grid
- **Vertical rhythm**: Consistent 24px baseline

## Glassmorphism Implementation

### Base Glass Effect
```css
.glass-minimal {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .glass-minimal {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Enhanced Glass Effect
```css
.glass-prominent {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dark .glass-prominent {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Animation Guidelines

### Transitions
- **Duration**: 200ms for micro-interactions, 300ms for larger changes
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94) for natural feel
- **Properties**: opacity, transform, filter

### Hover Effects
- **Scale**: 1.02x maximum
- **Opacity**: 0.8 for subtle effects
- **Transform**: translateY(-2px) for lift effect

## Responsive Breakpoints

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

## Implementation Rules

1. **Consistency First**: Every component must follow the design tokens
2. **Minimal Color Usage**: Use color sparingly and strategically
3. **Typography Hierarchy**: Clear distinction between heading levels
4. **Spacing Consistency**: Use only defined spacing values
5. **Subtle Interactions**: All hover states should be understated
6. **Performance**: Optimize backdrop-filter usage for performance
7. **Accessibility**: Maintain WCAG AA contrast ratios in both themes

## Quality Checklist

Before shipping any component:
- [ ] Follows color system exactly
- [ ] Uses defined spacing values
- [ ] Implements proper typography hierarchy
- [ ] Includes both light and dark theme variants
- [ ] Has appropriate hover/focus states
- [ ] Maintains consistent border radius
- [ ] Uses minimal, purposeful animations
- [ ] Passes accessibility checks