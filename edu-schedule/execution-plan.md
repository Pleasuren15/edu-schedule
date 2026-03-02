# TimeGrid Migration: Static to React Application

## Execution Plan

**Objective**: Convert the existing static HTML/CSS/JS timetable generator to a React application while preserving all functionality and visual appearance.

**Target**: A component-based React application that functions identically to the current static version.

---

## Phase 1: Project Setup

### 1.1 Initialize React Project

| Step | Task | Description |
|------|------|-------------|
| 1.1.1 | Create Vite Project | Initialize with `npm create vite@latest timegrid-react -- --template react` |
| 1.1.2 | Install Dependencies | Add required packages for state management, routing, and utilities |
| 1.1.3 | Configure Project | Set up ESLint, Prettier, and project structure |

### 1.2 Required Dependencies

```bash
# Core dependencies
npm install react react-dom

# State management (choose one approach)
# Option A: Built-in React hooks (recommended for this app size)
# Option B: Zustand - lightweight state management
npm install zustand

# Export functionality
npm install html2canvas jspdf

# Utilities
npm install date-fns clsx
```

### 1.3 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── Timetable/
│   │   ├── TimetableGrid.jsx
│   │   ├── TimeColumn.jsx
│   │   ├── DayColumn.jsx
│   │   ├── TimetableCell.jsx
│   │   └── TimetableEntry.jsx
│   ├── EntryForm/
│   │   ├── EntryForm.jsx
│   │   ├── ColorPicker.jsx
│   │   └── EntryList.jsx
│   ├── Statistics/
│   │   └── Statistics.jsx
│   ├── Modal/
│   │   └── MobileModal.jsx
│   ├── Common/
│   │   ├── Button.jsx
│   │   ├── Select.jsx
│   │   ├── Input.jsx
│   │   └── Notification.jsx
│   └── Export/
│       ├── ExportMenu.jsx
│       └── ImportMenu.jsx
├── hooks/
│   ├── useEntries.js
│   ├── useTheme.js
│   ├── useLocalStorage.js
│   └── useNotification.js
├── context/
│   ├── ThemeContext.jsx
│   └── EntriesContext.jsx
├── utils/
│   ├── timeUtils.js
│   ├── exportUtils.js
│   ├── importUtils.js
│   └── validation.js
├── constants/
│   ├── colors.js
│   ├── days.js
│   └── timeSlots.js
├── styles/
│   └── index.css (migrated from styles.css)
├── App.jsx
└── main.jsx
```

---

## Phase 2: Core Infrastructure

### 2.1 CSS Migration

| Step | Task | Description |
|------|------|-------------|
| 2.1.1 | Copy Base Styles | Copy `styles.css` to `src/styles/index.css` |
| 2.1.2 | Add React-specific Styles | Add component-scoped styles as needed |
| 2.1.3 | CSS Variables | Ensure all CSS custom properties work in React |

**Key CSS Variables to Preserve**:
- `--bg-primary`, `--bg-surface`, `--bg-elevated`
- `--accent-primary`, `--accent-secondary`
- `--text-primary`, `--text-secondary`
- `--border-color`, `--error-color`
- All responsive breakpoints

### 2.2 Context Setup

#### ThemeContext.jsx
- Provide `theme` state (`dark` | `light`)
- Provide `toggleTheme` function
- Persist to localStorage
- Sync with `data-theme` attribute on document root

#### EntriesContext.jsx
- Provide `entries` array state
- Provide CRUD operations: `addEntry`, `updateEntry`, `deleteEntry`, `clearAll`
- Persist to localStorage
- Provide `loadEntries`, `saveEntries` functions

### 2.3 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useEntries()` | Access entries context with all operations |
| `useTheme()` | Access theme context |
| `useLocalStorage(key, initialValue)` | Generic localStorage sync |
| `useNotification()` | Show/clear notifications |

---

## Phase 3: Component Migration

### 3.1 Layout Components

