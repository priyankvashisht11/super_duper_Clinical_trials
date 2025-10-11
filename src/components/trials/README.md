# Clinical Trial Card Component

A comprehensive React component for displaying clinical trial information in a card format, designed specifically for the Clinical Trials Intelligence Platform.

## Features

### Core Display Features
- **CTRI Number**: Prominently displayed with monospace font and primary color styling
- **Trial Title**: Clear, readable title with text truncation for long titles
- **Brief Summary**: Expandable summary with proper line clamping
- **Status Chips**: Color-coded recruitment status indicators
- **Phase Chips**: Color-coded trial phase indicators
- **Trial Metadata**: Organized display of key trial information

### Interactive Features
- **Bookmark Functionality**: Toggle bookmark state with local storage persistence
- **Selection Capability**: Checkbox selection for document generation workflows
- **Action Buttons**: View details and generate summary actions
- **Hover Effects**: Smooth animations and visual feedback
- **Text Highlighting**: Search term highlighting support

### Responsive Design
- **Mobile Optimized**: Touch-friendly interactions and responsive layout
- **Compact Mode**: Condensed view for list displays
- **Flexible Layout**: Adapts to different container sizes
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels

## Usage

### Basic Usage

```tsx
import { TrialCard } from '@/components/trials';
import { ClinicalTrial } from '@/types';

const trial: ClinicalTrial = {
  id: 'trial-123',
  ctriNumber: 'CTRI/2024/01/012345',
  title: 'Efficacy of Novel Diabetes Treatment',
  briefSummary: 'Phase III trial for diabetes treatment...',
  phase: 'III',
  recruitmentStatus: 'recruiting',
  // ... other trial properties
};

function TrialList() {
  return (
    <TrialCard
      trial={trial}
      onViewDetails={(id) => console.log('View:', id)}
      onGenerateSummary={(id) => console.log('Generate:', id)}
    />
  );
}
```

### Advanced Usage with All Features

```tsx
function AdvancedTrialCard() {
  const [selectedTrials, setSelectedTrials] = useState<string[]>([]);
  const [bookmarkedTrials, setBookmarkedTrials] = useState<string[]>([]);

  return (
    <TrialCard
      trial={trial}
      isSelected={selectedTrials.includes(trial.id)}
      isBookmarked={bookmarkedTrials.includes(trial.id)}
      showDistance={true}
      distance={12.5}
      highlightMatching="diabetes"
      selectable={true}
      compact={false}
      onSelect={(id, selected) => {
        setSelectedTrials(prev => 
          selected ? [...prev, id] : prev.filter(x => x !== id)
        );
      }}
      onBookmark={(id, bookmarked) => {
        setBookmarkedTrials(prev => 
          bookmarked ? [...prev, id] : prev.filter(x => x !== id)
        );
      }}
      onViewDetails={(id) => navigate(`/trials/${id}`)}
      onGenerateSummary={(id) => openDocumentPanel(id)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trial` | `ClinicalTrial` | Required | Trial data object |
| `isSelected` | `boolean` | `false` | Whether trial is selected |
| `isBookmarked` | `boolean` | `false` | Whether trial is bookmarked |
| `showDistance` | `boolean` | `false` | Show distance from user location |
| `distance` | `number` | - | Distance in kilometers |
| `highlightMatching` | `string` | - | Text to highlight |
| `selectable` | `boolean` | `false` | Show selection checkbox |
| `compact` | `boolean` | `false` | Use compact layout |
| `onSelect` | `(id: string, selected: boolean) => void` | - | Selection change handler |
| `onBookmark` | `(id: string, bookmarked: boolean) => void` | - | Bookmark change handler |
| `onViewDetails` | `(id: string) => void` | - | View details handler |
| `onGenerateSummary` | `(id: string) => void` | - | Generate summary handler |

## Status Colors

The component uses a consistent color scheme for different trial statuses:

- **Recruiting**: Green (`#4CAF50`)
- **Not Yet Recruiting**: Orange (`#FF9800`)
- **Completed**: Red (`#F44336`)
- **Suspended**: Gray (`#9E9E9E`)

## Phase Colors

Trial phases are color-coded for quick identification:

- **Phase I**: Purple (`#9C27B0`)
- **Phase II**: Orange (`#FF9800`)
- **Phase III**: Green (`#4CAF50`)
- **Phase IV**: Blue (`#2196F3`)

## Local Storage Integration

The component automatically manages bookmark state in localStorage:

- Key: `bookmarkedTrials`
- Format: `string[]` (array of trial IDs)
- Persistence: Survives browser sessions

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Supports high contrast mode
- **Focus Management**: Clear focus indicators and logical tab order

## Testing

The component includes comprehensive test coverage:

```bash
npm test TrialCard.test.tsx
```

Test categories:
- Basic rendering and content display
- Status and phase chip styling
- Bookmark functionality and localStorage
- Selection and interaction handling
- Responsive design and layout
- Edge cases and error handling

## Storybook

Interactive component documentation available in Storybook:

```bash
npm run storybook
```

Stories include:
- Default states
- All recruitment statuses
- All trial phases
- Interactive features
- Responsive layouts
- Edge cases

## Performance Considerations

- **Memoization**: Component uses React.memo for performance
- **Event Handling**: Optimized event handlers with useCallback
- **Text Truncation**: CSS-based truncation for better performance
- **Lazy Loading**: Supports lazy loading in virtualized lists

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Material-UI v5
- TypeScript 4.9+

## Related Components

- `SearchBar`: For trial search functionality
- `FilterSidebar`: For trial filtering
- `DocumentPanel`: For document generation
- `TrialDetails`: For detailed trial view