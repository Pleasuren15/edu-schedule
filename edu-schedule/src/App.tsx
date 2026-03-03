import { useState } from 'react';
import { Layout } from './components/Layout';
import { EntryForm, EntryList } from './components/EntryForm';
import { TimetableGrid } from './components/Timetable';
import { Statistics } from './components/Statistics';
import { MobileModal } from './components/Modal';
import { useEntries, useTheme } from './hooks';
import type { Entry } from './store';
import { validateEntry } from './utils/validation';
import type { DayId } from './constants';

function App() {
  useTheme();
  const { addEntry, updateEntry, entries } = useEntries();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedDay, setPreselectedDay] = useState<DayId | ''>('');
  const [preselectedStartTime, setPreselectedStartTime] = useState('');
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 100));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 70));

  const handleSubmit = (entryData: Omit<Entry, 'id'>) => {
    const validation = validateEntry(entryData);
    if (!validation.valid) {
      return;
    }

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
    // Check if there's an existing entry at this cell
    const existingEntry = entries.find(e => e.day === day && e.startTime === time);
    
    if (existingEntry) {
      // Open for editing
      setEditingEntry(existingEntry);
    } else {
      // New entry with preselected day/time
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

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPreselectedDay('');
    setPreselectedStartTime('');
  };

  return (
    <Layout>
      <div className="w-full max-w-[80%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 lg:gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4 lg:space-y-6">
            {/* Desktop Form */}
            <div className="bg-[var(--bg-surface)] p-3 lg:p-4 border border-[var(--border-color)] hidden md:block">
              <h2 className="text-base lg:text-lg font-bold mb-3 lg:mb-4">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <EntryForm 
                onSubmit={handleSubmit} 
                editingEntry={editingEntry}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            {/* Entry List */}
            <div className="bg-[var(--bg-surface)] p-3 lg:p-4 border border-[var(--border-color)]">
              <EntryList onEdit={handleEdit} />
            </div>

            {/* Mobile Add Button */}
            <button
              onClick={() => {
                setEditingEntry(null);
                setIsModalOpen(true);
              }}
              className="md:hidden fixed bottom-20 right-4 w-12 h-12 bg-[var(--accent-primary)] text-white shadow-lg flex items-center justify-center z-40 animate-pulse cursor-pointer"
              style={{ borderRadius: 0 }}
            >
              <img src="https://img.icons8.com/?size=100&id=110229&format=png&color=000000" alt="Add" className="w-6 h-6" />
            </button>
          </div>

          {/* Right Panel - Timetable */}
          <div className="space-y-4 lg:space-y-6">
            {/* Statistics */}
            <Statistics />

            {/* Timetable Grid */}
            <div id="timetable-grid" className="bg-[var(--bg-surface)] p-2 lg:p-4 border border-[var(--border-color)] overflow-hidden">
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

      {/* Mobile Modal */}
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
