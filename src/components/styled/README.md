# Clinical Trials Platform Design System

This directory contains the styled components and design system for the Clinical Trials Intelligence Platform. The design system is built on top of Material-UI v5 with custom medical-themed styling.

## Overview

The design system provides:
- Consistent visual language across the platform
- Reusable styled components with TypeScript interfaces
- Medical-specific color palette and typography
- Responsive design patterns
- Accessibility compliance (WCAG 2.1 AA)

## Architecture

```
src/components/styled/
├── index.ts              # Main exports
├── Layout.tsx            # Layout and container components
├── Cards.tsx             # Card components for trials and features
├── Buttons.tsx           # Button variants and interactive elements
├── Typography.tsx        # Text and heading components
├── Inputs.tsx            # Form inputs and controls
├── Status.tsx            # Status indicators and badges
├── Navigation.tsx        # Navigation and menu components
└── README.md            # This file
```

## Color Palette

### Primary Colors
- **Primary Blue**: `#1A73E8` - Main brand color for buttons, links, and highlights
- **Primary Dark**: `#1557B0` - Darker variant for hover states
- **Primary Light**: `#E3F2FD` - Light variant for backgrounds

### Medical Phase Colors
- **Phase I**: `#9C27B0` (Purple)
- **Phase II**: `#FF9800` (Orange)
- **Phase III**: `#4CAF50` (Green)
- **Phase IV**: `#2196F3` (Blue)

### Status Colors
- **Recruiting**: `#4CAF50` (Green)
- **Not Yet Recruiting**: `#FF9800` (Orange)
- **Completed**: `#F44336` (Red)
- **Suspended**: `#9E9E9E` (Gray)

## Typography Scale

### Headings
- **H1**: 32px, weight 700 - Page titles
- **H2**: 24px, weight 600 - Section headers
- **H3**: 20px, weight 600 - Subsection headers
- **H4**: 18px, weight 500 - Card titles

### Body Text
- **Body 1**: 16px, weight 400 - Main content
- **Body 2**: 14px, weight 400 - Secondary content
- **Caption**: 12px, weight 400 - Metadata and labels

### Font Family
Primary: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`
Monospace: `'Monaco', 'Consolas', monospace` (for CTRI numbers)
Serif: `'Georgia', serif` (for medical content)

## Spacing System

Based on 8px grid system:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px
- **xxxl**: 64px

## Component Usage

### Layout Components

```tsx
import { MainContainer, ContentArea, FilterSidebar, MainContent, DocumentPanel } from '@/components/styled';

// Three-column layout
<ContentArea>
  <FilterSidebar>
    {/* Filters */}
  </FilterSidebar>
  <MainContent>
    {/* Main content */}
  </MainContent>
  <DocumentPanel isOpen={true}>
    {/* Document generation */}
  </DocumentPanel>
</ContentArea>
```

### Card Components

```tsx
import { TrialCard, FeatureCard, StatsCard } from '@/components/styled';

// Trial card with selection and bookmark
<TrialCard selected={true} bookmarked={false}>
  <TrialCardContent>
    {/* Trial information */}
  </TrialCardContent>
</TrialCard>

// Feature showcase card
<FeatureCard>
  <FeatureCardContent>
    {/* Feature description */}
  </FeatureCardContent>
</FeatureCard>
```

### Button Components

```tsx
import { PrimaryButton, SecondaryButton, GenerateButton, VoiceButton } from '@/components/styled';

<PrimaryButton onClick={handleClick}>
  Primary Action
</PrimaryButton>

<GenerateButton loading={isGenerating}>
  Generate Document
</GenerateButton>

<VoiceButton recording={isRecording} onToggleRecording={toggleRecording} />
```

### Typography Components

```tsx
import { PageTitle, CardTitle, CTRINumber, PhaseText, StatusText } from '@/components/styled';

<PageTitle>Clinical Trials Search</PageTitle>
<CTRINumber number="CTRI/2024/01/012345" />
<PhaseText phase="III" />
<StatusText status="recruiting" />
```

### Input Components

```tsx
import { SearchInput, FormInput, MedicalAutocomplete, FilterSlider } from '@/components/styled';

<SearchInput 
  placeholder="Search clinical trials..."
  onSubmit={handleSearch}
/>

<MedicalAutocomplete
  options={medicalConditions}
  placeholder="Select condition..."
  onChange={handleConditionChange}
/>

<FilterSlider
  min={0}
  max={500}
  value={distance}
  onChange={handleDistanceChange}
/>
```

### Status Components

```tsx
import { StatusChip, PhaseChip, ProgressIndicator, ConfidenceScore } from '@/components/styled';

<StatusChip status="recruiting" />
<PhaseChip phase="III" />
<ProgressIndicator progress={75} />
<ConfidenceScore score={85} />
```

## Responsive Design

The design system uses Material-UI's breakpoint system:
- **xs**: 0px and up (mobile)
- **sm**: 600px and up (tablet)
- **md**: 960px and up (small desktop)
- **lg**: 1280px and up (desktop)
- **xl**: 1920px and up (large desktop)

### Layout Behavior
- **Desktop (lg+)**: Three-column layout with filters, main content, and document panel
- **Tablet (md)**: Collapsible sidebar, document panel moves below main content
- **Mobile (sm-)**: Single column, hamburger menu for filters

## Accessibility Features

All components include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- High contrast support
- Screen reader compatibility
- Color contrast ratios meeting WCAG 2.1 AA standards

## Theme Customization

The theme can be extended by modifying `src/styles/theme.ts`:

```tsx
// Add custom colors
const customColors = {
  ...medicalColors,
  custom: {
    newColor: '#FF5722',
  },
};

// Extend theme
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      newColor: string;
    };
  }
}
```

## Best Practices

### Component Composition
- Use layout components for consistent spacing and structure
- Combine typography components for consistent text styling
- Leverage status components for visual feedback

### Performance
- Components are optimized with `styled()` for minimal re-renders
- Use `React.memo()` for expensive components
- Implement proper key props for lists

### Accessibility
- Always provide meaningful labels
- Use semantic HTML elements
- Test with keyboard navigation
- Verify color contrast ratios

### Responsive Design
- Design mobile-first
- Use theme breakpoints consistently
- Test on multiple screen sizes
- Consider touch interactions on mobile

## Testing

Components can be tested using React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers';
import { TrialCard } from '@/components/styled';

test('renders trial card with correct status', () => {
  render(
    <ThemeProvider>
      <TrialCard>
        <StatusChip status="recruiting" />
      </TrialCard>
    </ThemeProvider>
  );
  
  expect(screen.getByText('Recruiting')).toBeInTheDocument();
});
```

## Examples

See `src/components/examples/DesignSystemDemo.tsx` for comprehensive usage examples of all styled components.

## Contributing

When adding new styled components:
1. Follow the existing naming conventions
2. Include proper TypeScript interfaces
3. Add responsive behavior
4. Ensure accessibility compliance
5. Update this documentation
6. Add examples to the demo component