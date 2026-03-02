import { useRef } from 'react';
import { useEntries, useNotification } from '../../hooks';
import { parseJSON, parseCSV, parseICS } from '../../utils/exportUtils';
import { validateImportedEntries } from '../../utils/validation';

interface ImportMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ImportMenu({ isOpen, onToggle }: ImportMenuProps) {
  const { loadEntries } = useEntries();
  const { show } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let parsed: any[] = [];
      
      if (file.name.endsWith('.json')) {
        parsed = parseJSON(content);
      } else if (file.name.endsWith('.csv')) {
        parsed = parseCSV(content);
      } else if (file.name.endsWith('.ics')) {
        parsed = parseICS(content);
      } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const rows = doc.querySelectorAll('table tr');
        parsed = Array.from(rows).slice(1).map(row => {
          const cells = row.querySelectorAll('td');
          return {
            subject: cells[0]?.textContent || '',
            day: cells[1]?.textContent?.toLowerCase() || '',
            startTime: cells[2]?.textContent || '',
            endTime: cells[3]?.textContent || '',
          };
        });
      }

      const validation = validateImportedEntries(parsed);
      
      if (validation.validEntries.length > 0) {
        loadEntries(validation.validEntries as any);
        show(`Imported ${validation.validEntries.length} entries`, 'success');
      } else {
        show('No valid entries found', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const formats = ['json', 'csv', 'xlsx', 'ics'];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-elevated)] transition-colors rounded"
        aria-label="Import"
      >
        <img src="https://img.icons8.com/?size=100&id=108642&format=png&color=202020" alt="Import" className="w-5 h-5" />
        <span className="text-sm font-medium">Import</span>
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,.xlsx,.xls,.ics"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
      
      {isOpen && (
        <div 
          className="absolute top-full mt-2 right-0 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-lg z-10 min-w-[150px] animate-fade-in opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {formats.map(format => (
            <button
              key={format}
              onClick={handleClick}
              className="w-full px-4 py-2 text-left hover:bg-[var(--bg-elevated)] transition-colors uppercase text-sm cursor-pointer"
            >
              {format}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
