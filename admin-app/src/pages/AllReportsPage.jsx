import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getReports, getDepartments, getBuildings } from '../api/admin';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';

// Base facility & electrical hardware common across all campus labs
const COMMON_LAB_FACILITIES = [
  { value: 'Ceiling / Wall Air Conditioner (AC)', label: 'Ceiling / Wall Air Conditioner (AC)' },
  { value: 'Ceiling / Wall Fan', label: 'Ceiling / Wall Fan' },
  { value: 'Tubelight / LED Panel Lighting', label: 'Tubelight / LED Panel Lighting' },
  { value: 'Ceiling Projector / Smart Screen', label: 'Ceiling Projector / Smart Screen' },
  { value: 'Central UPS / Power Backup Inverter', label: 'Central UPS / Power Backup Inverter' },
  { value: 'Power Extension Strip / Spike Buster / Switchboard', label: 'Power Strip / Switchboard' },
  { value: 'LAN / Ethernet Wall Port & Network Switch', label: 'LAN Wall Port / Network Switch' },
  { value: 'Exhaust Fan / Lab Ventilation Unit', label: 'Exhaust Fan / Lab Ventilation Unit' },
];

// Comprehensive catalogue of devices
const ALL_DEVICES_LIST = [
  { value: 'CPU / Computer Workstation', label: 'CPU / Computer Workstation' },
  { value: 'Display Monitor', label: 'Display Monitor' },
  { value: 'Computer Keyboard', label: 'Computer Keyboard' },
  { value: 'Optical Mouse', label: 'Optical Mouse' },
  { value: 'GPU Deep Learning Workstation (NVIDIA / CUDA)', label: 'GPU Deep Learning Workstation (NVIDIA / CUDA)' },
  { value: 'High-Resolution Visual Display Monitor', label: 'High-Resolution Visual Display Monitor' },
  { value: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)', label: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)' },
  { value: 'Computer Vision Depth Camera / LiDAR Sensor', label: 'Computer Vision Depth Camera / LiDAR Sensor' },
  { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
  { value: 'Function / Signal Generator (AFG/RF)', label: 'Function / Signal Generator (AFG / RF)' },
  { value: 'Regulated DC Power Supply (RPS)', label: 'Regulated DC Power Supply (RPS)' },
  { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
  { value: 'FPGA / CPLD Development Board', label: 'FPGA / CPLD Development Board' },
  { value: '8085 / 8086 Microprocessor Trainer Kit', label: '8085 / 8086 Microprocessor Trainer Kit' },
  { value: 'Microcontroller (8051 / ARM / PIC / STM32) Trainer Kit', label: 'Microcontroller Trainer Kit' },
  { value: 'VLSI CAD Workstation & Hardware Emulator', label: 'VLSI CAD Workstation & Hardware Emulator' },
  { value: 'Soldering Station & De-soldering Tool', label: 'Soldering Station & De-soldering Tool' },
  { value: '3D Printer / Rapid Prototyping Machine', label: '3D Printer / Rapid Prototyping Machine' },
  { value: 'Robotic Arm / Articulated Manipulator', label: 'Robotic Arm / Articulated Manipulator' },
  { value: 'PLC (Programmable Logic Controller) Trainer Kit', label: 'PLC (Programmable Logic Controller) Trainer Kit' },
  { value: 'SCADA Workstation & HMI Touch Panel', label: 'SCADA Workstation & HMI Touch Panel' },
  { value: 'EV Motor (BLDC/PMSM) & Controller Test Bench', label: 'EV Motor (BLDC/PMSM) Test Bench' },
  { value: 'Battery Management System (BMS) Test Rig', label: 'Battery Management System (BMS) Test Rig' },
  { value: 'Li-Ion Battery Pack Testing & Cycler Station', label: 'Li-Ion Battery Pack Testing Station' },
  { value: 'AC / DC Motor-Generator (MG) Set', label: 'AC / DC Motor-Generator (MG) Set' },
  { value: '1-Phase / 3-Phase Auto-Transformer (Variac)', label: '1-Phase / 3-Phase Auto-Transformer (Variac)' },
  { value: 'Universal Testing Machine (UTM) Digital Console', label: 'Universal Testing Machine (UTM)' },
  { value: 'Compression Testing Machine (CTM)', label: 'Compression Testing Machine (CTM)' },
  { value: 'Electronic Total Station (Digital Theodolite)', label: 'Electronic Total Station (Theodolite)' },
  { value: 'UV-Visible Spectrophotometer', label: 'UV-Visible Spectrophotometer' },
  { value: 'Digital pH / Ion Meter', label: 'Digital pH / Ion Meter' },
  { value: 'HPLC / Chromatography System Console', label: 'HPLC / Chromatography System' },
  { value: 'PCR (Thermal Cycler) Machine', label: 'PCR (Thermal Cycler) Machine' },
  { value: 'Gel Electrophoresis Power Supply Unit', label: 'Gel Electrophoresis Power Supply' },
  { value: 'Compound Trinocular Research Microscope', label: 'Compound Trinocular Research Microscope' },
  { value: 'ECG / EKG Patient Simulator & Monitor', label: 'ECG / EKG Patient Simulator & Monitor' },
  { value: 'Digital Pulse Oximeter & Multi-Para Patient Monitor', label: 'Digital Pulse Oximeter & Patient Monitor' },
  { value: 'DSLR / 4K Cinema Camera & Camcorder', label: 'DSLR / 4K Cinema Camera & Camcorder' },
  { value: 'Studio Condenser Microphone & Preamp', label: 'Studio Condenser Microphone & Preamp' },
  { value: 'Audio Mixing Console & USB Audio Interface', label: 'Audio Mixing Console & Audio Interface' },
  { value: 'VR Headset (Meta Quest / HTC Vive)', label: 'VR Headset (Meta Quest / HTC Vive)' },
  { value: 'He-Ne / Diode Laser Source & Optical Rail', label: 'He-Ne / Diode Laser Source & Optical Rail' },
  { value: 'Michelson Interferometer Optical Bench', label: 'Michelson Interferometer Optical Bench' },
  { value: 'Smart Soldering & Desoldering Workstation', label: 'Smart Soldering & Desoldering Workstation' },
  { value: 'Laser Cutting & Engraving Machine', label: 'Laser Cutting & Engraving Machine' },
  { value: 'LAN / Ethernet Cable', label: 'LAN / Ethernet Cable' },
  { value: 'HDMI / DisplayPort Cable', label: 'HDMI / DisplayPort Cable' },
  { value: 'Network Switch / Patch Panel', label: 'Network Switch / Patch Panel' },
  { value: 'Server Rack Mount / Dedicated Server', label: 'Server Rack Mount / Dedicated Server' },
  { value: 'Lab WiFi Access Point Router', label: 'Lab WiFi Access Point Router' },
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
  const sortByParam = searchParams.get('sortBy') || 'status_workflow';
  const sortOrderParam = searchParams.get('sortOrder') || 'asc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local Data State
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalReports: 0 });
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Available equipment options
  const availableEquipment = useMemo(() => {
    return [...COMMON_LAB_FACILITIES, ...ALL_DEVICES_LIST];
  }, []);

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
        const [depts, bldgs] = await Promise.all([getDepartments(), getBuildings()]);
        setDepartments(depts || []);
        setBuildings(bldgs || []);
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

  const hasActiveFilters = Boolean(
    statusParam ||
    searchParam ||
    buildingParam ||
    departmentParam ||
    deviceTypeParam ||
    dateFromParam ||
    dateToParam
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls Panel */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-card space-y-5">
        {/* Top: Title & Count & Reset Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                All Equipment Reports
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-headline font-bold bg-primary/10 text-primary border border-primary/20">
                {pagination.totalReports} {pagination.totalReports === 1 ? 'Report' : 'Reports'}
              </span>
            </div>
            <p className="text-xs font-sans text-on-surface-variant mt-1">
              Search, filter, categorize, and manage campus hardware tickets across all facilities.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-headline font-bold text-status-rejected hover:bg-rose-100/70 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 transition-all shadow-sm flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          )}
        </div>

        {/* Middle: Omni Search Bar & Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
          {/* Omni Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by student roll, asset tag, room, building, device, or problem description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/60 shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilter('search', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-container"
              >
                ×
              </button>
            )}
          </form>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0 md:w-80">
            <select
              value={`${sortByParam}_${sortOrderParam}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                const next = new URLSearchParams(searchParams);
                next.set('sortBy', sb);
                next.set('sortOrder', so);
                next.set('page', '1');
                setSearchParams(next);
              }}
              className="w-full appearance-none text-xs font-headline font-semibold pl-3.5 pr-8 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest focus:border-primary focus:outline-none transition-colors cursor-pointer shadow-sm"
            >
              <option value="status_workflow_asc">⚡ Sort: Open (Newest First) → In Progress → Solved</option>
              <option value="createdAt_desc">🕒 Sort: All Newest First</option>
              <option value="createdAt_asc">⏳ Sort: All Oldest First</option>
              <option value="reportCount_desc">🔥 Sort: Priority (Most Reported)</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Bottom: 4 Structured Filter Columns */}
        <div className="pt-3 border-t border-outline-variant/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-headline font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Status
              </label>
              <div className="relative">
                <select
                  value={statusParam}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className={`w-full appearance-none text-xs font-sans pl-3.5 pr-8 py-2.5 rounded-xl border ${
                    statusParam
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest'
                  } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
                >
                  <option value="">All Statuses</option>
                  <option value="open">🟢 Open (New Ticket)</option>
                  <option value="in_progress">🟡 In Progress (Repairing)</option>
                  <option value="resolved">🔵 Resolved (Fixed)</option>
                  <option value="rejected">🔴 Rejected (Closed)</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 2. Department Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-headline font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Department
              </label>
              <div className="relative">
                <select
                  value={departmentParam}
                  onChange={(e) => updateFilter('department', e.target.value)}
                  className={`w-full appearance-none text-xs font-sans pl-3.5 pr-8 py-2.5 rounded-xl border truncate ${
                    departmentParam
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest'
                  } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 3. Campus Building Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-headline font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Campus Building
              </label>
              <div className="relative">
                <select
                  value={buildingParam}
                  onChange={(e) => updateFilter('buildingId', e.target.value)}
                  className={`w-full appearance-none text-xs font-sans pl-3.5 pr-8 py-2.5 rounded-xl border truncate ${
                    buildingParam
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest'
                  } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
                >
                  <option value="">All Buildings</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 4. Equipment Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-headline font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Equipment
              </label>
              <div className="relative">
                <select
                  value={deviceTypeParam}
                  onChange={(e) => updateFilter('deviceType', e.target.value)}
                  className={`w-full appearance-none text-xs font-sans pl-3.5 pr-8 py-2.5 rounded-xl border truncate ${
                    deviceTypeParam
                      ? 'border-primary bg-primary/5 text-primary font-bold cursor-pointer shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest cursor-pointer'
                  } focus:border-primary focus:outline-none transition-colors`}
                >
                  <option value="">All Equipment</option>
                  {availableEquipment.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
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
                <th className="py-3.5 px-6">Equipment & Asset Tag</th>
                <th className="py-3.5 px-6">Campus Location</th>
                <th className="py-3.5 px-6">Reports</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Reported At</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-sans text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-on-surface-variant">
                    <div className="inline-block w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                    <p className="text-xs font-headline font-semibold">Fetching campus reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-on-surface-variant">
                    <p className="font-headline font-bold text-base mb-1">No reports found</p>
                    <p className="text-xs text-outline">Try adjusting or resetting your search filters.</p>
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
                        className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden border border-outline-variant/40 hover:opacity-80 transition-opacity cursor-zoom-in flex-shrink-0 shadow-sm"
                      >
                        <img
                          src={getFullImageUrl(report.photoUrl)}
                          alt="Device thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="space-y-1">
                        <span className="font-headline font-bold text-sm text-on-surface block leading-tight">
                          {report.deviceType}
                        </span>
                        {report.deviceNumber ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/40">
                            <svg className="w-3 h-3 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {report.deviceNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-outline italic">No tag visible</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-on-surface-variant">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                          <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9z" clipRule="evenodd" />
                          </svg>
                          <span>{report.buildingName}</span>
                          <span className="text-outline">•</span>
                          <span>Room {report.roomName}</span>
                        </div>
                        {report.labType && (
                          <span className="inline-block text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 max-w-[220px] truncate">
                            {report.labType}
                          </span>
                        )}
                      </div>
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
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-headline font-bold shadow-sm hover:bg-primary-container transition-all"
                      >
                        Manage
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
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
