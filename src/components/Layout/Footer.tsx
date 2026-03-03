import { useState } from 'react';
import { Info, X, Mail, Globe } from 'lucide-react';

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">About EduSchedule</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 text-[var(--text-secondary)]">
          <p className="text-base leading-relaxed text-[var(--text-primary)]">
            EduSchedule is a clean, interactive timetable builder designed for students and educators.
            Add, drag, and organise your weekly schedule with ease — then export it as PDF or image.
          </p>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-[var(--accent-primary)]" />
              <a
                href="mailto:pleasuren15@gmail.com"
                className="text-base hover:text-[var(--accent-primary)] transition-colors break-all"
              >
                pleasuren15@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Globe size={18} className="shrink-0 text-[var(--accent-primary)]" />
              <a
                href="https://pleasuren15-github-io.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base hover:text-[var(--accent-primary)] transition-colors break-all"
              >
                pleasuren15-github-io.vercel.app
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] text-sm text-[var(--text-secondary)] text-right">
          Built with ♥ by Pleasure N
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      {/* Hidden on mobile — bottom nav replaces it */}
      <footer className="hidden md:block bg-[var(--bg-surface)] border-t border-[var(--border-color)]">
        <div className="w-full max-w-[80%] mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-base text-[var(--text-secondary)]">TimeGrid © {new Date().getFullYear()}</span>

          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 text-base hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors"
            aria-label="About this application"
          >
            <Info size={18} />
            <span>About</span>
          </button>
        </div>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
