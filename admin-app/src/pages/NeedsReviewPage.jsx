import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getNeedsReviewReports, mergeReport, keepReportSeparate } from '../api/admin';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function NeedsReviewPage() {
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Merge modal state
  const [selectedFlagged, setSelectedFlagged] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url}`;
  };

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNeedsReviewReports();
      setFlaggedReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Handle Keep Separate action
  const handleKeepSeparate = async (reportId) => {
    try {
      setProcessingAction(true);
      setActionSuccess(null);
      await keepReportSeparate(reportId);
      setActionSuccess('Report kept as a separate independent ticket.');
      await loadQueue();
    } catch (err) {
      setError(err.message || 'Failed to update report.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Merge confirmation
  const handleConfirmMerge = async () => {
    if (!selectedFlagged || !selectedTargetId) {
      return;
    }

    try {
      setProcessingAction(true);
      setActionSuccess(null);
      await mergeReport(selectedFlagged.id, selectedTargetId);
      setSelectedFlagged(null);
      setSelectedTargetId('');
      setActionSuccess('Reports successfully merged into single master ticket.');
      await loadQueue();
    } catch (err) {
      setError(err.message || 'Failed to merge reports.');
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight flex items-center gap-3">
            <span>Needs Review Queue</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-status-needs-review/10 text-status-needs-review border border-status-needs-review/30">
              {flaggedReports.length} Flagged
            </span>
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1">
            Reports with missing asset tags requiring manual admin verification against open candidate tickets in the same room.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-status-resolved hover:opacity-70">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-on-surface-variant">
          <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-headline font-semibold">Loading review queue...</p>
        </div>
      ) : flaggedReports.length === 0 ? (
        <Card bodyClassName="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-status-resolved/10 text-status-resolved flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            Review Queue is Clear!
          </h3>
          <p className="text-xs font-sans text-on-surface-variant max-w-md mx-auto">
            No equipment reports currently require manual deduplication review.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {flaggedReports.map((report) => (
            <div
              key={report.id}
              className="bg-surface-container-lowest rounded-2xl border-2 border-status-needs-review/30 p-6 md:p-8 shadow-card space-y-6"
            >
              {/* Flagged Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-status-needs-review animate-pulse"></span>
                  <span className="font-headline font-bold text-base text-on-surface">
                    Flagged Fault: <span className="capitalize">{report.deviceType.replace('_', ' ')}</span>
                  </span>
                  <span className="text-xs font-mono text-outline bg-surface-container px-2 py-0.5 rounded">
                    Tag: N/A (Missing)
                  </span>
                </div>
                <span className="text-xs font-sans text-on-surface-variant">
                  Location: <strong>{report.buildingName}</strong> — Room <strong>{report.roomName}</strong>
                </span>
              </div>

              {/* Side by Side Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Flagged Report Card (Left) */}
                <div className="lg:col-span-5 bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
                  <span className="text-[11px] font-headline font-bold text-status-needs-review uppercase tracking-wider">
                    Newly Submitted Report (Pending Review)
                  </span>
                  <div
                    onClick={() => setPreviewPhoto(getFullImageUrl(report.photoUrl))}
                    className="w-full h-44 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 cursor-zoom-in relative group"
                  >
                    <img
                      src={getFullImageUrl(report.photoUrl)}
                      alt="Flagged evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-headline font-bold">
                      Click to Zoom
                    </div>
                  </div>

                  {report.reporters && report.reporters[0] && (
                    <div className="text-xs font-sans text-on-surface-variant space-y-1 pt-2 border-t border-outline-variant/20">
                      <p>
                        <strong>Reporter:</strong> Student {report.reporters[0].studentCode} ({report.reporters[0].department})
                      </p>
                      {report.labType && (
                        <p>
                          <strong>Lab:</strong> {report.labType}
                        </p>
                      )}
                      {report.reporters[0].notes && (
                        <p className="italic bg-surface-container-lowest p-2.5 rounded border border-outline-variant/20 text-on-surface">
                          &quot;{report.reporters[0].notes}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKeepSeparate(report.id)}
                      disabled={processingAction}
                    >
                      Keep as Separate Issue
                    </Button>
                  </div>
                </div>

                {/* Candidate Matches Column (Right) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <span className="text-[11px] font-headline font-bold text-on-surface uppercase tracking-wider">
                    Suggested Candidate Matches in Room {report.roomName} ({report.suggestedMatches?.length || 0})
                  </span>

                  {report.suggestedMatches && report.suggestedMatches.length > 0 ? (
                    <div className="space-y-3">
                      {report.suggestedMatches.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              onClick={() => setPreviewPhoto(getFullImageUrl(candidate.photoUrl))}
                              className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 cursor-zoom-in flex-shrink-0"
                            >
                              <img
                                src={getFullImageUrl(candidate.photoUrl)}
                                alt="Candidate evidence"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 text-xs font-sans">
                              <span className="font-headline font-bold text-sm text-on-surface block capitalize">
                                {candidate.deviceType.replace('_', ' ')}
                              </span>
                              <span className="text-on-surface-variant block">
                                Asset Tag: <strong>{candidate.deviceNumber || 'N/A'}</strong>
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge status={candidate.status} />
                                <span className="text-[11px] text-outline">
                                  {candidate.reportCount} existing reports
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                            <Link
                              to={`/reports/${candidate.id}`}
                              className="px-2.5 py-1 rounded border border-outline-variant/50 hover:bg-surface-container text-xs font-headline font-semibold text-on-surface transition-colors"
                            >
                              View Ticket
                            </Link>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedFlagged(report);
                                setSelectedTargetId(candidate.id);
                              }}
                              disabled={processingAction}
                            >
                              Merge Here
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant border border-outline-variant/20">
                      No open matching equipment found in this room. Recommend keeping as a separate issue.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merge Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedFlagged && selectedTargetId)}
        onClose={() => {
          setSelectedFlagged(null);
          setSelectedTargetId('');
        }}
        title="Confirm Report Merge"
      >
        <div className="space-y-4">
          <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
            Are you sure you want to merge this report into the selected ticket? All student reporter details and evidence notes will be transferred to elevate the master ticket&apos;s priority.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFlagged(null);
                setSelectedTargetId('');
              }}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmMerge}
              loading={processingAction}
            >
              Confirm & Merge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Preview Modal */}
      <Modal
        isOpen={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        title="Evidence Photo"
        maxWidth="max-w-2xl"
      >
        {previewPhoto && (
          <div className="flex justify-center">
            <img
              src={previewPhoto}
              alt="Full Evidence"
              className="max-h-[70vh] w-auto object-contain rounded-lg border border-outline-variant/30"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
