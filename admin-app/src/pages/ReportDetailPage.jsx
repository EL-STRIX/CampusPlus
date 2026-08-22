import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReportById, updateReportStatus } from '../api/admin';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Textarea } from '../components/FormField';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(null);
  const [rejectError, setRejectError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url}`;
  };

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportById(id);
      setReport(data);
      setNewStatus(data.status);
    } catch (err) {
      setError(err.message || 'Failed to load report detail.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleStatusChangeRequest = async (e) => {
    e.preventDefault();
    setStatusSuccess(null);

    if (newStatus === report.status) {
      return;
    }

    if (newStatus === 'rejected') {
      setRejectionReason('');
      setRejectError(null);
      setShowRejectModal(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateReportStatus(id, { status: newStatus });
      setStatusSuccess(`Status successfully updated to "${newStatus.replace('_', ' ')}".`);
      await loadReport();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Please provide a specific reason for rejecting this report.');
      return;
    }

    try {
      setUpdatingStatus(true);
      setRejectError(null);
      await updateReportStatus(id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectModal(false);
      setStatusSuccess('Report marked as rejected with reason.');
      await loadReport();
    } catch (err) {
      setRejectError(err.message || 'Failed to reject report.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-headline font-semibold text-on-surface-variant">
          Loading report details...
        </span>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center">
        <div className="p-6 bg-red-50 rounded-2xl border border-status-rejected/30 text-status-rejected mb-4">
          <p className="font-headline font-bold text-base mb-1">Report Not Found</p>
          <p className="text-xs">{error}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/reports')}>
          Back to All Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-headline font-semibold text-primary hover:underline mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reports List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight flex items-center gap-3">
              <span>
                Report: <span className="capitalize">{report.deviceType.replace('_', ' ')}</span>
              </span>
              {report.deviceNumber && (
                <span className="font-mono text-sm font-normal px-2.5 py-0.5 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                  {report.deviceNumber}
                </span>
              )}
            </h2>
            <span className="text-xs font-sans text-on-surface-variant mt-1 block">
              Submitted on{' '}
              {new Date(report.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={report.status} />
            {report.reportCount > 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-red-50 text-status-rejected border border-status-rejected/30">
                {report.reportCount} Student Reports
              </span>
            )}
          </div>
        </div>
      </div>

      {statusSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{statusSuccess}</span>
          <button onClick={() => setStatusSuccess(null)} className="text-status-resolved hover:opacity-70">
            ×
          </button>
        </div>
      )}

      {/* Top 2-Column Grid: Photo & Device Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Device Evidence Photo */}
        <div className="md:col-span-5 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
          <span className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
            Evidence Photo
          </span>
          <div
            onClick={() => setPreviewPhoto(true)}
            className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30 relative group cursor-zoom-in shadow-inner"
          >
            <img
              src={getFullImageUrl(report.photoUrl)}
              alt="Equipment Fault Evidence"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-headline font-semibold gap-1.5 backdrop-blur-[2px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              Click to Zoom
            </div>
          </div>
        </div>

        {/* Right: Info & Status Workflow */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <Card title="Device & Location Details">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Device Type
                </span>
                <span className="text-sm font-headline font-semibold text-on-surface capitalize">
                  {report.deviceType.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Asset Tag Number
                </span>
                <span className="text-sm font-mono font-medium text-on-surface">
                  {report.deviceNumber || <span className="text-outline italic">Missing / Tag not visible</span>}
                </span>
              </div>

              <div className="col-span-2 pt-2 border-t border-outline-variant/20">
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Campus Location
                </span>
                <span className="text-sm font-sans font-medium text-on-surface flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {report.buildingName} — Room {report.roomName}
                </span>
              </div>

              {report.labType && (
                <div className="col-span-2 pt-2 border-t border-outline-variant/20">
                  <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Laboratory Type
                  </span>
                  <span className="text-sm font-sans font-medium text-on-surface">
                    {report.labType}
                  </span>
                </div>
              )}

              {report.rejectionReason && (
                <div className="col-span-2 p-3.5 rounded-xl bg-red-50 border border-status-rejected/30 text-xs text-status-rejected">
                  <span className="font-headline font-bold block mb-0.5">Rejection Reason:</span>
                  <span>{report.rejectionReason}</span>
                </div>
              )}
            </div>

            {/* Status Update Control */}
            <form onSubmit={handleStatusChangeRequest} className="pt-4 border-t border-outline-variant/20">
              <label htmlFor="statusSelect" className="text-xs font-headline font-bold text-on-surface block mb-2">
                Update Ticket Status
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-grow text-xs font-sans px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
                >
                  <option value="open">Open (Unassigned / Pending)</option>
                  <option value="in_progress">In Progress (Under Repair)</option>
                  <option value="resolved">Resolved (Repaired / Operational)</option>
                  <option value="rejected">Rejected (Invalid / Duplicate / Unactionable)</option>
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={newStatus === report.status || updatingStatus}
                  loading={updatingStatus}
                >
                  Save Status
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Bottom 2-Column Layout: Reporters & Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Reporters List */}
        <div className="lg:col-span-7">
          <Card
            title={`Reporters (${report.reporters?.length || 0})`}
            subtitle="Students who have flagged this issue"
            bodyClassName="p-0"
          >
            <div className="divide-y divide-outline-variant/20">
              {report.reporters && report.reporters.length > 0 ? (
                report.reporters.map((rep, idx) => (
                  <div key={rep.id || idx} className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline font-bold text-sm flex-shrink-0">
                      {rep.studentCode.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-headline font-bold text-sm text-on-surface">
                          Student {rep.studentCode}
                        </span>
                        <span className="text-[11px] font-sans text-on-surface-variant">
                          {new Date(rep.reportedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant mb-2">
                        <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                          {rep.department}
                        </span>
                        <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                          {rep.stream}
                        </span>
                        {rep.labType && (
                          <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded border border-primary/20">
                            {rep.labType}
                          </span>
                        )}
                        {rep.yearSemester && (
                          <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                            {rep.yearSemester}
                          </span>
                        )}
                      </div>
                      {rep.notes && (
                        <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-sans text-on-surface italic">
                          &quot;{rep.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No reporter records attached.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Status History Timeline */}
        <div className="lg:col-span-5">
          <Card title="Status History Audit Log" subtitle="Tracked transitions by facilities staff">
            <div className="relative border-l-2 border-outline-variant/40 ml-3 space-y-6 py-2">
              {/* Initial Report Creation */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-status-open rounded-full border-2 border-surface-container-lowest"></div>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-xs text-on-surface">
                    Report Created
                  </span>
                  <span className="text-[11px] font-sans text-on-surface-variant mt-0.5">
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="mt-1">
                    <Badge status="open" />
                  </div>
                </div>
              </div>

              {/* Status History Rows */}
              {report.statusHistory &&
                report.statusHistory.map((hist) => (
                  <div key={hist.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 bg-primary rounded-full border-2 border-surface-container-lowest"></div>
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-xs text-on-surface">
                        Status updated by {hist.changedBy}
                      </span>
                      <span className="text-[11px] font-sans text-on-surface-variant mt-0.5">
                        {new Date(hist.changedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="mt-1">
                        <Badge status={hist.status} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Maintenance Report"
      >
        <div className="space-y-4">
          <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
            Please enter a mandatory rejection reason (e.g. invalid report, hardware already replaced, duplicate of another issue).
          </p>

          <Textarea
            label="Rejection Reason"
            id="rejectionReason"
            placeholder="Explain why this report is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={rejectError}
            required
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectModal(false)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRejection}
              loading={updatingStatus}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Full Modal */}
      <Modal
        isOpen={previewPhoto}
        onClose={() => setPreviewPhoto(false)}
        title="Equipment Fault Evidence"
        maxWidth="max-w-3xl"
      >
        <div className="flex justify-center">
          <img
            src={getFullImageUrl(report.photoUrl)}
            alt="Full Evidence"
            className="max-h-[75vh] w-auto object-contain rounded-xl border border-outline-variant/30"
          />
        </div>
      </Modal>
    </div>
  );
}
