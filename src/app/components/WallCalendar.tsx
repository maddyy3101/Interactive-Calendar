import { useState, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, StickyNote, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
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

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEAR_PAGE_SIZE = 12;

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

  // Load notes from localStorage
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

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-notes', JSON.stringify(notes));
  }, [notes]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeksInView = days.length / 7;
  const currentYear = currentDate.getFullYear();
  const yearRange = Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearRangeStart + index);

  const currentTheme = MONTH_THEMES[currentDate.getMonth()];
  const hasSelection = Boolean(selectedStart);
  const canAddNote = Boolean(noteText.trim() && selectedStart);
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

  return (
    <div
      className="relative min-h-screen overflow-hidden p-4 md:p-6 lg:h-screen lg:p-8 transition-colors duration-500"
      style={{
        ...themeStyles,
        backgroundImage: 'linear-gradient(135deg, var(--calendar-bg-from), var(--calendar-bg-to))',
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

      <div className="relative z-10 mx-auto max-w-7xl lg:h-full">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:h-full lg:grid-cols-3 lg:gap-6">
          {/* Hero Image & Calendar Section */}
          <div className="lg:col-span-2 min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
            >
              {/* Hero Image */}
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

              {/* Calendar Grid */}
              <div className="p-4 xl:p-6 flex flex-1 flex-col min-h-0">
                {/* Navigation */}
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

                {/* Weekday Headers */}
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

                {/* Days Grid */}
                <div
                  className="grid flex-1 min-h-0 grid-cols-7 gap-1.5 auto-rows-fr"
                  style={{ gridTemplateRows: `repeat(${weeksInView}, minmax(0, 1fr))` }}
                >
                  {days.map((day, idx) => {
                    const inRange = isDayInRange(day);
                    const isStart = isStartDate(day);
                    const isEnd = isEndDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <motion.button
                        key={day.toISOString()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => handleDayClick(day)}
                      className={`
                          h-full min-h-[2.75rem] xl:min-h-[3.25rem] rounded-lg p-1 text-sm transition-all relative
                          ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                          ${!inRange && isCurrentMonth ? 'hover:bg-slate-100' : ''}
                        `}
                        style={getDayButtonStyle(inRange, isStart, isEnd, isToday)}
                      >
                        <span className="relative z-10">{format(day, 'd')}</span>
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

          {/* Notes Section */}
          <div className="lg:col-span-1 min-h-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-4 xl:p-5 h-full flex flex-col relative pb-16"
            >
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-5 h-5" style={{ color: 'var(--calendar-accent-strong)' }} />
                <h2 className="text-xl">Notes</h2>
              </div>

              {/* Add Note Form */}
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
                  style={{ backgroundColor: canAddNote ? 'var(--calendar-accent-strong)' : '#cbd5e1' }}
                >
                  Add Note
                </button>
              </div>

              {/* Notes List */}
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

              <button
                onClick={clearSelection}
                disabled={!hasSelection}
                className="absolute bottom-4 right-4 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: hasSelection ? 'var(--calendar-accent-strong)' : '#e2e8f0',
                  color: hasSelection ? '#ffffff' : '#64748b',
                }}
              >
                Clear Selection
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Hero Image */}
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

            {/* Calendar Grid */}
            <div className="p-3 sm:p-4">
              {/* Navigation */}
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

              {/* Weekday Headers */}
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

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const inRange = isDayInRange(day);
                  const isStart = isStartDate(day);
                  const isEnd = isEndDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square rounded-lg p-1 text-xs transition-all relative
                        ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                        ${!inRange && isCurrentMonth ? 'hover:bg-slate-100' : ''}
                      `}
                      style={getDayButtonStyle(inRange, isStart, isEnd, isToday)}
                    >
                      <span className="relative z-10">{format(day, 'd')}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-4 relative pb-16"
          >
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-5 h-5" style={{ color: 'var(--calendar-accent-strong)' }} />
              <h2 className="text-lg">Notes</h2>
            </div>

            {/* Add Note Form */}
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
                style={{ backgroundColor: canAddNote ? 'var(--calendar-accent-strong)' : '#cbd5e1' }}
              >
                Add Note
              </button>
            </div>

            {/* Notes List */}
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

            <button
              onClick={clearSelection}
              disabled={!hasSelection}
              className="absolute bottom-4 right-4 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: hasSelection ? 'var(--calendar-accent-strong)' : '#e2e8f0',
                color: hasSelection ? '#ffffff' : '#64748b',
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm"
            onClick={() => setActivePicker(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5 sm:p-6"
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
    </div>
  );
}
