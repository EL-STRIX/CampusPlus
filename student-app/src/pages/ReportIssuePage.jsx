import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartments, getBuildings, submitFaultReport } from '../api/reports';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/FormField';

const DEVICE_TYPES = [
  { value: 'cpu', label: 'Computer Workstation / CPU' },
  { value: 'monitor', label: 'Display Monitor' },
  { value: 'keyboard', label: 'Computer Keyboard' },
  { value: 'mouse', label: 'Optical Mouse' },
  { value: 'projector', label: 'Ceiling / Desktop Projector' },
  { value: 'ac', label: 'Air Conditioner / HVAC' },
  { value: 'fan', label: 'Ceiling / Wall Fan' },
  { value: 'light', label: 'Tubelight / LED Lighting' },
  { value: 'ups', label: 'Uninterruptible Power Supply (UPS)' },
  { value: 'ethernet_cable', label: 'LAN / Ethernet Cable' },
  { value: 'hdmi_cable', label: 'HDMI / Display Cable' },
  { value: 'other_cable', label: 'Power / Other Cable' },
  { value: 'other', label: 'Other Hardware / Facility' },
];

const YEAR_SEMESTER_OPTIONS = [
  { value: '1st Year / Sem 1', label: '1st Year — Semester 1' },
  { value: '1st Year / Sem 2', label: '1st Year — Semester 2' },
  { value: '2nd Year / Sem 3', label: '2nd Year — Semester 3' },
  { value: '2nd Year / Sem 4', label: '2nd Year — Semester 4' },
  { value: '3rd Year / Sem 5', label: '3rd Year — Semester 5' },
  { value: '3rd Year / Sem 6', label: '3rd Year — Semester 6' },
  { value: '4th Year / Sem 7', label: '4th Year — Semester 7' },
  { value: '4th Year / Sem 8', label: '4th Year — Semester 8' },
  { value: 'Postgraduate / PhD', label: 'Postgraduate / Research Scholar' },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Reference Data State
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingRefData, setLoadingRefData] = useState(true);

  // Form Fields
  const [studentCode, setStudentCode] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [customStream, setCustomStream] = useState('');
  const [yearSemester, setYearSemester] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceNumber, setDeviceNumber] = useState('');
  const [numberNotVisible, setNumberNotVisible] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Fetch departments and buildings on mount
  useEffect(() => {
    async function loadReferenceData() {
      try {
        setLoadingRefData(true);
        const [deptsData, bldgsData] = await Promise.all([
          getDepartments(),
          getBuildings(),
        ]);
        setDepartments(deptsData || []);
        setBuildings(bldgsData || []);
      } catch (err) {
        setSubmitError('Failed to load campus locations. Please refresh the page.');
      } finally {
        setLoadingRefData(false);
      }
    }
    loadReferenceData();
  }, []);

  // Compute cascading streams based on selected department
  const currentDeptObj = departments.find((d) => d.name === selectedDept);
  const availableStreams = currentDeptObj
    ? [
        ...currentDeptObj.streams.map((s) => ({ value: s.name, label: s.name })),
        { value: 'OTHER_STREAM', label: 'Other Specialization (Specify Manually)' },
      ]
    : [];

  // Compute cascading rooms based on selected building
  const currentBldgObj = buildings.find((b) => b.id === selectedBuilding);
  const availableRooms = currentBldgObj
    ? currentBldgObj.rooms.map((r) => ({ value: r.id, label: `Room ${r.name}` }))
    : [];

  // Photo selection handler
  const handlePhotoSelect = (file) => {
    if (!file) return;

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Invalid file type. Only JPG, PNG, and WebP images are supported.',
      }));
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Photo size exceeds the 5MB limit. Please upload a smaller image.',
      }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!photoFile) {
      newErrors.photo = 'A clear photo of the malfunctioning equipment is required.';
    }
    if (!studentCode.trim()) {
      newErrors.studentCode = 'Student code / Roll number is required.';
    }

    if (selectedDept === 'OTHER') {
      if (!customDepartment.trim()) {
        newErrors.customDepartment = 'Please enter your department name.';
      }
      if (!customStream.trim()) {
        newErrors.customStream = 'Please specify your stream / branch (or enter General).';
      }
    } else {
      if (!selectedDept) {
        newErrors.department = 'Please select your department.';
      }
      if (!selectedStream) {
        newErrors.stream = 'Please select your stream / branch.';
      } else if (selectedStream === 'OTHER_STREAM' && !customStream.trim()) {
        newErrors.customStream = 'Please specify your specialization / branch name.';
      }
    }

    if (!selectedBuilding) {
      newErrors.building = 'Please select the building location.';
    }
    if (!selectedRoom) {
      newErrors.room = 'Please select the room number.';
    }
    if (!deviceType) {
      newErrors.deviceType = 'Please select the device type.';
    }
    if (!numberNotVisible && !deviceNumber.trim()) {
      newErrors.deviceNumber =
        'Device / asset tag number is required, or check "Number not visible".';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      // Scroll to top of form smoothly
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);

      const finalDepartment = selectedDept === 'OTHER' ? customDepartment.trim() : selectedDept;
      const finalStream =
        selectedDept === 'OTHER' || selectedStream === 'OTHER_STREAM'
          ? customStream.trim()
          : selectedStream;

      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('studentCode', studentCode.trim());
      formData.append('department', finalDepartment);
      formData.append('stream', finalStream);
      if (yearSemester) formData.append('yearSemester', yearSemester);
      formData.append('buildingId', selectedBuilding);
      formData.append('roomId', selectedRoom);
      formData.append('deviceType', deviceType);
      formData.append('deviceNumberVisible', (!numberNotVisible).toString());
      if (!numberNotVisible && deviceNumber.trim()) {
        formData.append('deviceNumber', deviceNumber.trim());
      }
      if (additionalNotes.trim()) {
        formData.append('additionalNotes', additionalNotes.trim());
      }

      const response = await submitFaultReport(formData);

      navigate('/confirmation', {
        state: {
          reportId: response.reportId,
          isNewReport: response.isNewReport,
          reportCount: response.reportCount,
          isPossibleDuplicate: response.isPossibleDuplicate,
        },
      });
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please check your inputs and try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-8 pb-16 px-gutter max-w-container-max mx-auto w-full flex-grow">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Context & Guidelines */}
        <section className="md:col-span-4 flex flex-col justify-start sticky top-24">
          <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary mb-2">
            Service Request
          </span>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
            Report a Fault
          </h1>
          <p className="text-sm font-sans text-on-surface-variant mb-6 leading-relaxed">
            Fill out the details below to alert facilities maintenance. Submissions are processed and prioritized automatically.
          </p>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex flex-col gap-4 shadow-subtle">
            <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Before you start, you&apos;ll need:
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-sans text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">1</span>
                <span>A clear photo of the broken equipment or error screen</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">2</span>
                <span>Your official student roll number and enrolled department</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">3</span>
                <span>Exact building and room number</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-1.5">
              <span className="text-[11px] font-headline font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Zero-Login Integrity Notice
              </span>
              <p className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
                Login is omitted for student convenience. Please enter your authentic student ID. All submissions are logged for campus maintenance accountability.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Interactive Form */}
        <section className="md:col-span-8 bg-surface-container-lowest p-6 sm:p-8 md:p-10 rounded-2xl shadow-card border border-outline-variant/30">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-sm font-sans flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-headline font-bold block mb-0.5">Submission Error</span>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Section 1: Photo Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-headline font-semibold text-on-surface flex items-center justify-between">
                <span>
                  Evidence Photo <span className="text-error">*</span>
                </span>
                <span className="text-xs text-outline font-normal">Supports JPG, PNG, WebP (Max 5MB)</span>
              </label>

              {!photoPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handlePhotoSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                    errors.photo
                      ? 'border-error bg-red-50/50'
                      : 'border-outline-variant hover:border-primary hover:bg-surface-container-low bg-surface'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-headline font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Click to browse or drag & drop photo here
                  </span>
                  <span className="text-xs text-outline mt-1">Take a clear picture of the equipment fault</span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-outline-variant/50 bg-surface-container-low p-4 flex items-center gap-4">
                  <img
                    src={photoPreview}
                    alt="Fault evidence preview"
                    className="w-24 h-24 object-cover rounded-lg border border-outline-variant/40 shadow-sm"
                  />
                  <div className="flex-grow min-w-0">
                    <span className="text-sm font-headline font-bold text-on-surface truncate block">
                      {photoFile?.name}
                    </span>
                    <span className="text-xs text-on-surface-variant block mt-0.5">
                      {(photoFile?.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-status-resolved font-medium mt-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Photo ready for upload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error/10 text-xs font-headline font-semibold transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePhotoSelect(e.target.files[0]);
                  }
                }}
              />

              {errors.photo && (
                <span className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.photo}
                </span>
              )}
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 2: Student Information */}
            <div>
              <h2 className="text-base font-headline font-bold text-on-surface mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Student Roll No / Code"
                    id="studentCode"
                    name="studentCode"
                    placeholder="e.g. BWU/BCA/24/330"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    helperText="Please enter your official student registration / roll code. Submissions are logged for maintenance accountability."
                    error={errors.studentCode}
                    required
                  />
                </div>

                <div className={selectedDept === 'OTHER' ? 'md:col-span-2' : ''}>
                  <Select
                    label="Department"
                    id="department"
                    name="department"
                    placeholder={loadingRefData ? 'Loading departments...' : 'Select Department'}
                    options={[
                      ...departments.map((d) => ({ value: d.name, label: d.name })),
                      { value: 'OTHER', label: 'Other (Enter Department Manually)' },
                    ]}
                    value={selectedDept}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDept(val);
                      setSelectedStream(''); // Reset stream when department changes
                      if (val !== 'OTHER') {
                        setCustomDepartment('');
                        setCustomStream('');
                      }
                    }}
                    error={errors.department}
                    disabled={loadingRefData}
                    required
                  />
                </div>

                {selectedDept === 'OTHER' ? (
                  <>
                    <Input
                      label="Specify Department Name"
                      id="customDepartment"
                      name="customDepartment"
                      placeholder="e.g. Department of Pharmacy / Law / Management"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      error={errors.customDepartment}
                      required
                    />

                    <Input
                      label="Specify Stream / Branch"
                      id="customStream"
                      name="customStream"
                      placeholder="e.g. B.Pharm / General / Specialized Core"
                      value={customStream}
                      onChange={(e) => setCustomStream(e.target.value)}
                      error={errors.customStream}
                      required
                    />
                  </>
                ) : (
                  <>
                    <Select
                      label="Stream / Branch"
                      id="stream"
                      name="stream"
                      placeholder={
                        !selectedDept
                          ? 'Select Department First'
                          : availableStreams.length === 0
                          ? 'No streams available'
                          : 'Select Stream / Branch'
                      }
                      options={availableStreams}
                      value={selectedStream}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedStream(val);
                        if (val !== 'OTHER_STREAM') {
                          setCustomStream('');
                        }
                      }}
                      error={errors.stream}
                      disabled={!selectedDept || availableStreams.length === 0}
                      required
                    />

                    {selectedStream === 'OTHER_STREAM' && (
                      <div className="md:col-span-2">
                        <Input
                          label="Specify Custom Specialization / Branch"
                          id="customStream"
                          name="customStream"
                          placeholder="e.g. Dual Degree / Specialized Elective"
                          value={customStream}
                          onChange={(e) => setCustomStream(e.target.value)}
                          error={errors.customStream}
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="md:col-span-2">
                  <Select
                    label="Year / Semester"
                    id="yearSemester"
                    name="yearSemester"
                    placeholder="Select Year / Semester (Optional)"
                    options={YEAR_SEMESTER_OPTIONS}
                    value={yearSemester}
                    onChange={(e) => setYearSemester(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 3: Campus Location */}
            <div>
              <h2 className="text-base font-headline font-bold text-on-surface mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Building"
                  id="building"
                  name="building"
                  placeholder={loadingRefData ? 'Loading buildings...' : 'Select Building'}
                  options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                  value={selectedBuilding}
                  onChange={(e) => {
                    setSelectedBuilding(e.target.value);
                    setSelectedRoom(''); // Reset room when building changes
                  }}
                  error={errors.building}
                  disabled={loadingRefData}
                  required
                />

                <Select
                  label="Room Number"
                  id="room"
                  name="room"
                  placeholder={
                    !selectedBuilding
                      ? 'Select Building First'
                      : availableRooms.length === 0
                      ? 'No rooms configured'
                      : 'Select Room'
                  }
                  options={availableRooms}
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  error={errors.room}
                  disabled={!selectedBuilding || availableRooms.length === 0}
                  required
                />
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 4: Device Details */}
            <div>
              <h2 className="text-base font-headline font-bold text-on-surface mb-4">Device Details</h2>
              <div className="flex flex-col gap-4">
                <Select
                  label="Device Type"
                  id="deviceType"
                  name="deviceType"
                  placeholder="Select Device Type"
                  options={DEVICE_TYPES}
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  error={errors.deviceType}
                  required
                />

                <div className="flex flex-col gap-2">
                  <Input
                    label="Asset / Device Number"
                    id="deviceNumber"
                    name="deviceNumber"
                    placeholder={numberNotVisible ? 'Number disabled (Not visible)' : 'e.g. CPU-1892 or Barcode #'}
                    value={deviceNumber}
                    onChange={(e) => setDeviceNumber(e.target.value)}
                    disabled={numberNotVisible}
                    error={errors.deviceNumber}
                    helperText={
                      !numberNotVisible
                        ? 'Found on barcode sticker or metal asset plate.'
                        : null
                    }
                    required={!numberNotVisible}
                  />

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="numberNotVisible"
                      checked={numberNotVisible}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNumberNotVisible(checked);
                        if (checked) {
                          setDeviceNumber('');
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.deviceNumber;
                            return next;
                          });
                        }
                      }}
                      className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary bg-surface-container-lowest cursor-pointer"
                    />
                    <label htmlFor="numberNotVisible" className="text-xs font-sans text-on-surface-variant cursor-pointer select-none">
                      Asset / Device tag number is missing or not visible
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 5: Additional Notes */}
            <Textarea
              label="Additional Notes (Optional)"
              id="additionalNotes"
              name="additionalNotes"
              placeholder="Describe symptoms, error codes, power state, or specific desk location..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />

            {/* Section 6: Integrity Declaration & Submit Button */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 text-xs text-on-surface-variant shadow-subtle">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="leading-relaxed">
                  <span className="font-headline font-bold text-on-surface block mb-0.5">
                    Student Honor & Truthful Reporting Policy
                  </span>
                  <span>
                    By submitting, you confirm that all details provided are accurate and represent a genuine hardware defect. Since this portal operates without login for speed, reports are tracked via institutional network audit logs. Submitting false, prank, or fraudulent reports disrupts campus facilities and is strictly prohibited under institutional regulations.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full md:w-auto px-10"
                >
                  Submit Fault Report
                </Button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
