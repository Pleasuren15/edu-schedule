import { useEntries } from '../../hooks';
import { exportToJSON, exportToCSV, exportToHTML, exportToICS } from '../../utils/exportUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ExportMenu({ isOpen, onToggle }: ExportMenuProps) {
  const { entries } = useEntries();

  const handleExport = async (format: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = exportToJSON(entries);
        filename = 'schedule.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        content = exportToCSV(entries);
        filename = 'schedule.csv';
        mimeType = 'text/csv';
        break;
      case 'html':
        content = exportToHTML(entries);
        filename = 'schedule.html';
        mimeType = 'text/html';
        break;
      case 'ics':
        content = exportToICS(entries);
        filename = 'schedule.ics';
        mimeType = 'text/calendar';
        break;
      case 'png':
      case 'pdf': {
        const element = document.getElementById('export-grid') as HTMLElement | null;
        if (!element) return;

        const bgColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--bg-primary').trim() || '#ffffff';

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: bgColor,
          width: element.scrollWidth,
          height: element.scrollHeight,
        });

        if (format === 'png') {
          const link = document.createElement('a');
          link.download = 'schedule.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          const imgData = canvas.toDataURL('image/png');
          const imgW = canvas.width / 2;
          const imgH = canvas.height / 2;
          const isLandscape = imgW > imgH;
          const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'px', format: [imgW, imgH] });
          pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
          pdf.save('schedule.pdf');
        }
        return;
      }
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formats = ['json', 'csv', 'html', 'ics', 'png', 'pdf'];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-elevated)] transition-colors rounded"
        aria-label="Export"
      >
        <img src="https://img.icons8.com/bubbles/100/export.png" alt="Export" className="w-5 h-5" />
        <span className="text-sm font-medium">Export</span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full mt-2 right-0 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-lg z-10 min-w-[150px] animate-fade-in opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {formats.map(format => (
            <button
              key={format}
              onClick={(e) => handleExport(format, e)}
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
