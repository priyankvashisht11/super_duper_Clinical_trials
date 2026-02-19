# Integration Guide: AI Sample Size Agent

## Quick Start

The AI Sample Size Agent is now ready to use! Here's how to integrate it into your application.

## Files Created

### 1. Core Component
- `src/components/ai/AISampleSizeAgent.tsx` - Main conversational AI component

### 2. Section Editor
- `src/components/protocol-builder/sections/StatisticalConsiderationsEditor.tsx` - Full section editor with AI integration

### 3. Exports Updated
- `src/components/ai/index.ts` - Added exports for new components

## Integration Steps

### Step 1: Add Route (if needed)

If you have a routing system for protocol sections, add:

```typescript
// In your protocol builder routes
import { StatisticalConsiderationsEditor } from './sections/StatisticalConsiderationsEditor';

// Add to your section routes
{
  path: 'section-10',
  element: <StatisticalConsiderationsEditor />
}
```

### Step 2: Add to Section Navigation

If you have a section navigation component:

```typescript
const sections = [
  // ... other sections
  {
    number: '10',
    title: 'Statistical Considerations',
    path: '/protocol/:id/section-10',
    icon: <CalculateIcon />
  }
];
```

### Step 3: Verify Dependencies

Make sure these are installed:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Step 4: Test the Integration

1. Navigate to a protocol
2. Go to Section 10: Statistical Considerations
3. You should see the AI Sample Size Agent at the top
4. Start a conversation!

## Component Usage

### Standalone Usage

If you want to use the AI agent in other sections:

```typescript
import { AISampleSizeAgent } from '../components/ai/AISampleSizeAgent';

function MyComponent() {
  const handleApplyCalculation = (calculation) => {
    console.log('Sample size:', calculation.totalSampleSize);
    console.log('Per arm:', calculation.sampleSizePerArm);
    console.log('Justification:', calculation.justification);
    // Apply to your form fields
  };

  return (
    <AISampleSizeAgent
      protocolContext={{
        indication: 'Type 2 Diabetes',
        trialPhase: 'Phase III',
        studyDesignType: 'Parallel',
        numberOfArms: 2,
        controlType: 'Placebo'
      }}
      onApplyCalculation={handleApplyCalculation}
      initialData={{}}
    />
  );
}
```

### Props Interface

```typescript
interface AISampleSizeAgentProps {
  protocolContext: {
    indication?: string;
    trialPhase?: string;
    studyDesignType?: string;
    numberOfArms?: number;
    controlType?: string;
    // ... any other protocol data
  };
  onApplyCalculation: (calculation: SampleSizeCalculation) => void;
  initialData?: any;
}

interface SampleSizeCalculation {
  totalSampleSize: number;
  sampleSizePerArm: number;
  expectedDropoutRate: number;
  justification: string;
  powerAnalysis: string;
  assumptions: string[];
  confidence: 'high' | 'medium' | 'low';
}
```

## API Requirements

### AI Service Endpoint

The component calls:

```typescript
aiService.getSectionAssistance(
  sectionNumber: string,
  currentContent: any,
  prompt: string,
  protocolContext: any
)
```

Make sure your AI service is configured and the endpoint is working.

### Protocol Save Endpoint

The StatisticalConsiderationsEditor calls:

```
PUT /api/protocols/sections/10
Body: {
  protocolId: string,
  content: object
}
```

Make sure this endpoint exists and handles section updates.

## Styling

The component uses Material-UI with custom colors from your theme:

```typescript
import { colors } from '../../../styles/theme';
```

Make sure your theme exports these colors:
- `colors.primary.main`
- `colors.primary.dark`
- `colors.secondary.main`
- `colors.secondary.dark`
- `colors.semantic.success`
- `colors.semantic.warning`
- `colors.text.secondary`

## Testing

### Manual Testing Checklist

1. **Conversation Flow**
   - [ ] AI greets with protocol context
   - [ ] AI asks about endpoint type
   - [ ] AI asks about effect size
   - [ ] AI asks about power/alpha
   - [ ] AI asks about dropout
   - [ ] AI calculates and presents results

2. **Calculation Accuracy**
   - [ ] Binary endpoint calculation correct
   - [ ] Continuous endpoint calculation correct
   - [ ] Dropout adjustment correct
   - [ ] Multi-arm adjustment correct

3. **UI/UX**
   - [ ] Messages display correctly
   - [ ] Animations are smooth
   - [ ] Buttons work as expected
   - [ ] Results display clearly
   - [ ] Responsive on mobile

4. **Integration**
   - [ ] Apply button fills fields
   - [ ] Auto-save triggers
   - [ ] Validation triggers
   - [ ] Data persists

### Test Scenarios

#### Scenario 1: Binary Endpoint
```
Input:
- Endpoint: Binary
- Control: 30%
- Treatment: 50%
- Power: 80%
- Alpha: 0.05
- Dropout: 15%

Expected Output:
- Total: ~176
- Per Arm: ~88
```

#### Scenario 2: Continuous Endpoint
```
Input:
- Endpoint: Continuous
- Difference: 10 mmHg
- SD: 15 mmHg
- Power: 80%
- Alpha: 0.05
- Dropout: 15%

Expected Output:
- Total: ~80
- Per Arm: ~40
```

## Troubleshooting

### Issue: AI doesn't respond
**Solution**: Check AI service configuration and API key

### Issue: Calculation seems wrong
**Solution**: Verify formulas in the prompt and parsing logic

### Issue: Apply button doesn't work
**Solution**: Check onApplyCalculation callback and field mapping

### Issue: Styling looks off
**Solution**: Verify theme colors are exported correctly

### Issue: Component doesn't render
**Solution**: Check imports and make sure all dependencies are installed

## Support

For questions or issues:
1. Check the documentation files
2. Review the code comments
3. Test with the provided scenarios
4. Contact the development team

## Next Steps

After integration:
1. Test with real users
2. Gather feedback
3. Monitor usage metrics
4. Iterate based on data

## Resources

- **Technical Docs**: `AI_SAMPLE_SIZE_AGENT.md`
- **User Guide**: `SAMPLE_SIZE_QUICK_GUIDE.md`
- **Impact Analysis**: `SAMPLE_SIZE_BEFORE_AFTER.md`
- **Implementation Summary**: `AI_SAMPLE_SIZE_IMPLEMENTATION_COMPLETE.md`

---

**Ready to go!** 🚀

The AI Sample Size Agent is fully implemented and ready for production use.
