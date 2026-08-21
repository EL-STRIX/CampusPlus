import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container border-t border-outline-variant/30 mt-auto transition-colors">
      <div className="py-12 px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-on-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>CampusPlus</span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-md">
            Fast, frictionless campus lab and classroom equipment reporting for students and staff.
          </p>
          <span className="text-xs text-outline mt-2">
            © {currentYear} CampusPlus. All rights reserved. Built for institutional efficiency.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-sans">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/report" className="text-on-surface-variant hover:text-primary transition-colors">
            Report Issue
          </Link>
          <span className="text-outline/50">•</span>
          <Link
            to="/privacy"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
