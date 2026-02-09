# 🧪 Protocol Builder - Complete Test Flow

## ✅ Servers Status

**Backend**: http://localhost:3001 - ✅ RUNNING
**Frontend**: http://localhost:5173 - ✅ RUNNING

## 📋 Test Checklist

### 1. Navigate to Protocols Page
**URL**: http://localhost:5173/protocols

**Expected**:
- Beautiful gradient background
- Stats dashboard showing:
  - Total Protocols: 3
  - Ready for Review: 0
  - In Progress: 1
  - Draft: 2
- 3 protocol cards in grid
- Each card shows:
  - Protocol ID badge
  - Title
  - Phase, Indication, Version
  - Completeness progress bar
  - Last updated date
  - Hover effect (scale up, shadow)

**Test**: ✅ Click on "TEST-2026-001" (25% complete)

---

### 2. Protocol Builder Opens
**URL**: http://localhost:5173/protocols/87e4e51f-c568-45f2-9f41-e003fff16cff

**Expected Layout**:
```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  Section Nav    │   Main Content           │  Validation     │
│  (Left)         │   (Center)               │  (Right-Hidden) │
│  - 14 sections  │   - Header with circle   │                 │
│  - Gradient     │   - Metadata form        │                 │
│  - Active state │   - Large inputs         │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Expected Elements**:
- ✅ Left: 14 sections with gradient header
- ✅ Center: Circular progress (25%)
- ✅ Center: Protocol title and info
- ✅ Center: "Show Validation" button
- ✅ Center: Metadata form with 8 fields

**Test**: ✅ Check all elements are visible

---

### 3. Edit Metadata
**Action**: Change "Short Title" field

**Expected**:
- Input has large size (px-5 py-4)
- Focus ring appears (blue glow)
- "Unsaved changes" indicator appears (yellow dot)
- "Save Changes" button becomes enabled

**Test**: ✅ Type new short title

---

### 4. Save Changes
**Action**: Click "Save Changes" button

**Expected**:
- Button shows "Saving..." with spinner
- API call: `PUT /api/protocols/:id`
- Success response
- Button returns to "Save Changes"
- "Unsaved changes" disappears
- Form resets with new data

**Test**: ✅ Click save and verify

---

### 5. Show Validation Panel
**Action**: Click "Show Validation" button

**Expected**:
- Right panel slides in (w-96)
- Panel shows:
  - Header: "Protocol Validation"
  - "Validate Now" button
  - Message: "No validation results yet"

**Test**: ✅ Click "Show Validation"

---

### 6. Run Validation
**Action**: Click "Validate Now" button

**Expected**:
- Button shows "Validating..."
- Spinner appears
- API call: `POST /api/protocols/:id/validate`
- After 2-3 seconds:
  - 3 tabs appear (Overview, Issues, Sections)
  - Overview shows:
    - Completeness: 25%
    - Errors: X (red)
    - Warnings: Y (yellow)
  - Issues tab shows list of validation errors
  - Sections tab shows 14-section grid

**Test**: ✅ Click validate and check results

---

### 7. View Validation Issues
**Action**: Click "Issues" tab

**Expected**:
- List of validation issues
- Each issue card shows:
  - Severity badge (ERROR/WARNING)
  - Rule ID
  - Message
  - Suggestion with 💡
  - "Go to Section" button
- Color coding:
  - Red border for errors
  - Yellow border for warnings

**Test**: ✅ View all issues

---

### 8. View Section Status
**Action**: Click "Sections" tab

**Expected**:
- Grid of 14 sections
- Each section shows:
  - Status icon (✅/❌/⚠️/⏳)
  - Section number and title
  - Error/warning counts
- Color coding:
  - Green: Complete
  - Red: Has errors
  - Yellow: Has warnings
  - Gray: Incomplete

**Test**: ✅ View section grid

---

### 9. Navigate Sections
**Action**: Click different sections in left sidebar

**Expected**:
- Active section highlights with gradient
- URL changes to `/protocols/:id/section/:number`
- Content area shows section editor placeholder
- Smooth transition

**Test**: ✅ Click sections 1-14

---

### 10. Hide Validation
**Action**: Click "✓ Validation On" button

**Expected**:
- Right panel slides out
- Button text changes to "Show Validation"
- More space for main content

**Test**: ✅ Toggle validation panel

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth animations
- ✅ Beautiful UI
- ✅ Fast response times
- ✅ Correct data display
- ✅ Proper error handling

## 🐛 Known Issues to Check

1. ❌ Validation panel null errors - FIXED
2. ❌ Plain UI - FIXED
3. ❌ Missing navigation item - FIXED
4. ⚠️ Styles not loading - CHECK
5. ⚠️ Form validation - CHECK

## 📊 Performance Metrics

- Page load: < 2s
- API response: < 500ms
- Validation: < 3s
- Smooth 60fps animations

## 🔄 If Issues Found

1. Check browser console (F12)
2. Check Network tab for failed requests
3. Check backend logs
4. Clear cache and hard refresh (Ctrl+Shift+R)
5. Restart servers if needed

---

**Ready to test!** Open http://localhost:5173/protocols and follow the checklist above.
