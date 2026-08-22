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
  const [detailModalReport, setDetailModalReport] = useState(null);

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
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card space-y-5"
            >
              {/* Flagged Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-needs-review animate-pulse"></span>
                  <span className="font-headline font-bold text-base text-on-surface">
                    Flagged Fault: <span className="capitalize">{report.deviceType.replace('_', ' ')}</span>
                  </span>
                  <span className="text-xs font-mono text-outline bg-surface-container px-2 py-0.5 rounded">
                    Tag: Missing / Illegible
                  </span>
                </div>
                <span className="text-xs font-sans text-on-surface-variant">
                  Location: <strong>{report.buildingName}</strong> — Room <strong>{report.roomName}</strong>
                </span>
              </div>

              {/* Side-by-Side 50/50 Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: Flagged / Incoming Unmatched Report */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
                      <span className="text-[11px] font-headline font-bold text-status-needs-review uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-needs-review"></span>
                        Incoming Unmatched Report
                      </span>
                      <span className="text-[11px] font-mono text-outline bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/30">
                        Pending Review
                      </span>
                    </div>

                    <div className="flex gap-4 items-start mb-4">
                      <div
                        onClick={() => setPreviewPhoto(getFullImageUrl(report.photoUrl))}
                        className="w-28 h-24 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 cursor-zoom-in relative group flex-shrink-0"
                      >
                        <img
                          src={getFullImageUrl(report.photoUrl)}
                          alt="Flagged evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-headline font-bold">
                          Zoom
                        </div>
                      </div>

                      <div className="min-w-0 text-xs font-sans space-y-1">
                        <span className="font-headline font-bold text-sm text-on-surface block capitalize truncate">
                          {report.deviceType.replace('_', ' ')}
                        </span>
                        <p className="text-on-surface-variant truncate">
                          <strong>Reporter:</strong> {report.reporters?.[0]?.studentCode} ({report.reporters?.[0]?.department})
                        </p>
                        {report.labType && (
                          <p className="text-on-surface-variant truncate">
                            <strong>Lab:</strong> {report.labType}
                          </p>
                        )}
                      </div>
                    </div>

                    {report.reporters?.[0]?.notes && (
                      <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-xs font-sans text-on-surface italic">
                        &quot;{report.reporters[0].notes}&quot;
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailModalReport(report)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKeepSeparate(report.id)}
                      disabled={processingAction}
                    >
                      Keep as Separate Ticket
                    </Button>
                  </div>
                </div>

                {/* Right: Suggested Candidate Matches */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
                      <span className="text-[11px] font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎯</span> Candidate Match in Same Room ({report.suggestedMatches?.length || 0})
                      </span>
                      <span className="text-[11px] font-sans text-on-surface-variant">
                        Room: <strong>{report.roomName}</strong>
                      </span>
                    </div>

                    {report.suggestedMatches && report.suggestedMatches.length > 0 ? (
                      <div className="space-y-3">
                        {report.suggestedMatches.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 shadow-sm space-y-3"
                          >
                            <div className="flex gap-3 items-start">
                              <div
                                onClick={() => setPreviewPhoto(getFullImageUrl(candidate.photoUrl))}
                                className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 cursor-zoom-in flex-shrink-0"
                              >
                                <img
                                  src={getFullImageUrl(candidate.photoUrl)}
                                  alt="Candidate evidence"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 text-xs font-sans space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-headline font-bold text-sm text-on-surface block capitalize truncate">
                                    {candidate.deviceType.replace('_', ' ')}
                                  </span>
                                  <Badge status={candidate.status} />
                                </div>
                                <p className="text-on-surface-variant">
                                  Master Asset Tag: <strong className="font-mono text-on-surface">{candidate.deviceNumber || 'N/A'}</strong>
                                </p>
                                <p className="text-[11px] text-on-surface-variant font-medium">
                                  {candidate.reportCount} Existing Student {candidate.reportCount === 1 ? 'Report' : 'Reports'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailModalReport(candidate)}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedFlagged(report);
                                  setSelectedTargetId(candidate.id);
                                }}
                                disabled={processingAction}
                              >
                                Merge Into This Ticket →
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-xl bg-surface-container-lowest text-center text-xs text-on-surface-variant border border-outline-variant/20 my-auto">
                        No open tickets found in Room {report.roomName}. Recommend keeping as a separate issue.
                      </div>
                    )}
                  </div>
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

      {/* Detailed Report Inspector Modal */}
      <Modal
        isOpen={Boolean(detailModalReport)}
        onClose={() => setDetailModalReport(null)}
        title={detailModalReport ? `Ticket Details: ${detailModalReport.deviceType?.replace('_', ' ')}` : 'Ticket Details'}
        maxWidth="max-w-2xl"
      >
        {detailModalReport && (
          <div className="space-y-5 text-xs font-sans">
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setPreviewPhoto(getFullImageUrl(detailModalReport.photoUrl))}
                  className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 cursor-zoom-in flex-shrink-0"
                >
                  <img
                    src={getFullImageUrl(detailModalReport.photoUrl)}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-on-surface capitalize">
                    {detailModalReport.deviceType?.replace('_', ' ')}
                  </h4>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Asset Tag: {detailModalReport.deviceNumber || 'N/A (Missing)'}
                  </span>
                </div>
              </div>
              <Badge status={detailModalReport.status || 'open'} />
            </div>

            {/* Location & Context Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block">
                  Campus Location
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {detailModalReport.buildingName} — Room {detailModalReport.roomName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block">
                  Laboratory Domain
                </span>
                <span className="font-medium text-on-surface mt-0.5 block truncate">
                  {detailModalReport.labType || 'General Lab'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block">
                  Total Complaints Filed
                </span>
                <span className="font-semibold text-primary mt-0.5 block">
                  {detailModalReport.reportCount || 1} Student Submission{detailModalReport.reportCount === 1 ? '' : 's'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block">
                  Logged At
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {detailModalReport.createdAt ? new Date(detailModalReport.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Recently'}
                </span>
              </div>
            </div>

            {/* Reporter Information & Student Notes */}
            {detailModalReport.reporters && detailModalReport.reporters.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface block">
                  Attached Student Submissions ({detailModalReport.reporters.length})
                </span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {detailModalReport.reporters.map((rep, idx) => (
                    <div key={rep.id || idx} className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-headline font-bold text-on-surface">
                          Student {rep.studentCode}
                        </span>
                        <span className="text-on-surface-variant">
                          {rep.department} {rep.yearSemester ? `· ${rep.yearSemester}` : ''}
                        </span>
                      </div>
                      {rep.notes && (
                        <p className="text-xs italic text-on-surface bg-surface-container-low p-2 rounded border border-outline-variant/20">
                          &quot;{rep.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action Link */}
            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
              <Link
                to={`/reports/${detailModalReport.id}`}
                target="_blank"
                className="text-xs font-headline font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Open Full Dedicated Ticket Page ↗
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalReport(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
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