#### Navbar.jsx
- Display logo "TimeGrid" with gradient effect
- Show current time (updates every second)
- Theme toggle button with sun/moon icons

#### Footer.jsx
- Simple footer with "TimeGrid © 2026"

#### Layout.jsx
- Container wrapper
- Main content grid (controls panel + timetable)

### 3.2 Entry Form Components

#### EntryForm.jsx
| Feature | Implementation |
|---------|----------------|
| Subject input | Text input, max 30 chars, required |
| Day selector | Dropdown with all 7 days |
| Start/End time | Select dropdowns (12:00 - 23:59) |
| Color picker | 8 preset colors |
| Submit button | "Add Entry" / "Update Entry" |
| Clear all button | With confirmation dialog |

**Component Props**:
```jsx
<EntryForm 
  onSubmit={handleSubmit}
  editingEntry={entry}
  onCancelEdit={handleCancelEdit}
/>
```

#### ColorPicker.jsx
- Display 8 color swatches
- Support `selectedColor` state
- Emit `onColorSelect` callback
- Visual feedback for active color

#### EntryList.jsx
- Display all entries as cards
- Show color indicator, subject, day, time
- Edit and delete buttons per entry
- Empty state message when no entries

### 3.3 Timetable Components

#### TimetableGrid.jsx
- Main grid container
- Dynamic time range based on entries
- Renders TimeColumn + DayColumns

#### TimeColumn.jsx
- Time labels (12 PM - 11 PM)
- Responsive to dynamic time range

#### DayColumn.jsx (x7)
- Day header (Mon, Tue, Wed, etc.)
- Contains cells for each time slot

#### TimetableCell.jsx
- Individual time slot cell
- Handle drop zone events
- Click to pre-fill form

#### TimetableEntry.jsx
- Draggable entry display
- Shows subject name and time
- Background color from entry
- Drag start/end handlers

### 3.4 Statistics Component

#### Statistics.jsx
- Card grid: Total Entries, Total Hours, Days Used, Busiest Day
- Real-time calculation from entries
- Empty state shows "-"

### 3.5 Modal Components

#### MobileModal.jsx
- Overlay modal for mobile "Add Entry"
- Same form as desktop
- Close on cancel or successful submit

### 3.6 Export/Import Components

#### ExportMenu.jsx
- Dropdown menu
- Options: CSV, JSON, XLSX, HTML, ICS, PNG, PDF
- Button to trigger download

#### ImportMenu.jsx
- Dropdown menu
- Options: CSV, JSON, XLSX, HTML, ICS
- File input trigger

---

## Phase 4: Utility Functions

### 4.1 Time Utilities (timeUtils.js)

| Function | Purpose |
|----------|---------|
| `formatTime12Hour(time24)` | Convert "14:30" to "2:30 PM" |
| `timeToDecimal(time24)` | Convert to numeric for calculations |
| `formatHour(hour)` | Format hour for display |
| `formatTimeParts(hours, minutes)` | Format to "HH:MM" |

### 4.2 Export Utilities (exportUtils.js)

| Function | Format |
|----------|--------|
| `exportToCSV(entries)` | CSV file |
| `exportToJSON(entries)` | JSON with metadata |
| `exportToXLSX(entries)` | HTML table as .xls |
| `exportToHTML(entries)` | Standalone HTML |
| `exportToICS(entries)` | iCalendar format |
| `exportToPNG(element)` | Canvas capture |
| `exportToPDF(element)` | PDF generation |

### 4.3 Import Utilities (importUtils.js)

| Function | Format |
|----------|--------|
| `parseJSON(content)` | Handle array or wrapped format |
| `parseCSV(content)` | Auto-detect delimiter |
| `parseHTML(content)` | Extract table rows |
| `parseICS(content)` | Parse VEVENT blocks |
| `normalizeDay(day)` | Standardize day names |
| `normalizeTime(time)` | Parse multiple time formats |

### 4.4 Validation (validation.js)

