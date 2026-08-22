import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';

export default function ConfirmationPage() {
  const location = useLocation();
  const reportData = location.state || {};
  const { reportId, isNewReport, reportCount } = reportData;
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (reportId) {
      navigator.clipboard.writeText(reportId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="font-mono text-xs sm:text-sm font-bold text-on-surface bg-surface-container px-3 py-1 rounded-md border border-outline-variant/30 select-all">
                Ticket ID: {reportId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded-md text-outline hover:text-primary hover:bg-primary/10 transition-colors text-xs inline-flex items-center gap-1"
                title="Copy Ticket ID"
              >
                {copied ? (
                  <span className="text-status-resolved font-headline font-bold text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {isNewReport ? (
              <p className="text-sm md:text-base font-sans text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Your report has been logged and queued for the facilities technical team. Save your Ticket ID to track live repair progress.
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
          {reportId && (
            <Link to={`/track?id=${encodeURIComponent(reportId)}`}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Track Live Status
              </Button>
            </Link>
          )}
          <Link to="/report">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Report Another Issue
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="md" className="w-full sm:w-auto">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
