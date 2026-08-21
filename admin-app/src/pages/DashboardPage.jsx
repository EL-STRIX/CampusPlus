import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardSummary, getReports } from '../api/admin';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Modal from '../components/Modal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    needsReview: 0,
    totalToday: 0,
  });
  const [topReports, setTopReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [summaryData, reportsData] = await Promise.all([
          getDashboardSummary(),
          getReports({ sortBy: 'reportCount', sortOrder: 'desc', limit: 6, status: 'open' }),
        ]);
        setSummary(summaryData);
        setTopReports(reportsData.reports || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">
            Facilities Overview
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1">
            Real-time status of campus hardware tickets and prioritized repairs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/needs-review"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-needs-review/10 text-status-needs-review border border-status-needs-review/30 font-headline font-bold text-sm hover:bg-status-needs-review/20 transition-colors"
          >
            <span>Needs Review</span>
            <span className="px-2 py-0.5 rounded-full bg-status-needs-review text-white text-xs">
              {summary.needsReview}
            </span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-sm font-medium">
          {error}
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Open Card */}
        <div
          onClick={() => navigate('/reports?status=open')}
          className="bg-surface-container-lowest rounded-xl p-6 border-t-4 border-status-open border-x border-b border-outline-variant/20 shadow-card hover:-translate-y-1 hover:shadow-float transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-eyebrow text-eyebrow text-on-surface-variant uppercase tracking-wider block">
                Total Open
              </span>
              <span className="text-3xl lg:text-4xl font-headline font-extrabold text-primary mt-2 block">
                {loading ? '...' : summary.open}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-status-open flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-on-surface-variant mt-4 block">
            Awaiting maintenance assignment
          </span>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => navigate('/reports?status=in_progress')}
          className="bg-surface-container-lowest rounded-xl p-6 border-t-4 border-status-in-progress border-x border-b border-outline-variant/20 shadow-card hover:-translate-y-1 hover:shadow-float transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-eyebrow text-eyebrow text-on-surface-variant uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-3xl lg:text-4xl font-headline font-extrabold text-primary mt-2 block">
                {loading ? '...' : summary.inProgress}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-status-in-progress flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-on-surface-variant mt-4 block">
            Currently undergoing repair
          </span>
        </div>

        {/* Resolved Card */}
        <div
          onClick={() => navigate('/reports?status=resolved')}
          className="bg-surface-container-lowest rounded-xl p-6 border-t-4 border-status-resolved border-x border-b border-outline-variant/20 shadow-card hover:-translate-y-1 hover:shadow-float transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-eyebrow text-eyebrow text-on-surface-variant uppercase tracking-wider block">
                Resolved
              </span>
              <span className="text-3xl lg:text-4xl font-headline font-extrabold text-primary mt-2 block">
                {loading ? '...' : summary.resolved}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-status-resolved flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-on-surface-variant mt-4 block">
            Repairs completed
          </span>
        </div>

        {/* Needs Review Card */}
        <div
          onClick={() => navigate('/needs-review')}
          className="bg-surface-container-lowest rounded-xl p-6 border-t-4 border-status-needs-review border-x border-b border-outline-variant/20 shadow-card hover:-translate-y-1 hover:shadow-float transition-all duration-200 cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-eyebrow text-eyebrow text-on-surface-variant uppercase tracking-wider block">
                Needs Review
              </span>
              <span className="text-3xl lg:text-4xl font-headline font-extrabold text-primary mt-2 block">
                {loading ? '...' : summary.needsReview}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-status-needs-review flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-status-needs-review font-medium mt-4 block">
            Flagged duplicate review queue
          </span>
        </div>
      </section>

      {/* Top Priority Reports Table */}
      <Card
        title="Top Priority Reports"
        subtitle="Open issues ranked by student report frequency"
        action={
          <Link
            to="/reports"
            className="text-xs font-headline font-bold text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
          >
            <span>View All Reports</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3.5 px-6">Photo</th>
                <th className="py-3.5 px-6">Device</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Report Count</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-sans text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant text-sm">
                    <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                    <p>Loading top priority reports...</p>
                  </td>
                </tr>
              ) : topReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant text-sm">
                    No active open reports found. All campus equipment is operational!
                  </td>
                </tr>
              ) : (
                topReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <td className="py-3.5 px-6" onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={() => setPreviewPhoto(getFullImageUrl(report.photoUrl))}
                        className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30 hover:opacity-80 transition-opacity cursor-zoom-in flex-shrink-0"
                      >
                        <img
                          src={getFullImageUrl(report.photoUrl)}
                          alt="Device preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-headline font-semibold text-on-surface">
                      <span className="capitalize block">{report.deviceType.replace('_', ' ')}</span>
                      {report.deviceNumber && (
                        <span className="font-mono text-xs text-on-surface-variant font-normal">
                          Tag: {report.deviceNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-on-surface-variant text-xs">
                      <span className="font-semibold text-on-surface block">{report.buildingName}</span>
                      <span>Room {report.roomName}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-headline font-bold ${
                          report.reportCount > 1
                            ? 'bg-red-50 text-status-rejected border border-status-rejected/30'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {report.reportCount} {report.reportCount === 1 ? 'Report' : 'Reports'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={report.status} />
                    </td>
                    <td className="py-3.5 px-6 text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors inline-block"
                        title="View Report"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Photo Preview Modal */}
      <Modal
        isOpen={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        title="Evidence Photo"
        maxWidth="max-w-2xl"
      >
        {previewPhoto && (
          <div className="flex flex-col items-center">
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
