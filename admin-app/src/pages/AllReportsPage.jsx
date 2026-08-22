import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getReports, getBuildings, getDepartments } from '../api/admin';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';

const DEVICE_TYPES = [
  { value: 'cpu', label: 'Computer Workstation / CPU' },
  { value: 'monitor', label: 'Display Monitor' },
  { value: 'keyboard', label: 'Computer Keyboard' },
  { value: 'mouse', label: 'Optical Mouse' },
  { value: 'projector', label: 'Ceiling / Desktop Projector' },
  { value: 'ac', label: 'Air Conditioner / HVAC' },
  { value: 'fan', label: 'Ceiling / Wall Fan' },
  { value: 'light', label: 'Tubelight / LED Lighting' },
  { value: 'ups', label: 'UPS Power Unit' },
  { value: 'ethernet_cable', label: 'LAN / Ethernet Cable' },
  { value: 'hdmi_cable', label: 'HDMI Cable' },
  { value: 'other_cable', label: 'Power Cable' },
  { value: 'other', label: 'Other Hardware' },
];

export default function AllReportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State from URL params
  const statusParam = searchParams.get('status') || '';
  const searchParam = searchParams.get('search') || '';
  const buildingParam = searchParams.get('buildingId') || '';
  const departmentParam = searchParams.get('department') || '';
  const deviceTypeParam = searchParams.get('deviceType') || '';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';
  const sortByParam = searchParams.get('sortBy') || 'reportCount';
  const sortOrderParam = searchParams.get('sortOrder') || 'desc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local Data State
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalReports: 0 });
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(searchParam);

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBase}${url}`;
  };

  // Fetch reference dropdown options
  useEffect(() => {
    async function loadFiltersData() {
      try {
        const [bldgs, depts] = await Promise.all([getBuildings(), getDepartments()]);
        setBuildings(bldgs || []);
        setDepartments(depts || []);
      } catch {
        // Suppress reference load warning
      }
    }
    loadFiltersData();
  }, []);

  // Fetch reports list matching active filters
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageParam,
        limit: 15,
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
      };

      if (statusParam) params.status = statusParam;
      if (searchParam) params.search = searchParam;
      if (buildingParam) params.buildingId = buildingParam;
      if (departmentParam) params.department = departmentParam;
      if (deviceTypeParam) params.deviceType = deviceTypeParam;
      if (dateFromParam) params.dateFrom = dateFromParam;
      if (dateToParam) params.dateTo = dateToParam;

      const data = await getReports(params);
      setReports(data.reports || []);
      setPagination(data.pagination || { page: 1, limit: 15, totalPages: 1, totalReports: 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  }, [
    statusParam,
    searchParam,
    buildingParam,
    departmentParam,
    deviceTypeParam,
    dateFromParam,
    dateToParam,
    sortByParam,
    sortOrderParam,
    pageParam,
  ]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Update query params helper
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(statusParam || searchParam || buildingParam || departmentParam || deviceTypeParam || dateFromParam || dateToParam);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Search Bar */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
              All Equipment Reports
            </h2>
            <p className="text-xs font-sans text-on-surface-variant mt-1">
              Search, filter, and review campus hardware tickets.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Student, Tag #..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-sans rounded-lg border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </form>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-outline-variant/20">
          {/* Status Filter */}
          <select
            value={statusParam}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="text-xs font-sans px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="">Status: All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Building Filter */}
          <select
            value={buildingParam}
            onChange={(e) => updateFilter('buildingId', e.target.value)}
            className="text-xs font-sans px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="">Building: All</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentParam}
            onChange={(e) => updateFilter('department', e.target.value)}
            className="text-xs font-sans px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Device Type Filter */}
          <select
            value={deviceTypeParam}
            onChange={(e) => updateFilter('deviceType', e.target.value)}
            className="text-xs font-sans px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="">Device: All</option>
            {DEVICE_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={`${sortByParam}_${sortOrderParam}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              const next = new URLSearchParams(searchParams);
              next.set('sortBy', sb);
              next.set('sortOrder', so);
              setSearchParams(next);
            }}
            className="text-xs font-sans px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="reportCount_desc">Sort: Most Reported (Priority)</option>
            <option value="createdAt_desc">Sort: Newest First</option>
            <option value="createdAt_asc">Sort: Oldest First</option>
            <option value="status_asc">Sort: By Status</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-headline font-semibold text-primary hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-sm font-medium">
          {error}
        </div>
      )}

      {/* Reports Table Card */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3.5 px-6">Photo</th>
                <th className="py-3.5 px-6">Device & Tag</th>
                <th className="py-3.5 px-6">Room / Location</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Reported At</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-sans text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-on-surface-variant">
                    <div className="inline-block w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Fetching reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-on-surface-variant">
                    <p className="font-headline font-bold text-base mb-1">No reports found</p>
                    <p className="text-xs text-outline">Try adjusting or clearing your search filters.</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
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
                          alt="Device thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-headline font-semibold text-on-surface">
                      <span className="capitalize block">{report.deviceType.replace('_', ' ')}</span>
                      {report.deviceNumber ? (
                        <span className="font-mono text-xs text-on-surface-variant font-normal">
                          Tag: {report.deviceNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] text-outline italic font-normal">
                          No tag visible
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface block">{report.buildingName}</span>
                      <span>Room {report.roomName}</span>
                      {report.labType && (
                        <span className="block text-[11px] text-primary font-medium truncate max-w-[200px]">
                          {report.labType}
                        </span>
                      )}
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
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:border-primary hover:text-primary text-xs font-headline font-semibold transition-colors inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-3 bg-surface-container-lowest">
          <span className="text-xs font-sans text-on-surface-variant">
            Showing <strong>{reports.length}</strong> of <strong>{pagination.totalReports}</strong> total reports
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => updateFilter('page', (pagination.page - 1).toString())}
            >
              Previous
            </Button>
            <span className="text-xs font-headline font-semibold text-on-surface px-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => updateFilter('page', (pagination.page + 1).toString())}
            >
              Next
            </Button>
          </div>
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
