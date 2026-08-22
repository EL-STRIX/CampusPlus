import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { trackReport } from '../api/reports';
import Button from '../components/Button';
import Card from '../components/Card';

const LOCAL_STORAGE_KEY = 'campusplus_tracked_tickets';

export default function TrackReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeId } = useParams();

  const queryId = searchParams.get('id') || routeId || '';

  const [ticketInput, setTicketInput] = useState(queryId);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url}`;
  };

  // Load recent tickets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentTickets(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentTicket = (ticketId, deviceType, roomName) => {
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const filtered = existing.filter((item) => item.id !== ticketId);
      const updated = [
        {
          id: ticketId,
          deviceType: deviceType || 'Equipment',
          roomName: roomName || 'Campus Room',
          timestamp: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 5); // Keep up to 5 recent
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setRecentTickets(updated);
    } catch {
      // Ignore
    }
  };

  const removeRecentTicket = (e, ticketId) => {
    e.stopPropagation();
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = existing.filter((item) => item.id !== ticketId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setRecentTickets(updated);
    } catch {
      // Ignore
    }
  };

  // Fetch report data
  const handleFetchReport = useCallback(async (ticketId) => {
    if (!ticketId || !ticketId.trim()) return;

    const cleanId = ticketId
      .trim()
      .replace(/^(ticket\s*id|report\s*id|id)\s*[:#-]?\s*/i, '')
      .replace(/^["'`#]+|["'`]+$/g, '')
      .trim();

    if (!cleanId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await trackReport(cleanId);
      setReport(data);
      saveRecentTicket(data.id, data.deviceType, data.roomName);
    } catch (err) {
      setReport(null);
      setError(
        err.message ||
          `We could not find any maintenance report with Ticket ID "${cleanId}". Please check the ID and try again.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with URL param
  useEffect(() => {
    if (queryId) {
      setTicketInput(queryId);
      handleFetchReport(queryId);
    }
  }, [queryId, handleFetchReport]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = ticketInput.trim();
    if (!clean) return;

    setSearchParams({ id: clean });
    handleFetchReport(clean);
  };

  const handleSelectRecent = (ticketId) => {
    setTicketInput(ticketId);
    setSearchParams({ id: ticketId });
    handleFetchReport(ticketId);
  };

  const handleCopyId = () => {
    if (report?.id) {
      navigator.clipboard.writeText(report.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Status visual configurations
  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return {
          label: 'Open / Under Review',
          description: 'Your report has been logged into the maintenance queue and is awaiting technician dispatch.',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          dotBg: 'bg-slate-500',
          stepIndex: 1,
        };
      case 'in_progress':
        return {
          label: 'In Progress / Maintenance Active',
          description: 'A facilities technician is actively diagnosing or repairing this equipment.',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
          dotBg: 'bg-amber-500 animate-pulse',
          stepIndex: 2,
        };
      case 'resolved':
        return {
          label: 'Resolved / Fixed',
          description: 'The equipment has been successfully serviced, repaired, and verified operational.',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          dotBg: 'bg-emerald-500',
          stepIndex: 3,
        };
      case 'rejected':
        return {
          label: 'Declined / Closed',
          description: 'This report was reviewed by facilities staff and marked as closed.',
          badgeBg: 'bg-red-50 text-red-900 border-red-300',
          dotBg: 'bg-red-500',
          stepIndex: -1,
        };
      default:
        return {
          label: status || 'Unknown',
          description: 'Status update pending.',
          badgeBg: 'bg-surface-container text-on-surface border-outline-variant',
          dotBg: 'bg-outline',
          stepIndex: 1,
        };
    }
  };

  const currentStatusConfig = report ? getStatusConfig(report.status) : null;

  return (
    <div className="flex-grow flex flex-col pt-8 pb-16 px-gutter max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Live Request Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-3">
          Track Report Request
        </h1>
        <p className="text-sm sm:text-base font-sans text-on-surface-variant leading-relaxed">
          Enter your Ticket ID below to check real-time maintenance progress, equipment status, and resolution updates.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="max-w-3xl mx-auto w-full mb-8">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl shadow-card border border-outline-variant/30 flex flex-col sm:flex-row items-stretch gap-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
        >
          <div className="relative flex-grow flex items-center">
            <div className="absolute left-4 text-outline pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Paste Ticket ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
              className="w-full pl-12 pr-10 py-3 rounded-xl text-sm sm:text-base font-mono bg-transparent text-on-surface placeholder:text-outline placeholder:font-sans focus:outline-none"
            />
            {ticketInput && (
              <button
                type="button"
                onClick={() => {
                  setTicketInput('');
                  setReport(null);
                  setError(null);
                  setSearchParams({});
                }}
                className="absolute right-3 p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Clear input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={!ticketInput.trim() || loading}
            className="sm:w-auto px-7"
          >
            <span>Track Status</span>
          </Button>
        </form>

        {/* Recent Search Pills */}
        {recentTickets.length > 0 && !report && !loading && (
          <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
            <span className="text-xs font-headline font-semibold text-outline">Recent Tickets:</span>
            {recentTickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectRecent(t.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-mono text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors border border-outline-variant/30 group"
                title={`Track ${t.deviceType} in ${t.roomName}`}
              >
                <span>{t.id.slice(0, 8)}...</span>
                <span className="text-[10px] text-outline group-hover:text-primary font-sans">
                  ({t.deviceType})
                </span>
                <span
                  onClick={(e) => removeRecentTicket(e, t.id)}
                  className="hover:text-error ml-0.5 p-0.5 rounded-full hover:bg-black/5"
                  title="Remove from history"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="max-w-4xl mx-auto w-full animate-pulse space-y-6">
          <div className="h-40 bg-surface-container-low rounded-2xl border border-outline-variant/20"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-surface-container-low rounded-2xl border border-outline-variant/20"></div>
            <div className="h-64 bg-surface-container-low rounded-2xl border border-outline-variant/20"></div>
          </div>
        </div>
      )}

      {/* Error / Not Found Message */}
      {error && !loading && (
        <div className="max-w-2xl mx-auto w-full bg-red-50 border border-status-rejected/30 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn shadow-card">
          <div className="w-14 h-14 rounded-full bg-red-100 text-status-rejected mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-headline font-bold text-on-surface mb-2">Report Not Found</h2>
          <p className="text-sm font-sans text-on-surface-variant mb-6 leading-relaxed max-w-md mx-auto">
            {error}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTicketInput('');
                setError(null);
                setSearchParams({});
              }}
              className="px-5 py-2 rounded-full border border-outline-variant text-sm font-headline font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Try Another ID
            </button>
            <Link to="/report">
              <Button variant="primary" size="md">
                Report a New Issue
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State (When no ticket is queried yet) */}
      {!report && !error && !loading && (
        <div className="max-w-2xl mx-auto w-full py-12 px-6 text-center bg-surface-container-low/60 rounded-3xl border border-outline-variant/30 shadow-subtle animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h2 className="text-xl font-headline font-bold text-on-surface mb-2">Ready to Track</h2>
          <p className="text-sm font-sans text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
            Please paste your Ticket ID above to view live maintenance assignment, stage progression, and technician updates.
          </p>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 max-w-md mx-auto text-left shadow-card">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary block mb-2">
              💡 Where to find your Ticket ID?
            </span>
            <ul className="text-xs font-sans text-on-surface-variant space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Displayed on the <strong>Thank You confirmation page</strong> immediately after submitting a report.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>UUID format looking like <code>550e8400-e29b-41d4-a716-446655440000</code>.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Report Details Display */}
      {report && !loading && (
        <div className="max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
          {/* Top Status Banner Card */}
          <Card className="bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-8 rounded-3xl shadow-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-outline-variant/20">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-headline font-bold uppercase tracking-wider text-outline">
                    Ticket ID
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-on-surface bg-surface-container px-3 py-1 rounded-lg border border-outline-variant/40 select-all">
                    {report.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-colors text-xs inline-flex items-center gap-1"
                    title="Copy Ticket ID"
                  >
                    {copied ? (
                      <span className="text-status-resolved font-headline font-bold text-xs flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-sans">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Reported on <strong>{formatDate(report.createdAt)}</strong>
                </p>
              </div>

              {/* Status Pill Badge */}
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-headline font-bold shadow-subtle ${currentStatusConfig.badgeBg}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${currentStatusConfig.dotBg}`}></span>
                  <span>{currentStatusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Workflow Progress Stepper (if not rejected) */}
            {report.status !== 'rejected' ? (
              <div className="pt-8 pb-4">
                <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                  {/* Connecting Line Background */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-surface-container-highest z-0"></div>

                  {/* Active Progress Fill */}
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 z-0"
                    style={{
                      width:
                        currentStatusConfig.stepIndex === 1
                          ? '0%'
                          : currentStatusConfig.stepIndex === 2
                          ? '50%'
                          : '100%',
                    }}
                  ></div>

                  {/* Step 1: Submitted */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-surface-container-lowest font-headline font-bold text-sm transition-all duration-300 ${
                        currentStatusConfig.stepIndex >= 1
                          ? 'bg-primary text-on-primary shadow-md'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-headline font-bold text-on-surface mt-2 text-center">
                      1. Logged
                    </span>
                    <span className="text-[11px] font-sans text-outline hidden sm:block text-center">
                      Report Received
                    </span>
                  </div>

                  {/* Step 2: In Progress */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-surface-container-lowest font-headline font-bold text-sm transition-all duration-300 ${
                        currentStatusConfig.stepIndex >= 2
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {currentStatusConfig.stepIndex >= 3 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-headline font-bold text-on-surface mt-2 text-center">
                      2. In Progress
                    </span>
                    <span className="text-[11px] font-sans text-outline hidden sm:block text-center">
                      Technician Assigned
                    </span>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-surface-container-lowest font-headline font-bold text-sm transition-all duration-300 ${
                        currentStatusConfig.stepIndex >= 3
                          ? 'bg-status-resolved text-white shadow-md'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-headline font-bold text-on-surface mt-2 text-center">
                      3. Resolved
                    </span>
                    <span className="text-[11px] font-sans text-outline hidden sm:block text-center">
                      Repaired & Tested
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs sm:text-sm font-sans text-on-surface-variant mt-6 bg-surface-container-low/70 py-2.5 px-4 rounded-xl max-w-xl mx-auto border border-outline-variant/20">
                  {currentStatusConfig.description}
                </p>
              </div>
            ) : (
              /* Rejection Callout */
              <div className="pt-6 pb-2">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-left flex items-start gap-3">
                  <svg className="w-5 h-5 text-status-rejected flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-headline font-bold text-sm text-status-rejected block mb-1">
                      Reason for Closure / Decline:
                    </span>
                    <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
                      {report.rejectionReason ||
                        'This ticket was closed by facilities management (e.g. duplicate issue, equipment replaced, or inspection verified hardware was functioning normally).'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Community Multi-Report Boost Banner */}
            {report.reportCount > 1 && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <span className="text-xl">🔥</span>
                <div className="text-xs text-on-surface">
                  <span className="font-headline font-bold text-amber-900 block mb-0.5">
                    Elevated Campus Priority (Reported by {report.reportCount} students)
                  </span>
                  <span className="text-on-surface-variant leading-relaxed">
                    Multiple students have reported this exact equipment. Our automated system has boosted this ticket to accelerate technician dispatch.
                  </span>
                </div>
              </div>
            )}

            {/* Merged Notice */}
            {report.mergedInto && (
              <div className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <span className="text-xl">🔗</span>
                <div className="text-xs text-on-surface">
                  <span className="font-headline font-bold text-primary block mb-0.5">
                    Merged into Master Ticket
                  </span>
                  <span className="text-on-surface-variant leading-relaxed">
                    This fault was consolidated into master ticket{' '}
                    <button
                      type="button"
                      onClick={() => handleSelectRecent(report.mergedInto)}
                      className="font-mono font-bold text-primary underline hover:text-primary-container"
                    >
                      {report.mergedInto}
                    </button>{' '}
                    for unified batch servicing.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* 2-Column Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Equipment & Location Details */}
            <div className="md:col-span-7 space-y-6">
              <Card className="bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-7 rounded-3xl shadow-card">
                <h2 className="text-base font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Equipment & Location Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-outline uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                      Equipment Type
                    </span>
                    <span className="font-headline font-bold text-on-surface text-sm">
                      {report.deviceType}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-outline uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                      Asset / Tag Number
                    </span>
                    <span className="font-mono font-bold text-on-surface text-sm">
                      {report.deviceNumberVisible && report.deviceNumber
                        ? report.deviceNumber
                        : 'Not visible / Missing tag'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-outline uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                      Campus Building
                    </span>
                    <span className="font-headline font-bold text-on-surface text-sm">
                      {report.buildingName || 'Main Campus'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-outline uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                      Room / Lab Number
                    </span>
                    <span className="font-headline font-bold text-on-surface text-sm">
                      {report.roomName || 'Lab Room'}
                    </span>
                  </div>

                  {report.labType && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <span className="text-outline uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                        Laboratory Specialization
                      </span>
                      <span className="font-headline font-bold text-on-surface text-sm">
                        {report.labType}
                      </span>
                    </div>
                  )}

                  {report.resolvedAt && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-800 uppercase tracking-wider font-headline font-semibold text-[10px] block mb-1">
                        Resolved On
                      </span>
                      <span className="font-headline font-bold text-emerald-900 text-sm">
                        {formatDate(report.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Status Transition Audit Log */}
              {report.statusHistory && report.statusHistory.length > 0 && (
                <Card className="bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-7 rounded-3xl shadow-card">
                  <h2 className="text-base font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maintenance Activity Log
                  </h2>

                  <div className="space-y-4 relative pl-4 border-l-2 border-primary/20 ml-2">
                    {/* Initial Submission Log */}
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
                      <div className="text-xs">
                        <span className="font-headline font-bold text-on-surface block">
                          Report Received & Queued
                        </span>
                        <span className="text-[11px] text-outline font-sans">
                          {formatDate(report.createdAt)} • Automated Campus Intake
                        </span>
                      </div>
                    </div>

                    {/* Historical Updates */}
                    {report.statusHistory.map((hist) => (
                      <div key={hist.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-container ring-4 ring-surface-container-lowest"></span>
                        <div className="text-xs">
                          <span className="font-headline font-bold text-on-surface block">
                            Status updated to:{' '}
                            <span className="capitalize text-primary">
                              {hist.status.replace('_', ' ')}
                            </span>
                          </span>
                          <span className="text-[11px] text-outline font-sans">
                            {formatDate(hist.changedAt)} • {hist.changedBy || 'Facilities Staff'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Photo Evidence & Quick Actions */}
            <div className="md:col-span-5 space-y-6">
              {/* Photo Evidence Card */}
              {report.photoUrl && (
                <Card className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl shadow-card flex flex-col">
                  <h3 className="text-base font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Submitted Photo Evidence
                  </h3>

                  <div
                    onClick={() => setPreviewPhoto(true)}
                    className="relative rounded-2xl overflow-hidden border border-outline-variant/30 group cursor-pointer aspect-video bg-surface-container"
                  >
                    <img
                      src={getFullImageUrl(report.photoUrl)}
                      alt="Submitted fault evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-headline text-xs font-semibold backdrop-blur-xs">
                      <span className="bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Click to Enlarge
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions Card */}
              <Card className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl shadow-card flex flex-col gap-3">
                <h3 className="text-base font-headline font-bold text-on-surface mb-1">
                  Actions
                </h3>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/40 hover:border-primary text-xs font-headline font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <span className="text-status-resolved flex items-center gap-1 font-bold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Link Copied to Clipboard!
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Share / Copy Tracking Link</span>
                    </>
                  )}
                </button>

                <Link to="/report" className="w-full block">
                  <Button variant="outline" size="md" className="w-full">
                    Report Another Issue
                  </Button>
                </Link>

                <Link to="/" className="w-full block">
                  <button
                    type="button"
                    className="w-full py-2 text-xs font-sans text-outline hover:text-primary transition-colors text-center"
                  >
                    Return to CampusPlus Home
                  </button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {previewPhoto && report?.photoUrl && (
        <div
          onClick={() => setPreviewPhoto(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-surface-container-lowest rounded-3xl overflow-hidden shadow-modal border border-outline-variant/30"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20">
              <span className="font-headline font-bold text-sm text-on-surface">
                Fault Photo Evidence — {report.deviceType}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(false)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-black/90 flex items-center justify-center max-h-[75vh]">
              <img
                src={getFullImageUrl(report.photoUrl)}
                alt="Enlarged photo preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
