import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';

export default function ConfirmationPage() {
  const location = useLocation();
  const reportData = location.state || {};
  const { reportId, isNewReport, reportCount } = reportData;

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-gutter">
      <div className="max-w-xl w-full text-center bg-surface-container-lowest p-8 sm:p-12 rounded-3xl shadow-card border border-outline-variant/30 animate-fadeIn">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-status-resolved/15 text-status-resolved flex items-center justify-center shadow-inner">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-extrabold text-primary mb-3 tracking-tight">
          Report Submitted — Thank You!
        </h1>

        {/* Dynamic Context Description */}
        {reportId ? (
          <div className="mb-6">
            <span className="inline-block font-mono text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-md border border-outline-variant/30 mb-3">
              Ticket ID: {reportId}
            </span>
            {isNewReport ? (
              <p className="text-sm md:text-base font-sans text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Your report has been logged and queued for the facilities technical team. No further action is required on your part.
              </p>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-md mx-auto text-left">
                <span className="font-headline font-bold text-xs text-primary uppercase tracking-wider block mb-1">
                  Existing Fault Elevated
                </span>
                <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
                  An open ticket was already logged for this equipment. Your report has been added to elevate ticket priority (Total student reports: <strong>{reportCount}</strong>).
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm md:text-base font-sans text-on-surface-variant mb-8 max-w-md mx-auto leading-relaxed">
            Our facilities maintenance team will review your ticket shortly.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/report">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              Report Another Issue
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
