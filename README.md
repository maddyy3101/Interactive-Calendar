# Interactive Calendar

A responsive React + Vite wall calendar for planning date ranges, writing notes, and managing holidays.

## Full Feature List

### 1) Calendar Layout and Navigation
- Wall-calendar style month grid with weekday headers.
- Previous/next month controls.
- Month title opens a month picker modal.
- Month picker includes year navigation arrows.
- Year is clickable inside the picker to open a year picker view.
- Year picker shows paged year ranges (12 years at a time) with left/right navigation.
- Smooth animated transitions for month/year picker views.

### 2) Season-Based Visual Design
- Months are grouped by seasonal themes (winter, spring, summer, autumn).
- Each season shares a common hero image to maintain visual consistency.
- Month-specific accent colors differentiate months within the same season.
- This approach creates a cohesive and intentional visual experience without unnecessary visual noise.

### 3) Date Selection
- Single-day selection.
- Date-range selection (start and end).
- If the second clicked date is earlier than the first, the range is automatically corrected.
- Start and end dates use distinct visual markers.
- In-range dates are highlighted.

### 4) Notes System
- Notes can be added for the selected day or selected range.
- Note input is disabled until a selection exists.
- Notes are stored with `startDate`, `endDate`, and timestamp.
- Notes list is filtered by current selection overlap.
- Notes can be deleted.
- Empty-state message appears when no notes are available.

### 5) Clear Selection Action
- `Clear Selection` button is placed at the bottom-right of the notes panel.
- Button is highlighted/active only when a selection exists.
- Button is non-clickable when nothing is selected.

### 6) Holiday Data and Calendar Markers
- Includes a predefined holiday dataset (static data in-app).
- Supports holiday kinds: `national`, `festival`, and `custom`.
- Holiday dates show a marker inside date cells.
- Holiday marker coexists with selection/range visuals.
- Desktop hover shows holiday tooltip.
- Mobile tap fallback shows holiday label on the selected holiday day.

### 7) Holidays List in Notes Panel
- Notes panel includes `Holidays this month` section.
- Holidays are filtered by currently visible month and year.
- Empty-state message appears when no holidays exist for that month.
- Holiday cards are visually distinct from note cards.

### 8) Add Holiday
- `+ Add Holiday` button is placed at the bottom-left of notes panel.
- Button is enabled only when exactly one non-holiday day is selected.
- Add Holiday modal includes:
- Selected date (read-only).
- Holiday name input.
- Validation for empty names.
- Duplicate-date prevention.
- Saving immediately updates the calendar marker and monthly holidays list.

### 9) Edit Holiday
- Each holiday card has an edit action.
- Edit reuses the same modal as Add Holiday.
- Modal is prefilled with current holiday name.
- Date remains read-only during edit.
- Modal title/button change to `Edit Holiday` and `Update Holiday`.
- Update reflects instantly in calendar + holidays list.

### 10) Delete Holiday
- Each holiday card has a delete action.
- Delete opens a confirmation modal.
- Confirming delete removes holiday from calendar marker and monthly list.
- Works for both custom holidays and predefined holidays (with local persistence behavior).

### 11) Toast Notifications
- Toast feedback after holiday operations:
- `Holiday added successfully`
- `Holiday updated successfully`
- `Holiday deleted`
- Toast appears with animation and auto-dismisses.

### 12) Visual Theme System
- Month-based visual themes (hero image + accent palette).
- UI accents sync with the active month.
- Dynamic paper-like background texture outside calendar.

### 13) Light/Dim Theme Toggle
- Global toggle button at top-right.
- Icon changes based on mode (`🌙`/`☀️`).
- Theme preference is persisted in `localStorage` key `theme`.
- Dim mode keeps the same light-mode color identity, but applies low-light dimming (reduced brightness/contrast) instead of switching to a separate black/blue palette.
- Smooth transition when switching modes.

### 14) Modal and Keyboard UX
- Month/year picker modal supports click-outside close.
- Holiday add/edit modal supports click-outside close.
- Delete confirmation modal supports click-outside close.
- `Esc` key closes open picker/holiday modals.
- Arrow keys support picker navigation where applicable.

### 15) Animations and Motion
- Animated month image transitions.
- Animated date-cell appearance.
- Animated holiday card enter/exit.
- Animated modal open/close.
- Animated toast appearance/disappearance.

### 16) Responsive Behavior
- Desktop layout: split calendar and notes panels.
- Mobile layout: stacked calendar and notes sections.
- Spacing/sizing adjusted for smaller screens.

### 17) Local Persistence
Data saved in `localStorage`:
- Notes: `calendar-notes`
- Custom holidays: `calendar-custom-holidays`
- Edited predefined holiday names: `calendar-edited-holiday-names`
- Hidden/deleted predefined holiday dates: `calendar-hidden-holiday-dates`
- Theme mode: `theme`

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Motion (`motion/react`)
- date-fns
- lucide-react

## Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open the URL shown in terminal (usually `http://127.0.0.1:5173/`).

## Build for Production
```bash
npm run build
```
# Component Structure Note
- The core calendar logic is implemented in a single component for simplicity in this assignment. In a production setting, this would be modularized into smaller components (calendar grid, notes panel, modals) for better scalability and maintainability.