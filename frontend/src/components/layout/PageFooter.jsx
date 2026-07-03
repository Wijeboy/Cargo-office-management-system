export default function PageFooter() {
  return (
    <footer className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
      <p>© 2024 LogiFlow Systems Inc.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="hover:text-accent transition-colors">Support Center</button>
        <button type="button" className="hover:text-accent transition-colors">Privacy Policy</button>
        <span>LogiFlow v2.4.0</span>
        <button type="button" className="hover:text-accent transition-colors">Terms of Service</button>
      </div>
    </footer>
  );
}
