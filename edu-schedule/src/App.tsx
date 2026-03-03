import { useState } from 'react';
import { CalendarDays, List, BarChart2, Plus, Info, X, Mail, Globe } from 'lucide-react';
import { Layout } from './components/Layout';
import { EntryForm, EntryList } from './components/EntryForm';
import { TimetableGrid } from './components/Timetable';
import { Statistics } from './components/Statistics';
import { MobileModal } from './components/Modal';
import { useEntries, useTheme } from './hooks';
import type { Entry } from './store';
import { validateEntry } from './utils/validation';
import type { DayId } from './constants';

type MobileTab = 'schedule' | 'entries' | 'stats';

function App() {
  useTheme();
  const { addEntry, updateEntry, entries } = useEntries();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedDay, setPreselectedDay] = useState<DayId | ''>('');
  const [preselectedStartTime, setPreselectedStartTime] = useState('');
  const [zoom, setZoom] = useState(100);
  const [mobileTab, setMobileTab] = useState<MobileTab>('schedule');
  const [showAbout, setShowAbout] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 100));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 70));

  const handleSubmit = (entryData: Omit<Entry, 'id'>) => {
    const validation = validateEntry(entryData);
    if (!validation.valid) return;

    if (editingEntry) {
      updateEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      addEntry(entryData);
    }
    setIsModalOpen(false);
    setPreselectedDay('');
    setPreselectedStartTime('');
  };

  const handleCellClick = (day: DayId, time: string) => {
    const existingEntry = entries.find(e => e.day === day && e.startTime === time);
    if (existingEntry) {
      setEditingEntry(existingEntry);
    } else {
      setEditingEntry(null);
      setPreselectedDay(day);
      setPreselectedStartTime(time);
    }
    setIsModalOpen(true);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => setEditingEntry(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPreselectedDay('');
    setPreselectedStartTime('');
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setPreselectedDay('');
    setPreselectedStartTime('');
    setIsModalOpen(true);
  };

  return (
    <Layout>
      {/* ── Export-only off-screen desktop grid (always rendered, never display:none) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 1200,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div id="export-grid" className="bg-[var(--bg-surface)] p-4 border border-[var(--border-color)] overflow-visible">
          <TimetableGrid
            onCellClick={handleCellClick}
            zoom={100}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </div>
      </div>

      {/* ── Desktop layout ───────────────────────────────────────── */}
      <div className="hidden md:block w-full max-w-[80%] mx-auto pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 lg:gap-6">
          {/* Left Panel */}
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-[var(--bg-surface)] p-3 lg:p-4 border border-[var(--border-color)]">
              <h2 className="text-base lg:text-lg font-bold mb-3 lg:mb-4">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <EntryForm
                onSubmit={handleSubmit}
                editingEntry={editingEntry}
                onCancelEdit={handleCancelEdit}
                preselectedDay={preselectedDay}
                preselectedStartTime={preselectedStartTime}
              />
            </div>
            <div className="bg-[var(--bg-surface)] p-3 lg:p-4 border border-[var(--border-color)]">
              <EntryList onEdit={handleEdit} />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4 lg:space-y-6">
            <Statistics />
            <div id="timetable-grid-desktop" className="bg-[var(--bg-surface)] p-2 lg:p-4 border border-[var(--border-color)] overflow-hidden">
              <TimetableGrid
                onCellClick={handleCellClick}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ────────────────────────────────────────── */}
      {/* h-[calc(100dvh-56px-64px)]: full viewport minus navbar (56px) and bottom nav (64px) */}
      <div className="md:hidden" style={{ height: 'calc(100dvh - 56px - 64px)' }}>
        {/* Schedule tab — no padding so grid+bin fill the space exactly */}
        {mobileTab === 'schedule' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <TimetableGrid
                onCellClick={handleCellClick}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
              />
            </div>
          </div>
        )}

        {/* Entries tab */}
        {mobileTab === 'entries' && (
          <div className="h-full overflow-y-auto px-3 pt-3">
            <div className="bg-[var(--bg-surface)] p-4 border border-[var(--border-color)]">
              <EntryList onEdit={handleEdit} />
            </div>
          </div>
        )}

        {/* Stats tab */}
        {mobileTab === 'stats' && (
          <div className="h-full overflow-y-auto px-3 pt-3">
            <Statistics />
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface)] border-t border-[var(--border-color)]">
        <div className="flex items-stretch h-16">

          <button
            onClick={() => setMobileTab('schedule')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              mobileTab === 'schedule' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Schedule"
          >
            <CalendarDays size={20} />
            <span className="text-xs font-medium">Schedule</span>
          </button>

          <button
            onClick={() => setMobileTab('entries')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              mobileTab === 'entries' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Entries"
          >
            <List size={20} />
            <span className="text-xs font-medium">Entries</span>
          </button>

          {/* Add button — inline, accent coloured */}
          <button
            onClick={handleAddNew}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-[var(--accent-primary)] text-white transition-opacity active:opacity-80"
            aria-label="Add entry"
          >
            <Plus size={22} />
            <span className="text-xs font-medium">Add</span>
          </button>

          <button
            onClick={() => setMobileTab('stats')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              mobileTab === 'stats' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Stats"
          >
            <BarChart2 size={20} />
            <span className="text-xs font-medium">Stats</span>
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)] transition-colors active:text-[var(--accent-primary)]"
            aria-label="About"
          >
            <Info size={20} />
            <span className="text-xs font-medium">About</span>
          </button>

        </div>
      </nav>

      {/* About modal (mobile) */}
      {showAbout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-color)] w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">About EduSchedule</h2>
              <button onClick={() => setShowAbout(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={22} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <p className="text-base leading-relaxed text-[var(--text-primary)]">
                EduSchedule is a clean, interactive timetable builder designed for students and educators.
                Add, drag, and organise your weekly schedule with ease — then export it as PDF or image.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-[var(--accent-primary)]" />
                  <a href="mailto:pleasuren15@gmail.com" className="text-base text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors break-all">
                    pleasuren15@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="shrink-0 text-[var(--accent-primary)]" />
                  <a href="https://pleasuren15-github-io.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-base text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors break-all">
                    pleasuren15-github-io.vercel.app
                  </a>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-color)] text-sm text-[var(--text-secondary)] text-right">
              Built with ♥ by Pleasure N
            </div>
          </div>
        </div>
      )}

      {/* Modal (shared mobile + desktop) */}
      <MobileModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editingEntry={editingEntry}
        onCancelEdit={handleCancelEdit}
        preselectedDay={preselectedDay}
        preselectedStartTime={preselectedStartTime}
      />
    </Layout>
  );
}

export default App;
