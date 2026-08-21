import PropTypes from 'prop-types';
import { useAuth } from '../context/useAuth';

export default function AdminHeader({ title, onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Toggle Sidebar Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-headline font-bold text-xl md:text-2xl text-on-surface tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-xs font-headline font-medium text-on-surface-variant border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-status-resolved"></span>
          <span>System Operational</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-headline font-bold text-xs shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="hidden md:inline font-headline font-semibold text-sm text-on-surface">
            {user?.username}
          </span>
        </div>
      </div>
    </header>
  );
}

AdminHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onMenuToggle: PropTypes.func.isRequired,
};
