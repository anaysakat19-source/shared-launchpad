# MacroMentor Design System

## Overview
The MacroMentor design system is built on a health and wellness theme with semantic tokens for consistent styling across the application.

## Color Palette

### Primary Colors
- **Primary (Fresh Green)**: `hsl(142 76% 36%)` - Health & Vitality
  - Represents growth, health, and nature
  - Used for primary actions, success states, and health metrics
  - Glow variant: `hsl(142 76% 50%)`

- **Secondary (Deep Blue)**: `hsl(221 83% 53%)` - Trust & Reliability
  - Conveys professionalism and stability
  - Used for informational elements and secondary actions
  
- **Accent (Warm Orange)**: `hsl(25 95% 53%)` - Motivation & CTA
  - Energizing and encouraging
  - Used for call-to-action buttons and motivational elements

### Surface Colors
- **Background**: `hsl(210 20% 98%)` - Clean, light base
- **Card**: `hsl(0 0% 100%)` - White surfaces
- **Muted**: `hsl(210 20% 95%)` - Subtle backgrounds
- **Foreground**: `hsl(215 25% 15%)` - Dark text

### Semantic Colors
- **Success**: Uses primary green
- **Warning**: `hsl(38 92% 50%)` - Cautionary orange
- **Info**: Uses secondary blue
- **Destructive**: `hsl(0 84% 60%)` - Error red

## Typography

### Font Stack
- **Headings**: Inter or Poppins - Modern, clean sans-serif
- **Body**: System font stack (ui-sans-serif) - Optimized for readability

### Scale
- Display: `text-5xl` (48px)
- H1: `text-4xl` (36px)
- H2: `text-3xl` (30px)
- H3: `text-2xl` (24px)
- H4: `text-xl` (20px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)

## Spacing & Layout

### Border Radius
- Default: `0.75rem` (12px)
- Large: `calc(var(--radius))` (12px)
- Medium: `calc(var(--radius) - 2px)` (10px)
- Small: `calc(var(--radius) - 4px)` (8px)

### Container
- Max width: 1400px (2xl breakpoint)
- Padding: 2rem (32px)

### Card Layout
- Consistent padding: 1.5rem (24px)
- Shadow: Subtle elevation with HSL-based shadows
- Hover states: Slight shadow increase

## Interactive Elements

### Buttons
- **Primary**: Background primary, white text
- **Secondary**: Background secondary, white text
- **Accent**: Background accent, white text
- **Outline**: Border primary, primary text
- Touch target: Minimum 44px height

### Form Inputs
- Border: `hsl(214 20% 88%)`
- Focus ring: Primary color
- Height: 40px minimum
- Border radius: Default (12px)

### Cards
- Background: White
- Border: Subtle gray
- Hover: Shadow elevation
- Transition: 0.3s cubic-bezier

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- 2XL: > 1400px

### Mobile-First Approach
- Base styles apply to mobile
- Progressive enhancement for larger screens
- Touch-friendly targets (44px minimum)

## Accessibility

### Color Contrast
- Text on background: High contrast ratios (WCAG AA+)
- Primary on white: Pass AA
- Foreground on background: Pass AAA

### Interactive States
- Focus visible: Primary ring
- Hover: Color shift or shadow
- Active: Slightly darker shade
- Disabled: Reduced opacity (0.5)

## Dark Mode

### Automatic Theme Support
Dark mode is fully supported with adjusted HSL values:
- Background: `hsl(215 28% 12%)`
- Primary: `hsl(142 76% 45%)` (slightly lighter)
- Maintains proper contrast ratios
- All semantic tokens adjust automatically

## Component Patterns

### Progress Indicators
- Circular progress rings for nutrition
- Linear progress bars for onboarding
- Color: Primary green
- Background: Muted gray

### Badges & Achievement Cards
- Rounded corners
- Primary color for active/earned
- Muted for locked/unearned
- Icon + text combination

### Meal Cards
- Image at top (aspect ratio 16:9)
- Title + description
- Nutritional badges (calories, protein, etc.)
- Action buttons at bottom

### Workout Cards
- Icon or thumbnail
- Difficulty badge
- Duration indicator
- Condition tags as chips

## Animation & Transitions

### Timing Functions
- Default: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Duration: 0.3s for most interactions
- Smooth, purposeful animations

### Common Animations
- Hover lift: translateY(-2px)
- Card hover: shadow increase
- Button press: scale(0.98)
- Page transitions: fade + slide

## Usage Guidelines

### DO
- Use semantic tokens (primary, secondary, accent)
- Maintain consistent spacing (4px, 8px, 16px, 24px, 32px)
- Follow accessibility guidelines
- Test on mobile devices
- Use card-based layouts

### DON'T
- Use hardcoded colors (text-white, bg-black)
- Mix different color systems
- Ignore touch target sizes
- Create inconsistent spacing
- Override semantic meanings

## File References

### Design System Files
- `src/index.css` - CSS variables and base styles
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/*` - Base UI components

### Implementation
All colors MUST be defined as HSL values in `index.css` and referenced via Tailwind's color system in `tailwind.config.ts`. Never use direct color values in components.
