export function Footer() {
  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] px-4 py-3 text-center text-sm text-[var(--text-secondary)]">
      TimeGrid © {new Date().getFullYear()}
    </footer>
  );
}
