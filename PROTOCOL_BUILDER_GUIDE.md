# Protocol Builder User Guide

## Overview

The Protocol Builder is a comprehensive tool for creating and managing ICH M11-compliant clinical trial protocols. It provides a structured interface with real-time validation and progress tracking.

## Getting Started

### Accessing the Protocol Builder

1. **View All Protocols**: Navigate to `/protocols`
2. **Open a Protocol**: Click on any protocol card
3. **Direct Access**: Use `/protocols/{protocol-id}` URL

## Interface Layout

The Protocol Builder uses a 3-column layout:

```
┌─────────────┬──────────────────────┬─────────────────┐
│   Section   │   Main Content       │   Validation    │
│   Nav       │   Area               │   Panel         │
│   (Left)    │   (Center)           │   (Right)       │
│             │                      │   [Collapsible] │
└─────────────┴──────────────────────┴─────────────────┘
```

### Left Sidebar - Section Navigation

- **14 ICH M11 Sections** displayed in order
- **Visual Indicators**:
  - ✓ Green checkmark = Section complete
  - ○ Gray circle = Section incomplete
  - * Red asterisk = Required section
  - Blue highlight = Currently active section

**Sections:**
1. Protocol Summary
2. Introduction
3. Trial Objectives and Estimands
4. Trial Design
5. Trial Population
6. Trial Intervention
7. Discontinuation
8. Trial Assessments
9. Adverse Events
10. Statistical Considerations
11. Trial Oversight
12. Appendices
13. Glossary
14. References

### Center Area - Main Content

**Header Bar:**
- Protocol title and identifier
- Completeness percentage (large number)
- "Show/Hide Validation" toggle button

**Content:**
- **Default View**: Protocol Metadata Form
- **Section View**: Section-specific editor (when clicking sidebar items)

### Right Sidebar - Validation Panel (Collapsible)

- **3 Tabs**:
  - Overview: Summary statistics and recent issues
  - Issues: All validation errors and warnings
  - Sections: Section-by-section status grid
- **Toggle**: Click header button to show/hide

## Protocol Metadata Form

### Required Fields (marked with *)

1. **Sponsor Protocol Identifier**
   - Unique identifier for the protocol
   - Example: `ABC-2024-001`

2. **Full Protocol Title**
   - Complete, descriptive title
   - Multi-line text area

3. **Protocol Version**
   - Version number
   - Example: `1.0`, `2.1`

4. **Protocol Date**
   - Date picker
   - Protocol effective date

### Optional Fields

5. **Short Title**
   - Abbreviated title for easy reference

6. **Trial Phase**
   - Dropdown: Phase I, II, III, IV, I/II, II/III

7. **Indication**
   - Medical condition being studied
   - Example: `Type 2 Diabetes Mellitus`

8. **Study Type**
   - Dropdown: Interventional, Observational, Expanded Access

### Form Features

- **Auto-save**: Changes saved when you click "Save Changes"
- **Unsaved Changes Indicator**: Yellow dot appears when form is modified
- **Validation**: Required fields show error messages if empty
- **Loading State**: Button shows "Saving..." during save

## Navigation

### Between Sections

1. Click any section in the left sidebar
2. URL updates to `/protocols/{id}/section/{number}`
3. Content area updates (section editor coming in Part 2)

### Back to Metadata

1. Click protocol title in header, or
2. Navigate to `/protocols/{id}` directly

### To Protocol List

1. Use browser back button, or
2. Navigate to `/protocols` directly

## Validation Integration

### Running Validation

1. Click "Show Validation" button in header
2. Validation panel appears on right
3. Click "Validate Now" button in panel
4. Results appear in 3 tabs

### Understanding Results

**Status Badges:**
- 🟢 Green: No issues, ready for review
- 🟡 Yellow: Warnings present, review recommended
- 🔴 Red: Errors present, must fix before submission

**Issue Types:**
- **Error**: Blocking issue, must be fixed
- **Warning**: Recommended improvement
- **Info**: Informational message

### Navigating to Issues

1. Click on any issue card
2. Automatically navigates to relevant section
3. Issue details shown in context

## Completeness Tracking

### Calculation

Completeness is calculated based on:
- Required metadata fields (25 points)
- Primary objectives (15 points)
- Eligibility criteria (15 points)
- Investigational product (15 points)
- Section completion (15 points)
- Secondary objectives (5 points)
- Other criteria (10 points)

**Total: 100 points**

### Status Levels

- **0-39%**: Draft
- **40-69%**: In Progress
- **70-89%**: Substantial Progress
- **90-100%**: Ready for Review

### Visual Indicators

- **Header**: Large percentage number
- **Protocol List**: Progress bar on each card
- **Validation Panel**: Completeness score in overview tab

## Keyboard Shortcuts (Coming Soon)

- `Ctrl/Cmd + S`: Save current section
- `Ctrl/Cmd + V`: Toggle validation panel
- `Ctrl/Cmd + K`: Quick section search
- `↑/↓`: Navigate between sections

## Tips & Best Practices

### 1. Start with Metadata
Complete the protocol metadata form first. This information is used throughout the protocol.

### 2. Follow M11 Order
Work through sections in order (1-14) for logical flow and dependency management.

### 3. Use Validation Early
Run validation frequently to catch issues early. Don't wait until the end.

### 4. Save Regularly
While auto-save is implemented, manually save important changes to be safe.

### 5. Review Completeness
Check completeness percentage regularly to track progress toward 100%.

### 6. Fix Errors First
Address red errors before yellow warnings. Errors block protocol finalization.

### 7. Use Short Title
Add a short title for easier identification in protocol lists.

## Troubleshooting

### Protocol Won't Load
- Check that backend is running on port 3001
- Verify protocol ID in URL is correct
- Check browser console for error messages

### Changes Not Saving
- Ensure you clicked "Save Changes" button
- Check network connection
- Verify backend is responding (check console)

### Validation Not Running
- Ensure protocol has been saved first
- Check that validation service is running
- Try refreshing the page

### Section Navigation Not Working
- Verify URL structure is correct
- Check that protocol has sections initialized
- Try refreshing the page

## API Endpoints Used

The Protocol Builder integrates with these backend endpoints:

- `GET /api/protocols` - List all protocols
- `GET /api/protocols/:id` - Get protocol details
- `PUT /api/protocols/:id` - Update protocol metadata
- `PUT /api/protocols/sections/:id` - Update section content
- `POST /api/protocols/:id/validate` - Run validation
- `GET /api/protocols/:id/validation/latest` - Get latest validation

## Coming in Part 2

- Rich text editor for section content
- Objectives management interface
- Eligibility criteria builder
- Interventions form
- Auto-save functionality
- Section templates
- Smart suggestions
- Keyboard shortcuts
- Export functionality

## Support

For issues or questions:
1. Check this guide first
2. Review Sprint 3 Part 1 Status document
3. Check backend API documentation
4. Review validation rules reference
