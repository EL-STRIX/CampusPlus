import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-surface/80 sticky top-0 w-full backdrop-blur-md border-b border-outline-variant/30 z-50 transition-all duration-200">
      <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-headline text-2xl font-extrabold text-primary hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>CampusPlus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-headline transition-colors pb-1 ${
              isActive('/')
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            Home
          </Link>
          <Link
            to="/report"
            className={`text-sm font-headline transition-colors pb-1 ${
              isActive('/report')
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            Report Issue
          </Link>
          <Link
            to="/track"
            className={`text-sm font-headline transition-colors pb-1 ${
              location.pathname.startsWith('/track')
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            Track Report
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link to="/report">
            <Button variant="primary" size="md">
              Report an Issue
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-gutter py-4 flex flex-col gap-3 shadow-card animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg font-headline text-sm ${
              isActive('/') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Home
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg font-headline text-sm ${
              isActive('/report') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Report Issue
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg font-headline text-sm ${
              location.pathname.startsWith('/track')
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Track Report
          </Link>
          <div className="pt-2">
            <Link to="/report" onClick={() => setMobileMenuOpen(false)} className="w-full block">
              <Button variant="primary" size="md" className="w-full">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