| Function | Purpose |
|----------|---------|
| `validateEntry(entry)` | Check required fields |
| `validateTimeRange(start, end)` | Ensure end > start |
| `validateImportedEntries(entries)` | Batch validation |

---

## Phase 5: Drag and Drop Implementation

### 5.1 Approach

Use HTML5 Drag and Drop API (no external library needed):

### 5.2 Implementation

```javascript
// Drag state
const [draggedEntry, setDraggedEntry] = useState(null);

// onDragStart - set dragged entry
// onDragOver - allow drop
// onDrop - update entry day/time

// Handle drop logic:
// 1. Calculate new time from cell position
// 2. Check for conflicts
// 3. Update entry or show error
```

---

## Phase 6: Responsive Implementation

### 6.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, modal for form |
| Tablet | 768px - 1024px | Two columns, compact grid |
| Desktop | > 1024px | Full layout |

### 6.2 Mobile Considerations

- Hide desktop form, show floating "+" button
- Open modal on button click
- Horizontal scroll for timetable

---

## Phase 7: Testing Strategy

### 7.1 Manual Testing Checklist

| Category | Test Case |
|----------|-----------|
| Add Entry | Form submission with all fields |
| Edit Entry | Click edit, modify, save |
| Delete Entry | Single delete, clear all |
| Drag & Drop | Move entry to different day/time |
| Theme Toggle | Switch dark/light, verify persistence |
| Export | Test each format downloads correctly |
| Import | Test each format parses correctly |
| Persistence | Refresh page, verify data remains |
| Responsive | Test on mobile, tablet, desktop |

### 7.2 Component Testing (Optional)

Use Vitest for unit tests on utilities:
- Time formatting functions
- Validation functions
- Export/import parsers

---

## Phase 8: Verification

### 8.1 Visual Comparison Checklist

| Element | Verification |
|---------|-------------|
| Colors | All CSS variables match original |
| Typography | Outfit font, correct sizes |
| Layout | Grid, spacing identical |
| Animations | Fade in, slide in preserved |
| Icons | All icons8 images working |

### 8.2 Functional Verification

| Feature | Test |
|---------|------|
| Add entry | Form submits, entry appears in list and grid |
| Edit entry | Edit button populates form, update works |
| Delete entry | Entry removed from list and grid |
| Drag & drop | Entry moves to new day/time |
| Export | All 7 formats download correctly |
| Import | All 5 formats parse correctly |
| Theme | Toggles and persists |
| Statistics | Updates correctly on changes |

---

## Execution Order

```
Phase 1: Project Setup
  → 1.1 Initialize Vite + React
  → 1.2 Install dependencies
  → 1.3 Create folder structure

Phase 2: Core Infrastructure
  → 2.1 CSS Migration
  → 2.2 Context Setup
  → 2.3 Custom Hooks

Phase 3: Components (in order)
  → 3.1 Layout Components
  → 3.2 Entry Form Components
  → 3.3 Timetable Components
  → 3.4 Statistics Component
  → 3.5 Modal Components
  → 3.6 Export/Import Components

Phase 4: Utility Functions
  → 4.1 Time Utilities
  → 4.2 Export Utilities
  → 4.3 Import Utilities
  → 4.4 Validation

Phase 5: Drag and Drop

Phase 6: Responsive

Phase 7: Testing

Phase 8: Verification
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing functionality | Maintain feature parity checklist |
| Visual differences | Side-by-side comparison |
| Drag & drop issues | Use native HTML5 API |
| Export libraries | Use same CDN versions as original |
| State management | Use Context API (simple, built-in) |

---

## Notes for Developer

1. **Start Simple**: Begin with basic layout and form, then add complexity
2. **Feature Parity**: Check each feature works before moving on
3. **Preserve CSS**: Copy styles exactly, add React-specific tweaks only if needed
4. **Test Often**: Check functionality after each major component
5. **Mobile First**: Test responsive behavior early and often

---

## Reference Files

- Original HTML: `/index.html`
- Original CSS: `/styles.css`
- Original JS: `/script.js`
- Specification: `/SPEC.md`
