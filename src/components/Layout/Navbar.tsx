import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../../hooks';
import { ExportMenu } from '../Export/ExportMenu';
import { ImportMenu } from '../Export/ImportMenu';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [time] = useState(new Date());
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportToggle = () => {
    setExportOpen(!exportOpen);
    setImportOpen(false);
  };

  const handleImportToggle = () => {
    setImportOpen(!importOpen);
    setExportOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
        setImportOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]" ref={menuRef}>
      <div className="w-full md:max-w-[80%] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="0" fill="url(#navGradient)" />
            <rect x="6" y="8" width="6" height="6" rx="0" fill="white" fillOpacity="0.9"/>
            <rect x="15" y="8" width="6" height="6" rx="0" fill="white" fillOpacity="0.7"/>
            <rect x="24" y="8" width="6" height="6" rx="0" fill="white" fillOpacity="0.5"/>
            <rect x="6" y="17" width="6" height="6" rx="0" fill="white" fillOpacity="0.5"/>
            <rect x="15" y="17" width="6" height="6" rx="0" fill="white" fillOpacity="0.9"/>
            <rect x="24" y="17" width="6" height="6" rx="0" fill="white" fillOpacity="0.7"/>
            <rect x="6" y="26" width="6" height="4" rx="0" fill="white" fillOpacity="0.3"/>
            <rect x="15" y="26" width="6" height="4" rx="0" fill="white" fillOpacity="0.5"/>
            <rect x="24" y="26" width="6" height="4" rx="0" fill="white" fillOpacity="0.9"/>
            <defs>
              <linearGradient id="navGradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff9a56"/>
                <stop offset="1" stopColor="#ff6b35"/>
              </linearGradient>
            </defs>
          </svg>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">EduSchedule</h1>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ExportMenu isOpen={exportOpen} onToggle={handleExportToggle} />
          <ImportMenu isOpen={importOpen} onToggle={handleImportToggle} />
          <span className="text-sm text-[var(--text-secondary)] hidden sm:block ml-2">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--bg-elevated)] transition-colors rounded cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <img src="https://img.icons8.com/?size=100&id=1PQfP9t1iMCJ&format=png&color=000000" alt="Dark Mode" className="w-8 h-8" />
            ) : (
              <img src="https://img.icons8.com/?size=100&id=112286&format=png&color=000000" alt="Light Mode" className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--bg-elevated)] transition-colors rounded cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <img src="https://img.icons8.com/?size=100&id=1PQfP9t1iMCJ&format=png&color=000000" alt="Dark Mode" className="w-7 h-7" />
            ) : (
              <img src="https://img.icons8.com/?size=100&id=112286&format=png&color=000000" alt="Light Mode" className="w-7 h-7" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
            className="p-2 hover:bg-[var(--bg-elevated)] transition-colors rounded cursor-pointer text-[var(--text-primary)]"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full md:max-w-[80%] mx-auto px-4 py-3 flex flex-col gap-2">
            <ExportMenu isOpen={exportOpen} onToggle={handleExportToggle} />
            <ImportMenu isOpen={importOpen} onToggle={handleImportToggle} />
          </div>
        </div>
      )}
    </nav>
  );
}
