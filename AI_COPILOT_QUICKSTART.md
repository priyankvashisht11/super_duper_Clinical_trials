# AI Co-Pilot Quick Start Guide

## Add AI Co-Pilot to Your Section in 5 Steps

This guide shows you how to add AI Co-Pilot to any protocol section editor.

---

## Step 1: Import Required Components

```tsx
import { AICoPilotProvider } from '../../../contexts/AICoPilotContext';
import { AICoPilotSidebar } from '../../ai/AICoPilotSidebar';
import { AIEnhancedInput } from '../../ai/AIEnhancedInput';
import { AIFieldAssist } from '../../ai/AIFieldAssist';
```

---

## Step 2: Wrap Component with Provider

```tsx
export const YourSectionEditor: React.FC = () => {
  // ... your existing code ...
  
  return (
    <AICoPilotProvider>
      <Box>
        {/* Your content here */}
      </Box>
    </AICoPilotProvider>
  );
};
```

---

## Step 3: Add Sidebar Layout

Change your layout to include the AI Co-Pilot sidebar:

**Before:**
```tsx
<Box>
  {/* Your form fields */}
</Box>
```

**After:**
```tsx
<Box sx={{ display: 'flex', gap: 3 }}>
  {/* Left: Main Content */}
  <Box sx={{ flex: 1 }}>
    {/* Your form fields */}
  </Box>
  
  {/* Right: AI Co-Pilot Sidebar */}
  <Box sx={{ width: 350, flexShrink: 0 }}>
    <AICoPilotSidebar />
  </Box>
</Box>
```

---

## Step 4: Replace TextField with AI Components

### Option A: Advanced (Real-time AI)

**Before:**
```tsx
<TextField
  fullWidth
  label="Field Name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
/>
```

**After:**
```tsx
<AIEnhancedInput
  fieldName="fieldName"
  fieldType="text"
  sectionNumber="3"  // Your section number
  protocolContext={protocol}
  value={value}
  onChange={(newValue: string) => setValue(newValue)}
  label="Field Name"
  placeholder="Enter text..."
/>
```

### Option B: Lightweight (Button-based)

**Before:**
```tsx
<TextField
  fullWidth
  label="Field Name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
/>
```

**After:**
```tsx
<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
  <TextField
    fullWidth
    label="Field Name"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Enter text..."
  />
  <AIFieldAssist
    fieldName="fieldName"
    fieldValue={value}
    sectionNumber="3"  // Your section number
    protocolContext={protocol}
    onSuggestionSelect={(suggestion: string) => setValue(suggestion)}
  />
</Box>
```

### Option C: Both (Recommended for critical fields)

```tsx
<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
  <AIEnhancedInput
    fieldName="fieldName"
    fieldType="text"
    sectionNumber="3"
    protocolContext={protocol}
    value={value}
    onChange={(newValue: string) => setValue(newValue)}
    label="Field Name"
    placeholder="Enter text..."
  />
  <AIFieldAssist
    fieldName="fieldName"
    fieldValue={value}
    sectionNumber="3"
    protocolContext={protocol}
    onSuggestionSelect={(suggestion: string) => setValue(suggestion)}
  />
</Box>
```

---

## Step 5: Test Your Implementation

### Checklist:
- [ ] Component wraps with `<AICoPilotProvider>`
- [ ] Sidebar appears on the right
- [ ] Clicking a field updates the sidebar
- [ ] AIEnhancedInput shows suggestions after typing
- [ ] AIFieldAssist button opens popover
- [ ] Suggestions can be applied
- [ ] No TypeScript errors
- [ ] No console errors

---

## Complete Example

Here's a minimal complete example:

```tsx
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { AICoPilotProvider } from '../../../contexts/AICoPilotContext';
import { AICoPilotSidebar } from '../../ai/AICoPilotSidebar';
import { AIEnhancedInput } from '../../ai/AIEnhancedInput';
import { AIFieldAssist } from '../../ai/AIFieldAssist';

export const MyNewSectionEditor: React.FC = () => {
  const { protocol } = useProtocol();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <AICoPilotProvider>
      <Box>
        <Typography variant="h5" gutterBottom>
          My New Section
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Field 1: Advanced AI */}
            <Box sx={{ mb: 3 }}>
              <AIEnhancedInput
                fieldName="title"
                fieldType="text"
                sectionNumber="X"
                protocolContext={protocol}
                value={title}
                onChange={setTitle}
                label="Title"
                placeholder="Enter title..."
              />
            </Box>

            {/* Field 2: Lightweight AI */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
              />
              <AIFieldAssist
                fieldName="description"
                fieldValue={description}
                sectionNumber="X"
                protocolContext={protocol}
                onSuggestionSelect={setDescription}
              />
            </Box>
          </Box>

          {/* AI Co-Pilot Sidebar */}
          <Box sx={{ width: 350, flexShrink: 0 }}>
            <AICoPilotSidebar />
          </Box>
        </Box>
      </Box>
    </AICoPilotProvider>
  );
};
```

---

## Props Reference

