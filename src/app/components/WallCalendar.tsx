import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, StickyNote, Trash2, Calendar as CalendarIcon, X, Pencil } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

interface Note {
  id: string;
  text: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface MonthTheme {
  image: string;
  backgroundFrom: string;
  backgroundTo: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  noteBackground: string;
  noteBorder: string;
  noteMeta: string;
}

interface Holiday {
  date: string;
  name: string;
  kind: 'national' | 'festival' | 'custom';
}

interface ToastMessage {
  id: number;
  message: string;
}

const MONTH_THEMES: MonthTheme[] = [
  { image: 'https://images.unsplash.com/photo-1613144332655-8d04c63d635a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBzbm93JTIwbmF0dXJlJTIwc2NlbmV8ZW58MXx8fHwxNzc1NjU1ODUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#e8f3ff', backgroundTo: '#f8fcff', accent: '#60a5fa', accentSoft: '#dbeafe', accentStrong: '#2563eb', noteBackground: '#eff6ff', noteBorder: '#bfdbfe', noteMeta: '#1d4ed8' }, // January
  { image: 'https://images.unsplash.com/photo-1613144332655-8d04c63d635a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBzbm93JTIwbmF0dXJlJTIwc2NlbmV8ZW58MXx8fHwxNzc1NjU1ODUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#fde7f3', backgroundTo: '#fff4fa', accent: '#f472b6', accentSoft: '#fce7f3', accentStrong: '#db2777', noteBackground: '#fff1f8', noteBorder: '#f9a8d4', noteMeta: '#be185d' }, // February
  { image: 'https://images.unsplash.com/photo-1758895330267-f781c056bb5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHNwcmluZ3xlbnwxfHx8fDE3NzU2NTU4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#eafaf0', backgroundTo: '#f6fff9', accent: '#4ade80', accentSoft: '#dcfce7', accentStrong: '#16a34a', noteBackground: '#ecfdf3', noteBorder: '#86efac', noteMeta: '#15803d' }, // March
  { image: 'https://images.unsplash.com/photo-1758895330267-f781c056bb5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHNwcmluZ3xlbnwxfHx8fDE3NzU2NTU4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#e8faf5', backgroundTo: '#f7fffc', accent: '#34d399', accentSoft: '#d1fae5', accentStrong: '#059669', noteBackground: '#ecfdf5', noteBorder: '#6ee7b7', noteMeta: '#047857' }, // April
  { image: 'https://images.unsplash.com/photo-1758895330267-f781c056bb5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHNwcmluZ3xlbnwxfHx8fDE3NzU2NTU4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#e8fbf8', backgroundTo: '#f6fffe', accent: '#2dd4bf', accentSoft: '#ccfbf1', accentStrong: '#0f766e', noteBackground: '#f0fdfa', noteBorder: '#99f6e4', noteMeta: '#0f766e' }, // May
  { image: 'https://images.unsplash.com/photo-1774245145962-91203112d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHN1bW1lciUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc3NTY1NTg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#fff7e6', backgroundTo: '#fffcf2', accent: '#fbbf24', accentSoft: '#fef3c7', accentStrong: '#d97706', noteBackground: '#fffbeb', noteBorder: '#fcd34d', noteMeta: '#b45309' }, // June
  { image: 'https://images.unsplash.com/photo-1774245145962-91203112d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHN1bW1lciUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc3NTY1NTg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#fff2e7', backgroundTo: '#fffaf5', accent: '#fb923c', accentSoft: '#ffedd5', accentStrong: '#ea580c', noteBackground: '#fff7ed', noteBorder: '#fdba74', noteMeta: '#c2410c' }, // July
  { image: 'https://images.unsplash.com/photo-1774245145962-91203112d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHN1bW1lciUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc3NTY1NTg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#fff9db', backgroundTo: '#fffef3', accent: '#eab308', accentSoft: '#fef9c3', accentStrong: '#ca8a04', noteBackground: '#fefce8', noteBorder: '#fde047', noteMeta: '#a16207' }, // August
  { image: 'https://images.unsplash.com/photo-1697166464671-99defdc11743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBmb3Jlc3QlMjBjb2xvcmZ1bCUyMGxlYXZlc3xlbnwxfHx8fDE3NzU2NTU4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#ffecec', backgroundTo: '#fff8f8', accent: '#f87171', accentSoft: '#fee2e2', accentStrong: '#dc2626', noteBackground: '#fef2f2', noteBorder: '#fca5a5', noteMeta: '#b91c1c' }, // September
  { image: 'https://images.unsplash.com/photo-1697166464671-99defdc11743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBmb3Jlc3QlMjBjb2xvcmZ1bCUyMGxlYXZlc3xlbnwxfHx8fDE3NzU2NTU4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#ffeef5', backgroundTo: '#fff8fb', accent: '#fb7185', accentSoft: '#ffe4e6', accentStrong: '#e11d48', noteBackground: '#fff1f2', noteBorder: '#fda4af', noteMeta: '#be123c' }, // October
  { image: 'https://images.unsplash.com/photo-1697166464671-99defdc11743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBmb3Jlc3QlMjBjb2xvcmZ1bCUyMGxlYXZlc3xlbnwxfHx8fDE3NzU2NTU4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#edf2f7', backgroundTo: '#f9fbfd', accent: '#94a3b8', accentSoft: '#e2e8f0', accentStrong: '#475569', noteBackground: '#f8fafc', noteBorder: '#cbd5e1', noteMeta: '#334155' }, // November
  { image: 'https://images.unsplash.com/photo-1613144332655-8d04c63d635a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBzbm93JTIwbmF0dXJlJTIwc2NlbmV8ZW58MXx8fHwxNzc1NjU1ODUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', backgroundFrom: '#ecefff', backgroundTo: '#f9faff', accent: '#818cf8', accentSoft: '#e0e7ff', accentStrong: '#4f46e5', noteBackground: '#eef2ff', noteBorder: '#a5b4fc', noteMeta: '#3730a3' }, // December
];

type PickerMode = 'month' | 'year';
type ThemeMode = 'light' | 'dark';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEAR_PAGE_SIZE = 12;
const HOLIDAYS: Holiday[] = [
  { date: '2025-01-01', name: "New Year's Day", kind: 'national' },
  { date: '2025-01-14', name: 'Pongal', kind: 'festival' },
  { date: '2025-01-26', name: 'Republic Day', kind: 'national' },
  { date: '2025-08-15', name: 'Independence Day', kind: 'national' },
  { date: '2025-10-20', name: 'Diwali', kind: 'festival' },
  { date: '2026-01-01', name: "New Year's Day", kind: 'national' },
  { date: '2026-01-14', name: 'Pongal', kind: 'festival' },
  { date: '2026-01-26', name: 'Republic Day', kind: 'national' },
  { date: '2026-08-15', name: 'Independence Day', kind: 'national' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', kind: 'national' },
  { date: '2026-11-12', name: 'Diwali', kind: 'festival' },
  { date: '2027-01-01', name: "New Year's Day", kind: 'national' },
  { date: '2027-01-14', name: 'Pongal', kind: 'festival' },
  { date: '2027-01-26', name: 'Republic Day', kind: 'national' },
  { date: '2027-08-15', name: 'Independence Day', kind: 'national' },
  { date: '2027-10-29', name: 'Diwali', kind: 'festival' },
];
const HOLIDAY_DOT_COLOR: Record<Holiday['kind'], string> = {
  national: '#ef4444',
  festival: '#ef4444',
  custom: '#ef4444',
};
const HOLIDAY_TINT_COLOR: Record<Holiday['kind'], string> = {
  national: 'rgba(239, 68, 68, 0.1)',
  festival: 'rgba(239, 68, 68, 0.1)',
  custom: 'rgba(239, 68, 68, 0.1)',
};
const HOLIDAY_BORDER_COLOR: Record<Holiday['kind'], string> = {
  national: 'rgba(239, 68, 68, 0.35)',
  festival: 'rgba(239, 68, 68, 0.35)',
  custom: 'rgba(239, 68, 68, 0.35)',
};

export function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [direction, setDirection] = useState(0);
  const [activePicker, setActivePicker] = useState<PickerMode | null>(null);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - Math.floor(YEAR_PAGE_SIZE / 2));
  const [pickerTransitionDirection, setPickerTransitionDirection] = useState(0);
  const [yearRangeDirection, setYearRangeDirection] = useState(0);
  const [activeHolidayDate, setActiveHolidayDate] = useState<string | null>(null);
  const [customHolidays, setCustomHolidays] = useState<Holiday[]>([]);
  const [editedBaseHolidayNames, setEditedBaseHolidayNames] = useState<Record<string, string>>({});
  const [hiddenBaseHolidayDates, setHiddenBaseHolidayDates] = useState<string[]>([]);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [holidayModalMode, setHolidayModalMode] = useState<'add' | 'edit'>('add');
  const [holidayModalDate, setHolidayModalDate] = useState<string | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [holidayFormError, setHolidayFormError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  // Restore saved notes on first load.
  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar-notes');
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      setNotes(parsed.map((note: any) => ({
        ...note,
        startDate: new Date(note.startDate),
        endDate: new Date(note.endDate),
        createdAt: new Date(note.createdAt),
      })));
    }
  }, []);

  // Keep notes persisted across refreshes.
  useEffect(() => {
    localStorage.setItem('calendar-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const savedHolidays = localStorage.getItem('calendar-custom-holidays');
    if (!savedHolidays) return;

    try {
      const parsed = JSON.parse(savedHolidays);
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed
        .filter((item) => item && typeof item.date === 'string' && typeof item.name === 'string')
        .map((item) => ({
          date: item.date,
          name: item.name,
          kind: 'custom' as const,
        }));
      setCustomHolidays(sanitized);
    } catch {
      // Skip bad saved data instead of breaking the calendar.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-custom-holidays', JSON.stringify(customHolidays));
  }, [customHolidays]);

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
    const themeClassName = `${themeMode}-theme`;
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(themeClassName);
  }, [themeMode]);

  useEffect(() => {
    const savedEdits = localStorage.getItem('calendar-edited-holiday-names');
    if (!savedEdits) return;

    try {
      const parsed = JSON.parse(savedEdits);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
      const sanitized = Object.entries(parsed).reduce<Record<string, string>>((accumulator, [date, name]) => {
        if (typeof date === 'string' && typeof name === 'string' && name.trim()) {
          accumulator[date] = name;
        }
        return accumulator;
      }, {});
      setEditedBaseHolidayNames(sanitized);
    } catch {
      // Skip bad saved data instead of breaking the calendar.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-edited-holiday-names', JSON.stringify(editedBaseHolidayNames));
  }, [editedBaseHolidayNames]);

  useEffect(() => {
    const savedHiddenDates = localStorage.getItem('calendar-hidden-holiday-dates');
    if (!savedHiddenDates) return;

    try {
      const parsed = JSON.parse(savedHiddenDates);
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed.filter((item) => typeof item === 'string');
      setHiddenBaseHolidayDates(sanitized);
    } catch {
      // Skip bad saved data instead of breaking the calendar.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-hidden-holiday-dates', JSON.stringify(hiddenBaseHolidayDates));
  }, [hiddenBaseHolidayDates]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeksInView = days.length / 7;
  const currentYear = currentDate.getFullYear();
  const currentMonthKey = format(currentDate, 'yyyy-MM');
  const yearRange = Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearRangeStart + index);

  const currentTheme = MONTH_THEMES[currentDate.getMonth()];
  const isDarkTheme = themeMode === 'dark';
  const baseHolidays = useMemo(
    () =>
      HOLIDAYS
        .filter((holiday) => !hiddenBaseHolidayDates.includes(holiday.date))
        .map((holiday) =>
          editedBaseHolidayNames[holiday.date]
            ? {
                ...holiday,
                name: editedBaseHolidayNames[holiday.date],
              }
            : holiday
        ),
    [editedBaseHolidayNames, hiddenBaseHolidayDates]
  );
  const allHolidays = useMemo(() => [...baseHolidays, ...customHolidays], [baseHolidays, customHolidays]);
  const holidaysByDate = useMemo(
    () =>
      allHolidays.reduce<Record<string, Holiday>>((accumulator, holiday) => {
        accumulator[holiday.date] = holiday;
        return accumulator;
      }, {}),
    [allHolidays]
  );
  const monthlyHolidays = useMemo(
    () =>
      allHolidays.filter((holiday) => holiday.date.startsWith(currentMonthKey)).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    [allHolidays, currentMonthKey]
  );
  const hasSelection = Boolean(selectedStart);
  const isSingleDaySelection = Boolean(selectedStart && (!selectedEnd || isSameDay(selectedStart, selectedEnd)));
  const selectedSingleDate = isSingleDaySelection ? selectedStart : null;
  const selectedSingleDateKey = selectedSingleDate ? format(selectedSingleDate, 'yyyy-MM-dd') : null;
  const selectedDateAlreadyHoliday = selectedSingleDateKey ? Boolean(holidaysByDate[selectedSingleDateKey]) : false;
  const canOpenAddHoliday = Boolean(selectedSingleDateKey && !selectedDateAlreadyHoliday);
  const isEditingHoliday = holidayModalMode === 'edit';
  const holidayModalDateValue = holidayModalDate
    ? (() => {
        const [year, month, day] = holidayModalDate.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
      })()
    : null;
  const canSubmitHolidayModal = Boolean(
    newHolidayName.trim() &&
      holidayModalDate &&
      (isEditingHoliday || !holidaysByDate[holidayModalDate])
  );
  const canAddNote = Boolean(noteText.trim() && selectedStart);
  const appThemeStyles = {
    '--app-bg-from': currentTheme.backgroundFrom,
    '--app-bg-to': currentTheme.backgroundTo,
    '--app-surface': '#ffffff',
    '--app-surface-border': 'rgba(148, 163, 184, 0.24)',
    '--app-shadow': '0 18px 40px rgba(15, 23, 42, 0.18)',
    '--app-toggle-bg': 'rgba(255, 255, 255, 0.92)',
    '--app-toggle-border': 'rgba(148, 163, 184, 0.38)',
    '--app-toggle-color': '#334155',
    '--app-secondary-btn-disabled-bg': '#f1f5f9',
    '--app-secondary-btn-disabled-text': '#64748b',
    '--app-secondary-btn-enabled-bg': '#ffffff',
    '--app-clear-disabled-bg': '#e2e8f0',
    '--app-modal-overlay': 'rgba(15, 23, 42, 0.35)',
    '--app-toast-bg': 'rgba(15, 23, 42, 0.95)',
    '--app-toast-text': '#f8fafc',
    '--app-global-filter': isDarkTheme ? 'brightness(0.87) saturate(0.9)' : 'brightness(1) saturate(1)',
    '--app-dim-overlay': isDarkTheme ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0)',
  } as CSSProperties;
  const themeStyles = {
    '--calendar-bg-from': currentTheme.backgroundFrom,
    '--calendar-bg-to': currentTheme.backgroundTo,
    '--calendar-accent': currentTheme.accent,
    '--calendar-accent-soft': currentTheme.accentSoft,
    '--calendar-accent-strong': currentTheme.accentStrong,
    '--calendar-note-bg': currentTheme.noteBackground,
    '--calendar-note-border': currentTheme.noteBorder,
    '--calendar-note-meta': currentTheme.noteMeta,
  } as CSSProperties;
  const paperTexturePrimary: CSSProperties = {
    backgroundImage: `
      radial-gradient(circle at 20% 18%, rgba(255,255,255,0.38), rgba(255,255,255,0) 42%),
      radial-gradient(circle at 82% 6%, rgba(0,0,0,0.05), rgba(0,0,0,0) 38%),
      repeating-linear-gradient(0deg, rgba(78, 62, 46, 0.045) 0px, rgba(78, 62, 46, 0.045) 1px, transparent 1px, transparent 4px),
      repeating-linear-gradient(90deg, rgba(78, 62, 46, 0.03) 0px, rgba(78, 62, 46, 0.03) 1px, transparent 1px, transparent 5px),
      repeating-radial-gradient(circle at 0 0, rgba(0,0,0,0.032) 0px, rgba(0,0,0,0.032) 0.7px, transparent 0.8px, transparent 3px)
    `,
    backgroundSize: '100% 100%, 100% 100%, 220px 220px, 180px 180px, 5px 5px',
  };
  const paperTextureSecondary: CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(18deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 8px),
      repeating-linear-gradient(-24deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 10px)
    `,
    backgroundSize: '260px 260px, 320px 320px',
  };

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openPicker = (mode: PickerMode) => {
    setPickerYear(currentYear);
    setYearRangeStart(currentYear - Math.floor(YEAR_PAGE_SIZE / 2));
    setPickerTransitionDirection(0);
    setYearRangeDirection(0);
    setActivePicker(mode);
  };

  const stepPickerYear = (delta: number) => {
    setPickerTransitionDirection(delta);
    setPickerYear((previousYear) => previousYear + delta);
  };

  const stepYearRange = (delta: number) => {
    setYearRangeDirection(delta);
    setYearRangeStart((previousStart) => previousStart + (delta * YEAR_PAGE_SIZE));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const selectedDate = new Date(pickerYear, monthIndex, 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    if (selectedDate.getTime() === currentMonthStart.getTime()) {
      setActivePicker(null);
      return;
    }
    setDirection(selectedDate > currentMonthStart ? 1 : -1);
    setCurrentDate(selectedDate);
    setActivePicker(null);
  };

  const handleYearSelect = (year: number) => {
    setPickerYear(year);
    setPickerTransitionDirection(-1);
    setActivePicker('month');
  };

  const handleDayClick = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    if (holidaysByDate[dayKey]) {
      setActiveHolidayDate((current) => (current === dayKey ? null : dayKey));
    } else {
      setActiveHolidayDate(null);
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else {
      if (day < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(day);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  const isDayInRange = (day: Date) => {
    if (!selectedStart) return false;
    if (!selectedEnd) return isSameDay(day, selectedStart);
    return isWithinInterval(day, { start: selectedStart, end: selectedEnd });
  };

  const isStartDate = (day: Date) => {
    return selectedStart && isSameDay(day, selectedStart);
  };

  const isEndDate = (day: Date) => {
    return selectedEnd && isSameDay(day, selectedEnd);
  };

  const addNote = () => {
    if (!noteText.trim() || !selectedStart) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText,
      startDate: selectedStart,
      endDate: selectedEnd || selectedStart,
      createdAt: new Date(),
    };
    
    setNotes([...notes, newNote]);
    setNoteText('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const clearSelection = () => {
    if (!hasSelection) return;
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const showToast = (message: string) => {
    setToast({
      id: Date.now(),
      message,
    });
  };

  const openAddHolidayModal = () => {
    if (!selectedSingleDateKey || !canOpenAddHoliday) return;
    setHolidayModalMode('add');
    setHolidayModalDate(selectedSingleDateKey);
    setNewHolidayName('');
    setHolidayFormError('');
    setIsAddHolidayModalOpen(true);
  };

  const openEditHolidayModal = (holiday: Holiday) => {
    setHolidayModalMode('edit');
    setHolidayModalDate(holiday.date);
    setNewHolidayName(holiday.name);
    setHolidayFormError('');
    setIsAddHolidayModalOpen(true);
  };

  const openHolidayDeleteDialog = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
  };

  const closeHolidayModal = () => {
    setIsAddHolidayModalOpen(false);
    setHolidayFormError('');
    setNewHolidayName('');
    setHolidayModalDate(null);
  };

  const handleSaveHoliday = () => {
    if (!holidayModalDate) return;
    const dateKey = holidayModalDate;
    const holidayName = newHolidayName.trim();

    if (!holidayName) {
      setHolidayFormError('Please enter a holiday name.');
      return;
    }

    if (!isEditingHoliday && holidaysByDate[holidayModalDate]) {
      setHolidayFormError('A holiday already exists for this date.');
      return;
    }

    if (isEditingHoliday) {
      const holidayToEdit = holidaysByDate[dateKey];
      if (!holidayToEdit) {
        setHolidayFormError('Could not find the selected holiday.');
        return;
      }

      if (holidayToEdit.kind === 'custom') {
        setCustomHolidays((previous) =>
          previous.map((holiday) =>
            holiday.date === dateKey
              ? {
                  ...holiday,
                  name: holidayName,
                }
              : holiday
          )
        );
      } else {
        setEditedBaseHolidayNames((previous) => ({
          ...previous,
          [dateKey]: holidayName,
        }));
      }
      showToast('Holiday updated successfully');
    } else {
      setCustomHolidays((previous) => [
        ...previous,
        {
          date: dateKey,
          name: holidayName,
          kind: 'custom',
        },
      ]);
      showToast('Holiday added successfully');
    }

    closeHolidayModal();
    setActiveHolidayDate(dateKey);
  };

  const handleDeleteHoliday = () => {
    if (!holidayToDelete) return;

    if (holidayToDelete.kind === 'custom') {
      setCustomHolidays((previous) => previous.filter((holiday) => holiday.date !== holidayToDelete.date));
    } else {
      setHiddenBaseHolidayDates((previous) =>
        previous.includes(holidayToDelete.date) ? previous : [...previous, holidayToDelete.date]
      );
      setEditedBaseHolidayNames((previous) => {
        if (!(holidayToDelete.date in previous)) return previous;
        const next = { ...previous };
        delete next[holidayToDelete.date];
        return next;
      });
    }

    if (isAddHolidayModalOpen && holidayModalDate === holidayToDelete.date) {
      closeHolidayModal();
    }

    setActiveHolidayDate((current) => (current === holidayToDelete.date ? null : current));
    setHolidayToDelete(null);
    showToast('Holiday deleted');
  };

  const getNotesForRange = () => {
    if (!selectedStart) return notes;
    return notes.filter(note => {
      const noteStart = note.startDate;
      const noteEnd = note.endDate;
      if (!selectedEnd) {
        return isSameDay(noteStart, selectedStart) || isSameDay(noteEnd, selectedStart);
      }
      return (
        isWithinInterval(noteStart, { start: selectedStart, end: selectedEnd }) ||
        isWithinInterval(noteEnd, { start: selectedStart, end: selectedEnd }) ||
        (noteStart <= selectedStart && noteEnd >= selectedEnd)
      );
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const getDayButtonStyle = (
    inRange: boolean,
    isStart: boolean | null,
    isEnd: boolean | null,
    isToday: boolean
  ): CSSProperties => {
    const styles: CSSProperties = {};

    if (inRange && !isStart && !isEnd) {
      styles.backgroundColor = 'var(--calendar-accent-soft)';
    }

    if (isStart || isEnd) {
      styles.backgroundColor = 'var(--calendar-accent-strong)';
      styles.color = '#ffffff';
    }

    if (isToday && !inRange) {
      styles.boxShadow = 'inset 0 0 0 2px var(--calendar-accent)';
    }

    return styles;
  };

  const formatHolidayDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return format(new Date(year, month - 1, day), 'MMM d');
  };

  const renderMonthlyHolidaySection = (compact = false) => (
    <div className="mt-4 mb-14 shrink-0">
      <h3 className={`${compact ? 'text-sm' : 'text-base'} mb-2 text-slate-700 font-medium`}>
        Holidays this month
      </h3>
      <div className={`space-y-2 ${compact ? 'max-h-28' : 'max-h-36'} overflow-y-auto pr-1`}>
        {monthlyHolidays.length === 0 ? (
          <p className="text-slate-400 text-center py-3 text-sm">
            No holidays this month
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {monthlyHolidays.map((holiday) => (
              <motion.div
                key={`${holiday.date}-${holiday.name}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="relative border rounded-lg p-3 pr-16"
                style={{
                  backgroundColor: HOLIDAY_TINT_COLOR[holiday.kind],
                  borderColor: HOLIDAY_BORDER_COLOR[holiday.kind],
                }}
              >
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditHolidayModal(holiday)}
                    className="rounded-md p-1 text-slate-500 hover:bg-white/70 hover:text-slate-700 transition-colors"
                    aria-label={`Edit holiday ${holiday.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openHolidayDeleteDialog(holiday)}
                    className="rounded-md p-1 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label={`Delete holiday ${holiday.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-xs text-slate-600 mb-1">{formatHolidayDate(holiday.date)}</div>
                <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>{holiday.name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (!activePicker) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePicker(null);
        return;
      }

      if (event.key === 'ArrowLeft') {
        if (activePicker === 'month') {
          stepPickerYear(-1);
        } else {
          stepYearRange(-1);
        }
        return;
      }

      if (event.key === 'ArrowRight') {
        if (activePicker === 'month') {
          stepPickerYear(1);
        } else {
          stepYearRange(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePicker]);

  useEffect(() => {
    setActiveHolidayDate(null);
  }, [currentDate]);

  useEffect(() => {
    if (!isAddHolidayModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHolidayModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddHolidayModalOpen]);

  useEffect(() => {
    if (
      isAddHolidayModalOpen &&
      holidayModalMode === 'add' &&
      (!holidayModalDate || Boolean(holidaysByDate[holidayModalDate]))
    ) {
      closeHolidayModal();
    }
  }, [holidayModalDate, holidayModalMode, holidaysByDate, isAddHolidayModalOpen]);

  useEffect(() => {
    if (!holidayToDelete) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHolidayToDelete(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [holidayToDelete]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => {
        if (!currentToast || currentToast.id !== toast.id) return currentToast;
        return null;
      });
    }, 2600);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  return (
    <div
      className={`calendar-shell ${themeMode}-theme relative min-h-screen overflow-hidden p-4 md:p-6 lg:h-screen lg:p-8 transition-all duration-300`}
      style={{
        ...appThemeStyles,
        ...themeStyles,
        filter: 'var(--app-global-filter)',
        backgroundImage: 'linear-gradient(135deg, var(--app-bg-from), var(--app-bg-to))',
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-45 mix-blend-multiply"
        style={paperTexturePrimary}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 z-0 opacity-25 mix-blend-soft-light"
        style={paperTextureSecondary}
        animate={{ x: [0, -18, 10, 0], y: [0, 12, -8, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
        style={{ backgroundColor: 'var(--app-dim-overlay)' }}
      />

      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6 lg:right-8 lg:top-8">
        <motion.button
          type="button"
          onClick={() => setThemeMode((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'))}
          whileTap={{ scale: 0.94 }}
          className="rounded-full border px-3 py-2 text-lg leading-none shadow-lg hover:scale-105 transition"
          style={{
            backgroundColor: 'var(--app-toggle-bg)',
            borderColor: 'var(--app-toggle-border)',
            color: 'var(--app-toggle-color)',
          }}
          title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </motion.button>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl lg:h-full">
        <div className="hidden lg:grid lg:h-full lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border shadow-2xl overflow-hidden h-full flex flex-col"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                boxShadow: 'var(--app-shadow)',
              }}
            >
              <div className="relative h-44 xl:h-52 overflow-hidden shrink-0">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={currentDate.getMonth()}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    src={currentTheme.image}
                    alt={format(currentDate, 'MMMM yyyy')}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 xl:p-6 text-white">
                  <button
                    type="button"
                    onClick={() => openPicker('month')}
                    className="text-left group rounded-md px-2 -mx-2 hover:bg-black/20 transition-colors"
                    aria-label="Open month picker"
                  >
                    <motion.h1
                      key={format(currentDate, 'MMMM yyyy')}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl xl:text-5xl mb-1 group-hover:opacity-90 transition-opacity"
                    >
                      {format(currentDate, 'MMMM')}
                    </motion.h1>
                  </button>
                  <p className="text-xl xl:text-2xl opacity-90">{format(currentDate, 'yyyy')}</p>
                </div>
              </div>

              <div className="p-4 xl:p-6 flex flex-1 flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    style={{ color: 'var(--calendar-accent-strong)' }}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon className="w-5 h-5" style={{ color: 'var(--calendar-accent-strong)' }} />
                    <span className="text-sm">
                      {selectedStart && selectedEnd
                        ? `${format(selectedStart, 'MMM d')} - ${format(selectedEnd, 'MMM d')}`
                        : selectedStart
                        ? format(selectedStart, 'MMMM d, yyyy')
                        : 'Select a date range'}
                    </span>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    style={{ color: 'var(--calendar-accent-strong)' }}
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[11px] uppercase tracking-wide text-slate-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div
                  className="grid flex-1 min-h-0 grid-cols-7 gap-1.5 auto-rows-fr"
                  style={{ gridTemplateRows: `repeat(${weeksInView}, minmax(0, 1fr))` }}
                >
                  {days.map((day, idx) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const inRange = isDayInRange(day);
                    const isStart = isStartDate(day);
                    const isEnd = isEndDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const holiday = holidaysByDate[dayKey];
                    const dayStyle = { ...getDayButtonStyle(inRange, isStart, isEnd, isToday) };

                    if (holiday) {
                      const existingShadow = dayStyle.boxShadow ? `${dayStyle.boxShadow}, ` : '';
                      dayStyle.boxShadow = `${existingShadow}inset 0 0 0 1px ${HOLIDAY_BORDER_COLOR[holiday.kind]}`;
                      if (!inRange && !isStart && !isEnd) {
                        dayStyle.backgroundColor = HOLIDAY_TINT_COLOR[holiday.kind];
                      }
                    }

                    return (
                      <motion.button
                        key={day.toISOString()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => handleDayClick(day)}
                      className={`
                          group h-full min-h-[2.75rem] xl:min-h-[3.25rem] rounded-lg p-1 text-sm transition-all relative
                          ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                          ${!inRange && isCurrentMonth ? 'hover:bg-slate-100' : ''}
                        `}
                        style={dayStyle}
                      >
                        <span className="relative z-10">{format(day, 'd')}</span>
                        {holiday && (
                          <>
                            <span
                              className="absolute bottom-1 left-1/2 z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-white/90"
                              style={{ backgroundColor: HOLIDAY_DOT_COLOR[holiday.kind] }}
                            />
                            <span className="pointer-events-none absolute -top-8 left-1/2 z-30 hidden -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-all duration-200 sm:block sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                              {holiday.name}
                            </span>
                            {activeHolidayDate === dayKey && (
                              <span className="absolute bottom-1 left-1/2 z-30 max-w-[90%] -translate-x-1/2 truncate rounded bg-white/95 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 shadow sm:hidden">
                                {holiday.name}
                              </span>
                            )}
                          </>
                        )}
                        {isStart && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                        )}
                        {isEnd && (
                          <span className="absolute bottom-1 right-1 w-2 h-2 bg-white rounded-full" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1 min-h-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border shadow-2xl p-4 xl:p-5 h-full flex flex-col relative pb-16"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                boxShadow: 'var(--app-shadow)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-5 h-5" style={{ color: 'var(--calendar-accent-strong)' }} />
                <h2 className="text-xl">Notes</h2>
              </div>

              <div className="mb-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    selectedStart
                      ? 'Add a note for selected date(s)...'
                      : 'Select a date first...'
                  }
                  disabled={!selectedStart}
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-[var(--calendar-accent)] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                  rows={3}
                />
                <button
                  onClick={addNote}
                  disabled={!canAddNote}
                  className="mt-2 w-full text-white py-2 rounded-lg transition enabled:hover:brightness-95 disabled:cursor-not-allowed"
                  style={{ backgroundColor: canAddNote ? 'var(--calendar-accent-strong)' : 'var(--app-clear-disabled-bg)' }}
                >
                  Add Note
                </button>
              </div>

              <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
                {getNotesForRange().length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm">
                    No notes yet. Add your first note!
                  </p>
                ) : (
                  getNotesForRange().map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border rounded-lg p-3 relative group"
                      style={{
                        backgroundColor: 'var(--calendar-note-bg)',
                        borderColor: 'var(--calendar-note-border)',
                      }}
                    >
                      <div className="text-xs mb-1" style={{ color: 'var(--calendar-note-meta)' }}>
                        {format(note.startDate, 'MMM d')}
                        {!isSameDay(note.startDate, note.endDate) &&
                          ` - ${format(note.endDate, 'MMM d')}`}
                      </div>
                      <p className="text-sm text-slate-700 pr-8">{note.text}</p>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-3 right-3 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {renderMonthlyHolidaySection()}

              <button
                onClick={openAddHolidayModal}
                disabled={!canOpenAddHoliday}
                className="absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: canOpenAddHoliday ? 'var(--app-secondary-btn-enabled-bg)' : 'var(--app-secondary-btn-disabled-bg)',
                  borderColor: canOpenAddHoliday ? 'var(--calendar-accent-strong)' : 'var(--app-surface-border)',
                  color: canOpenAddHoliday ? 'var(--calendar-accent-strong)' : 'var(--app-secondary-btn-disabled-text)',
                }}
              >
                + Add Holiday
              </button>

              <button
                onClick={clearSelection}
                disabled={!hasSelection}
                className="absolute bottom-4 right-4 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: hasSelection ? 'var(--calendar-accent-strong)' : 'var(--app-clear-disabled-bg)',
                  color: hasSelection ? '#ffffff' : 'var(--app-secondary-btn-disabled-text)',
                }}
              >
                Clear Selection
              </button>
            </motion.div>
          </div>
        </div>

        <div className="lg:hidden space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              boxShadow: 'var(--app-shadow)',
            }}
          >
            <div className="relative h-36 sm:h-40 overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentDate.getMonth()}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  src={currentTheme.image}
                  alt={format(currentDate, 'MMMM yyyy')}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                <button
                  type="button"
                  onClick={() => openPicker('month')}
                  className="text-left group rounded-md px-2 -mx-2 hover:bg-black/20 transition-colors"
                  aria-label="Open month picker"
                >
                  <motion.h1
                    key={format(currentDate, 'MMMM yyyy')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-3xl mb-1 group-hover:opacity-90 transition-opacity"
                  >
                    {format(currentDate, 'MMMM')}
                  </motion.h1>
                </button>
                <p className="text-lg opacity-90">{format(currentDate, 'yyyy')}</p>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  style={{ color: 'var(--calendar-accent-strong)' }}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarIcon className="w-4 h-4" style={{ color: 'var(--calendar-accent-strong)' }} />
                  <span className="text-xs">
                    {selectedStart && selectedEnd
                      ? `${format(selectedStart, 'MMM d')} - ${format(selectedEnd, 'MMM d')}`
                      : selectedStart
                      ? format(selectedStart, 'MMM d')
                      : 'Select dates'}
                  </span>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  style={{ color: 'var(--calendar-accent-strong)' }}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div
                    key={`${day}-${idx}`}
                    className="text-center text-xs text-slate-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const inRange = isDayInRange(day);
                  const isStart = isStartDate(day);
                  const isEnd = isEndDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const holiday = holidaysByDate[dayKey];
                  const dayStyle = { ...getDayButtonStyle(inRange, isStart, isEnd, isToday) };

                  if (holiday) {
                    const existingShadow = dayStyle.boxShadow ? `${dayStyle.boxShadow}, ` : '';
                    dayStyle.boxShadow = `${existingShadow}inset 0 0 0 1px ${HOLIDAY_BORDER_COLOR[holiday.kind]}`;
                    if (!inRange && !isStart && !isEnd) {
                      dayStyle.backgroundColor = HOLIDAY_TINT_COLOR[holiday.kind];
                    }
                  }

                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => handleDayClick(day)}
                      className={`
                        group aspect-square rounded-lg p-1 text-xs transition-all relative
                        ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                        ${!inRange && isCurrentMonth ? 'hover:bg-slate-100' : ''}
                      `}
                      style={dayStyle}
                    >
                      <span className="relative z-10">{format(day, 'd')}</span>
                      {holiday && (
                        <>
                          <span
                            className="absolute bottom-1 left-1/2 z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-white/90"
                            style={{ backgroundColor: HOLIDAY_DOT_COLOR[holiday.kind] }}
                          />
                          <span className="pointer-events-none absolute -top-8 left-1/2 z-30 hidden -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-all duration-200 sm:block sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                            {holiday.name}
                          </span>
                          {activeHolidayDate === dayKey && (
                            <span className="absolute bottom-1 left-1/2 z-30 max-w-[90%] -translate-x-1/2 truncate rounded bg-white/95 px-1 py-0.5 text-[8px] font-medium text-slate-700 shadow sm:hidden">
                              {holiday.name}
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border shadow-2xl p-4 relative pb-16"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              boxShadow: 'var(--app-shadow)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-5 h-5" style={{ color: 'var(--calendar-accent-strong)' }} />
              <h2 className="text-lg">Notes</h2>
            </div>

            <div className="mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  selectedStart
                    ? 'Add a note for selected date(s)...'
                    : 'Select a date first...'
                }
                disabled={!selectedStart}
                className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-[var(--calendar-accent)] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                rows={3}
              />
              <button
                onClick={addNote}
                disabled={!canAddNote}
                className="mt-2 w-full text-white py-2 rounded-lg transition enabled:hover:brightness-95 disabled:cursor-not-allowed"
                style={{ backgroundColor: canAddNote ? 'var(--calendar-accent-strong)' : 'var(--app-clear-disabled-bg)' }}
              >
                Add Note
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getNotesForRange().length === 0 ? (
                <p className="text-slate-400 text-center py-6 text-sm">
                  No notes yet. Add your first note!
                </p>
              ) : (
                getNotesForRange().map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-lg p-3 relative group"
                    style={{
                      backgroundColor: 'var(--calendar-note-bg)',
                      borderColor: 'var(--calendar-note-border)',
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--calendar-note-meta)' }}>
                      {format(note.startDate, 'MMM d')}
                      {!isSameDay(note.startDate, note.endDate) &&
                        ` - ${format(note.endDate, 'MMM d')}`}
                    </div>
                    <p className="text-sm text-slate-700 pr-8">{note.text}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {renderMonthlyHolidaySection(true)}

            <button
              onClick={openAddHolidayModal}
              disabled={!canOpenAddHoliday}
              className="absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: canOpenAddHoliday ? 'var(--app-secondary-btn-enabled-bg)' : 'var(--app-secondary-btn-disabled-bg)',
                borderColor: canOpenAddHoliday ? 'var(--calendar-accent-strong)' : 'var(--app-surface-border)',
                color: canOpenAddHoliday ? 'var(--calendar-accent-strong)' : 'var(--app-secondary-btn-disabled-text)',
              }}
            >
              + Add Holiday
            </button>

            <button
              onClick={clearSelection}
              disabled={!hasSelection}
              className="absolute bottom-4 right-4 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: hasSelection ? 'var(--calendar-accent-strong)' : 'var(--app-clear-disabled-bg)',
                color: hasSelection ? '#ffffff' : 'var(--app-secondary-btn-disabled-text)',
              }}
            >
              Clear Selection
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {activePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-overlay)' }}
            onClick={() => setActivePicker(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="w-full max-w-md rounded-2xl border bg-white shadow-2xl p-5 sm:p-6"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                boxShadow: 'var(--app-shadow)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {activePicker === 'month' ? 'Choose Month' : 'Choose Year'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePicker(null)}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    aria-label="Close picker"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activePicker === 'month') {
                        stepPickerYear(-1);
                      } else {
                        stepYearRange(-1);
                      }
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    aria-label={activePicker === 'month' ? 'Previous year' : 'Previous years'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {activePicker === 'month' ? (
                    <button
                      type="button"
                      onClick={() => setActivePicker('year')}
                      className="rounded-md px-3 py-1.5 text-xl text-slate-900 hover:bg-slate-100 transition-colors"
                      aria-label="Open year picker"
                    >
                      {pickerYear}
                    </button>
                  ) : (
                    <p className="rounded-md px-3 py-1.5 text-base text-slate-800">
                      {yearRangeStart} - {yearRangeStart + YEAR_PAGE_SIZE - 1}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (activePicker === 'month') {
                        stepPickerYear(1);
                      } else {
                        stepYearRange(1);
                      }
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    aria-label={activePicker === 'month' ? 'Next year' : 'Next years'}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {activePicker === 'month' ? (
                  <motion.div
                    key={`month-${pickerYear}`}
                    initial={{ opacity: 0, y: pickerTransitionDirection > 0 ? 12 : -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: pickerTransitionDirection > 0 ? -12 : 12, scale: 0.98 }}
                    transition={{ duration: 0.24 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {MONTH_NAMES.map((month, monthIndex) => {
                      const isSelectedMonth = monthIndex === currentDate.getMonth() && pickerYear === currentYear;
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => handleMonthSelect(monthIndex)}
                          className="rounded-lg px-3 py-2 text-sm transition-colors hover:brightness-95"
                          style={{
                            backgroundColor: isSelectedMonth ? 'var(--calendar-accent-strong)' : 'var(--calendar-accent-soft)',
                            color: isSelectedMonth ? '#ffffff' : '#1f2937',
                          }}
                        >
                          {month.slice(0, 3)}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="year-picker"
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.98 }}
                    transition={{ duration: 0.24 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={yearRangeStart}
                        initial={{ opacity: 0, x: yearRangeDirection >= 0 ? 16 : -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: yearRangeDirection >= 0 ? -16 : 16 }}
                        transition={{ duration: 0.24 }}
                        className="grid grid-cols-3 gap-2"
                      >
                        {yearRange.map((year) => {
                          const isSelectedYear = year === pickerYear;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => handleYearSelect(year)}
                              className="rounded-lg px-3 py-2 text-sm transition-colors hover:brightness-95"
                              style={{
                                backgroundColor: isSelectedYear ? 'var(--calendar-accent-strong)' : 'var(--calendar-accent-soft)',
                                color: isSelectedYear ? '#ffffff' : '#1f2937',
                              }}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddHolidayModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-overlay)' }}
            onClick={closeHolidayModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="w-full max-w-sm rounded-2xl border bg-white shadow-2xl p-5"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                boxShadow: 'var(--app-shadow)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg text-slate-900">{isEditingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
                <button
                  type="button"
                  onClick={closeHolidayModal}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  aria-label={`Close ${isEditingHoliday ? 'edit' : 'add'} holiday modal`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs text-slate-500">Selected date</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {holidayModalDateValue ? format(holidayModalDateValue, 'MMM d, yyyy') : 'No valid date selected'}
                  </div>
                </div>

                <div>
                  <input
                    value={newHolidayName}
                    onChange={(event) => {
                      setNewHolidayName(event.target.value);
                      if (holidayFormError) {
                        setHolidayFormError('');
                      }
                    }}
                    placeholder="Enter holiday name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--calendar-accent)] focus:border-transparent"
                  />
                </div>

                {holidayFormError && (
                  <p className="text-xs text-red-500">{holidayFormError}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeHolidayModal}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHoliday}
                    disabled={!canSubmitHolidayModal}
                    className="rounded-lg px-3 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: 'var(--calendar-accent-strong)' }}
                  >
                    {isEditingHoliday ? 'Update Holiday' : 'Save Holiday'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {holidayToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--app-modal-overlay)' }}
            onClick={() => setHolidayToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-sm rounded-2xl border bg-white shadow-2xl p-5"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                boxShadow: 'var(--app-shadow)',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-lg text-slate-900">Delete Holiday</h3>
              <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete this holiday?</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {formatHolidayDate(holidayToDelete.date)} - {holidayToDelete.name}
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHolidayToDelete(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteHoliday}
                  className="rounded-lg px-3 py-2 text-sm text-white transition hover:brightness-95"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow-2xl"
            style={{
              backgroundColor: 'var(--app-toast-bg)',
              color: 'var(--app-toast-text)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
//kudos to anyone who made it this far! This component was a beast to build but I'm really happy with how it turned out. It was a great opportunity to dive deep into date handling, complex state management, and creating a polished user experience with React and Framer Motion. If you have any questions about how it works or want to see more features added, just let me know!