### AIEnhancedInput Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fieldName` | string | ✅ | Unique field identifier |
| `fieldType` | string | ✅ | Field type (text, number, etc.) |
| `sectionNumber` | string | ✅ | Section number (e.g., "3") |
| `protocolContext` | any | ✅ | Protocol data for context |
| `value` | string | ✅ | Current field value |
| `onChange` | (value: string) => void | ✅ | Value change handler |
| `label` | string | ✅ | Field label |
| `multiline` | boolean | ❌ | Enable multiline (default: false) |
| `rows` | number | ❌ | Number of rows if multiline |
| `required` | boolean | ❌ | Show required indicator |
| `placeholder` | string | ❌ | Placeholder text |
| `helperText` | string | ❌ | Helper text below field |

### AIFieldAssist Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fieldName` | string | ✅ | Unique field identifier |
| `fieldValue` | string | ✅ | Current field value |
| `sectionNumber` | string | ✅ | Section number (e.g., "3") |
| `protocolContext` | any | ❌ | Protocol data for context |
| `onSuggestionSelect` | (suggestion: string) => void | ✅ | Callback when suggestion selected |

---

## Decision Guide

### When to Use AIEnhancedInput

✅ **Use for:**
- Required fields
- Complex regulatory content
- Fields that benefit from real-time feedback
- Critical protocol sections
- Fields where validation is important

❌ **Don't use for:**
- Simple dropdowns/selects
- Date pickers
- Numeric-only fields (use AIFieldAssist instead)
- Fields with strict formats

### When to Use AIFieldAssist

✅ **Use for:**
- Optional fields
- Less critical content
- When users prefer manual control
- To minimize API calls
- As a backup option alongside AIEnhancedInput

❌ **Don't use for:**
- Fields that need real-time validation
- Critical regulatory content (use AIEnhancedInput)

### When to Use Both

✅ **Use both when:**
- Field is critical but users have different preferences
- Want to give power users advanced features
- Want to provide fallback option
- Field benefits from both approaches

---

## Common Patterns

### Pattern 1: Form with Multiple Fields

```tsx
<Box sx={{ display: 'flex', gap: 3 }}>
  <Box sx={{ flex: 1 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Field 1 */}
      <AIEnhancedInput {...field1Props} />
      
      {/* Field 2 */}
      <AIEnhancedInput {...field2Props} />
      
      {/* Field 3 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField {...field3Props} />
        <AIFieldAssist {...field3AssistProps} />
      </Box>
    </Box>
  </Box>
  
  <Box sx={{ width: 350, flexShrink: 0 }}>
    <AICoPilotSidebar />
  </Box>
</Box>
```

### Pattern 2: Dialog/Modal with AI

```tsx
<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
  <DialogContent>
    <AICoPilotProvider>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Your form fields */}
        </Box>
        <Box sx={{ width: 300, flexShrink: 0 }}>
          <AICoPilotSidebar />
        </Box>
      </Box>
    </AICoPilotProvider>
  </DialogContent>
</Dialog>
```

### Pattern 3: Accordion/Expandable Sections

```tsx
<AICoPilotProvider>
  <Box sx={{ display: 'flex', gap: 3 }}>
    <Box sx={{ flex: 1 }}>
      <Accordion>
        <AccordionSummary>Section 1</AccordionSummary>
        <AccordionDetails>
          <AIEnhancedInput {...props} />
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary>Section 2</AccordionSummary>
        <AccordionDetails>
          <AIEnhancedInput {...props} />
        </AccordionDetails>
      </Accordion>
    </Box>
    
    <Box sx={{ width: 350, flexShrink: 0 }}>
      <AICoPilotSidebar />
    </Box>
  </Box>
</AICoPilotProvider>
```

---

## Troubleshooting

### Issue: "Cannot read property 'setCurrentField' of undefined"
**Solution**: Make sure component is wrapped in `<AICoPilotProvider>`

### Issue: Sidebar not updating
**Solution**: Verify `protocolContext` prop is passed correctly

### Issue: Too many API calls
**Solution**: Check that debounce is working (800ms default)

### Issue: Suggestions not appearing
**Solution**: 
1. Check field value is > 3 characters
2. Verify backend is running
3. Check Perplexity API key is configured

### Issue: TypeScript errors
**Solution**: 
1. Import types correctly
2. Use `(value: string) => void` for onChange
3. Pass all required props

---

## Next Steps

1. **Test your implementation** with the checklist above
2. **Review ObjectivesEditor** (`src/components/protocol-builder/sections/ObjectivesEditor.tsx`) for reference
3. **Read the full guide** (`AI_COPILOT_IMPLEMENTATION_GUIDE.md`) for advanced features
4. **Check architecture** (`AI_COPILOT_ARCHITECTURE.md`) for system overview

---

## Need Help?

- **Reference Implementation**: `src/components/protocol-builder/sections/ObjectivesEditor.tsx`
- **Full Documentation**: `AI_COPILOT_IMPLEMENTATION_GUIDE.md`
- **Architecture Overview**: `AI_COPILOT_ARCHITECTURE.md`
- **Component Source**: `src/components/ai/` directory

Happy coding! 🚀
