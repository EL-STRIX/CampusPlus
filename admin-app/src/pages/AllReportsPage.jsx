import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getReports, getDepartments } from '../api/admin';
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

// Comprehensive mapping of technical, electronic & electrical devices by Laboratory Type
const LAB_DEVICES_MAP = {
  'Computer / Software Systems Lab': [
    { value: 'CPU / Computer Workstation', label: 'CPU / Computer Workstation' },
    { value: 'Display Monitor', label: 'Display Monitor' },
    { value: 'Computer Keyboard', label: 'Computer Keyboard' },
    { value: 'Optical Mouse', label: 'Optical Mouse' },
    { value: 'LAN / Ethernet Cable', label: 'LAN / Ethernet Cable' },
    { value: 'HDMI / DisplayPort Cable', label: 'HDMI / DisplayPort Cable' },
    { value: 'Network Switch / Patch Panel', label: 'Network Switch / Patch Panel' },
    { value: 'Server Rack Mount / Dedicated Server', label: 'Server Rack Mount / Dedicated Server' },
    { value: 'Lab WiFi Access Point Router', label: 'Lab WiFi Access Point Router' },
    { value: 'Headphone / Audio Port', label: 'Headphone / Audio Port' },
  ],
  'Hardware, Microprocessor & Embedded Systems Lab': [
    { value: '8085 / 8086 Microprocessor Trainer Kit', label: '8085 / 8086 Microprocessor Trainer Kit' },
    { value: 'Microcontroller (8051/ARM/PIC) Trainer Kit', label: 'Microcontroller (8051 / ARM / PIC) Trainer Kit' },
    { value: 'FPGA / CPLD Development Board', label: 'FPGA / CPLD Development Board' },
    { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
    { value: 'Logic Analyzer / Protocol Analyzer', label: 'Logic Analyzer / Protocol Analyzer' },
    { value: 'IC Programmer / EEPROM Flasher', label: 'IC Programmer / EEPROM Flasher' },
    { value: 'Digital IC Tester / Trainer Board', label: 'Digital IC Tester / Trainer Board' },
    { value: 'Regulated DC Power Supply (RPS)', label: 'Regulated DC Power Supply (RPS)' },
    { value: 'Soldering Station & De-soldering Tool', label: 'Soldering Station & De-soldering Tool' },
    { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
    { value: 'Interfacing Card (ADC/DAC/Stepper/Traffic)', label: 'Interfacing Card (ADC / DAC / Stepper / Traffic)' },
  ],
  'Electronics, Circuits & VLSI Lab': [
    { value: 'Cathode Ray / Digital Oscilloscope (CRO/DSO)', label: 'Cathode Ray / Digital Oscilloscope (CRO / DSO)' },
    { value: 'Function / Signal Generator (AFG/RF)', label: 'Function / Signal Generator (AFG / RF)' },
    { value: 'Dual Regulated DC Power Supply (RPS)', label: 'Dual Regulated DC Power Supply (RPS)' },
    { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
    { value: 'Analog & Digital Breadboard Trainer Kit', label: 'Analog & Digital Breadboard Trainer Kit' },
    { value: 'LCR Meter / Component Analyzer', label: 'LCR Meter / Component Analyzer' },
    { value: 'VLSI CAD Workstation & Hardware Emulator', label: 'VLSI CAD Workstation & Hardware Emulator' },
    { value: 'Spectrum Analyzer / Network Analyzer', label: 'Spectrum Analyzer / Network Analyzer' },
    { value: 'Soldering Iron / SMD Rework Station', label: 'Soldering Iron / SMD Rework Station' },
    { value: 'Frequency Counter & Timer Unit', label: 'Frequency Counter & Timer Unit' },
  ],
  'Electrical Machines & Power Electronics Lab': [
    { value: 'AC / DC Motor-Generator (MG) Set', label: 'AC / DC Motor-Generator (MG) Set' },
    { value: '1-Phase / 3-Phase Auto-Transformer (Variac)', label: '1-Phase / 3-Phase Auto-Transformer (Variac)' },
    { value: 'Rheostat / Variable Resistance Load Bank', label: 'Rheostat / Variable Resistance Load Bank' },
    { value: 'Resistive / Inductive / Capacitive Load Bank', label: 'Resistive / Inductive / Capacitive Load Bank' },
    { value: 'Digital / Analog Wattmeter / Ammeter / Voltmeter', label: 'Wattmeter / Ammeter / Voltmeter' },
    { value: 'Power Electronics (SCR/MOSFET/IGBT) Trainer', label: 'Power Electronics (SCR/MOSFET/IGBT) Trainer' },
    { value: 'Inverter / Converter / Chopper Rig', label: 'Inverter / Converter / Chopper Rig' },
    { value: 'Earth Resistance Tester / Megger Insulation Meter', label: 'Earth Resistance Tester / Megger Insulation Meter' },
    { value: 'Power Factor Meter / 3-Phase Energy Meter', label: 'Power Factor Meter / 3-Phase Energy Meter' },
    { value: 'Synchronous Alternator / 3-Phase Induction Motor', label: 'Synchronous Alternator / 3-Phase Induction Motor' },
    { value: 'Relay & Circuit Breaker (MCB/MCCB) Test Panel', label: 'Relay & Circuit Breaker Test Panel' },
    { value: 'High Voltage Testing Transformer Setup', label: 'High Voltage Testing Transformer Setup' },
  ],
  'Electric Vehicle (EV) & Battery Research Lab': [
    { value: 'EV Motor (BLDC/PMSM) & Controller Test Bench', label: 'EV Motor (BLDC/PMSM) & Controller Test Bench' },
    { value: 'Battery Management System (BMS) Test Rig', label: 'Battery Management System (BMS) Test Rig' },
    { value: 'Li-Ion Battery Pack Testing & Cycler Station', label: 'Li-Ion Battery Pack Testing & Cycler Station' },
    { value: 'EV AC/DC Fast Charging Station Setup', label: 'EV AC/DC Fast Charging Station Setup' },
    { value: 'Dyno / Dynamometer Load Test Rig', label: 'Dyno / Dynamometer Load Test Rig' },
    { value: 'Regenerative Braking Simulator Rig', label: 'Regenerative Braking Simulator Rig' },
    { value: 'Programmable High-Power DC Electronic Load', label: 'Programmable High-Power DC Electronic Load' },
  ],
  'Robotics, Automation & Mechatronics Lab': [
    { value: 'Robotic Arm / Articulated Manipulator', label: 'Robotic Arm / Articulated Manipulator' },
    { value: 'PLC (Programmable Logic Controller) Trainer Kit', label: 'PLC (Programmable Logic Controller) Trainer Kit' },
    { value: 'SCADA Workstation & HMI Touch Panel', label: 'SCADA Workstation & HMI Touch Panel' },
    { value: 'Pneumatic / Electro-Pneumatic Trainer Kit', label: 'Pneumatic / Electro-Pneumatic Trainer Kit' },
    { value: 'Hydraulic Valve & Cylinder Actuator Rig', label: 'Hydraulic Valve & Cylinder Actuator Rig' },
    { value: 'Servo / Stepper Motor Drive Module', label: 'Servo / Stepper Motor Drive Module' },
    { value: '3D Printer / Rapid Prototyping Machine', label: '3D Printer / Rapid Prototyping Machine' },
    { value: 'CNC Milling / Lathe Machine Interface', label: 'CNC Milling / Lathe Machine Interface' },
    { value: 'Proximity / Optical / Ultrasonic Sensor Rig', label: 'Proximity / Optical / Ultrasonic Sensor Rig' },
  ],
  'AI, Machine Learning & Data Analytics Lab': [
    { value: 'GPU Deep Learning Workstation (NVIDIA/CUDA)', label: 'GPU Deep Learning Workstation (NVIDIA / CUDA)' },
    { value: 'High-Resolution Visual Display Monitor', label: 'High-Resolution Visual Display Monitor' },
    { value: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)', label: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)' },
    { value: 'Webcam / Computer Vision Depth Camera', label: 'Computer Vision Depth Camera / LiDAR Sensor' },
    { value: 'Mechanical Keyboard & Optical Mouse', label: 'Mechanical Keyboard & Optical Mouse' },
    { value: 'High-Speed Gigabit LAN / Fibre Port', label: 'High-Speed Gigabit LAN / Fibre Port' },
  ],
  'Cloud Computing & Cyber Forensics Lab': [
    { value: 'Virtualization & Cloud Server Node', label: 'Virtualization & Cloud Server Node' },
    { value: 'Cyber Forensics Hardware Write Blocker', label: 'Cyber Forensics Hardware Write Blocker' },
    { value: 'High-Performance Dual-Monitor PC Workstation', label: 'High-Performance Dual-Monitor PC Workstation' },
    { value: 'Hardware Security Module (HSM) / Firewall Appliance', label: 'Hardware Security Module / Firewall Appliance' },
    { value: 'Network Sniffer / Packet Capture Station', label: 'Network Sniffer / Packet Capture Station' },
  ],
  'Networking & Server Infrastructure Lab': [
    { value: 'Managed Router (Cisco / Juniper / MikroTik)', label: 'Managed Router (Cisco / Juniper / MikroTik)' },
    { value: 'Managed Gigabit L2/L3 Network Switch', label: 'Managed Gigabit L2/L3 Network Switch' },
    { value: 'Patch Panel & RJ45 Termination Rack', label: 'Patch Panel & RJ45 Termination Rack' },
    { value: 'Optical Fiber Splicer & Optical Power Meter', label: 'Optical Fiber Splicer & Optical Power Meter' },
    { value: 'Network Cable Tester / Tone & Probe Kit', label: 'Network Cable Tester / Tone & Probe Kit' },
    { value: 'Server Rack Mount / Blade Server Unit', label: 'Server Rack Mount / Blade Server Unit' },
  ],
  'Instrumentation & Process Control / Sensor Lab': [
    { value: 'Process Control Simulator (Level/Flow/Temp/Pressure)', label: 'Process Control Simulator (Level / Flow / Temp / Pressure)' },
    { value: 'DCS (Distributed Control System) Workstation', label: 'DCS (Distributed Control System) Workstation' },
    { value: 'Temperature Sensor / RTD / Thermocouple Calibrator', label: 'Temperature Sensor / RTD / Thermocouple Calibrator' },
    { value: 'Strain Gauge / Load Cell & LVDT Kit', label: 'Strain Gauge / Load Cell & LVDT Kit' },
    { value: 'Pressure Transmitter / Dead Weight Tester', label: 'Pressure Transmitter / Dead Weight Tester' },
    { value: 'PID Controller Trainer Setup', label: 'PID Controller Trainer Setup' },
    { value: 'Digital Multimeter / Multi-Function Signal Calibrator', label: 'Digital Multimeter / Multi-Function Signal Calibrator' },
  ],
  'CAD / CAM & Simulation Lab': [
    { value: 'High-Performance 3D CAD Workstation', label: 'High-Performance 3D CAD Workstation' },
    { value: 'Digitizer / Drawing Graphics Display Tablet', label: 'Digitizer / Drawing Graphics Display Tablet' },
    { value: '3D Scanner & Laser Measurement Tool', label: '3D Scanner & Laser Measurement Tool' },
    { value: 'Large Format Blueprint Plotter / Color Printer', label: 'Large Format Blueprint Plotter / Color Printer' },
    { value: 'CNC Simulation Controller Console', label: 'CNC Simulation Controller Console' },
  ],
  'Mechanical Workshop & Thermal / Fluid Lab': [
    { value: 'Computerized Engine Test Rig (IC Engine)', label: 'Computerized Engine Test Rig (IC Engine)' },
    { value: 'Refrigeration & AC (RAC) Test Rig', label: 'Refrigeration & AC (RAC) Test Rig' },
    { value: 'Pelton / Francis Turbine Test Setup', label: 'Pelton / Francis Turbine Test Setup' },
    { value: 'Centrifugal Pump Test Rig', label: 'Centrifugal Pump Test Rig' },
    { value: 'Bomb / Junker Calorimeter Apparatus', label: 'Bomb / Junker Calorimeter Apparatus' },
    { value: 'Heat Exchanger (Parallel/Counter Flow) Apparatus', label: 'Heat Exchanger (Parallel / Counter Flow) Apparatus' },
    { value: 'Digital Tachometer & Stroboscope', label: 'Digital Tachometer & Stroboscope' },
  ],
  'Civil, Geotechnical & Concrete Testing Lab': [
    { value: 'Universal Testing Machine (UTM) Digital Console', label: 'Universal Testing Machine (UTM) Digital Console' },
    { value: 'Compression Testing Machine (CTM)', label: 'Compression Testing Machine (CTM)' },
    { value: 'Digital Sieve Shaker & Vibrator', label: 'Digital Sieve Shaker & Vibrator' },
    { value: 'Electronic Precision Analytical Balance', label: 'Electronic Precision Analytical Balance' },
    { value: 'Soil Direct Shear / Triaxial Apparatus', label: 'Soil Direct Shear / Triaxial Apparatus' },
    { value: 'Concrete Rebound Hammer & Ultrasonic Pulse Tester', label: 'Concrete Rebound Hammer & Ultrasonic Pulse Tester' },
  ],
  'Surveying & Remote Sensing / GIS Lab': [
    { value: 'Electronic Total Station (Digital Theodolite)', label: 'Electronic Total Station (Digital Theodolite)' },
    { value: 'Auto Level / Digital Level Device', label: 'Auto Level / Digital Level Device' },
    { value: 'Handheld & Differential GPS (DGPS) Receiver', label: 'Handheld & Differential GPS (DGPS) Receiver' },
    { value: 'Laser Distance Meter & Rangefinder', label: 'Laser Distance Meter & Rangefinder' },
    { value: 'GIS Workstation & Spatial Plotter', label: 'GIS Workstation & Spatial Plotter' },
  ],
  'Biomedical Engineering & Medical Diagnostics Lab': [
    { value: 'ECG / EKG Patient Simulator & Monitor', label: 'ECG / EKG Patient Simulator & Monitor' },
    { value: 'Digital Pulse Oximeter & Multi-Para Patient Monitor', label: 'Digital Pulse Oximeter & Multi-Para Patient Monitor' },
    { value: 'EEG / EMG Biopotential Signal Acquisition Kit', label: 'EEG / EMG Biopotential Signal Acquisition Kit' },
    { value: 'Defibrillator & Pacemaker Analyzer', label: 'Defibrillator & Pacemaker Analyzer' },
    { value: 'Ultrasound Scanner & Doppler Probe Rig', label: 'Ultrasound Scanner & Doppler Probe Rig' },
    { value: 'Medical Spectrophotometer & Colorimeter', label: 'Medical Spectrophotometer & Colorimeter' },
    { value: 'Spirometer & Respiratory Gas Analyzer', label: 'Spirometer & Respiratory Gas Analyzer' },
  ],
  'Pharmaceutical Sciences & Formulation Lab': [
    { value: 'UV-Visible Spectrophotometer', label: 'UV-Visible Spectrophotometer' },
    { value: 'Digital pH / Ion Meter', label: 'Digital pH / Ion Meter' },
    { value: 'HPLC / Chromatography System Console', label: 'HPLC / Chromatography System Console' },
    { value: 'Tablet Dissolution & Disintegration Tester', label: 'Tablet Dissolution & Disintegration Tester' },
    { value: 'Digital Analytical Electronic Balance', label: 'Digital Analytical Electronic Balance' },
    { value: 'Hot Plate Magnetic Stirrer', label: 'Hot Plate Magnetic Stirrer' },
    { value: 'Rotary Vacuum Evaporator', label: 'Rotary Vacuum Evaporator' },
    { value: 'Laminar Air Flow / Biosafety Cabinet', label: 'Laminar Air Flow / Biosafety Cabinet' },
    { value: 'Digital Melting Point Apparatus', label: 'Digital Melting Point Apparatus' },
  ],
  'Biotechnology, Genetics & Bioinformatics Lab': [
    { value: 'PCR (Thermal Cycler) Machine', label: 'PCR (Thermal Cycler) Machine' },
    { value: 'Gel Electrophoresis Power Supply Unit', label: 'Gel Electrophoresis Power Supply Unit' },
    { value: 'UV Gel Transilluminator & Gel Doc System', label: 'UV Gel Transilluminator & Gel Doc System' },
    { value: 'High-Speed Refrigerated Micro-Centrifuge', label: 'High-Speed Refrigerated Micro-Centrifuge' },
    { value: 'Compound Trinocular Research Microscope', label: 'Compound Trinocular Research Microscope' },
    { value: 'Autoclave / Bio-Fermenter Unit', label: 'Autoclave / Bio-Fermenter Unit' },
    { value: 'BOD / Orbital Shaking Incubator', label: 'BOD / Orbital Shaking Incubator' },
  ],
  'Chemical Analysis & Instrumental Chemistry Lab': [
    { value: 'Digital Flame Photometer', label: 'Digital Flame Photometer' },
    { value: 'Conductivity Meter & Digital TDS Meter', label: 'Conductivity Meter & Digital TDS Meter' },
    { value: 'Digital Potentiometer & Polarimeter', label: 'Digital Potentiometer & Polarimeter' },
    { value: 'Muffle Furnace & Hot Air Laboratory Oven', label: 'Muffle Furnace & Hot Air Laboratory Oven' },
    { value: 'Spectrocolorimeter & Turbidity Meter', label: 'Spectrocolorimeter & Turbidity Meter' },
    { value: 'Ultrasonic Bath Sonicator', label: 'Ultrasonic Bath Sonicator' },
  ],
  'Applied Physics, Optics & Laser Lab': [
    { value: 'He-Ne / Diode Laser Source & Optical Rail', label: 'He-Ne / Diode Laser Source & Optical Rail' },
    { value: 'Michelson Interferometer Optical Bench', label: 'Michelson Interferometer Optical Bench' },
    { value: 'Hall Effect & Four-Probe Resistivity Setup', label: 'Hall Effect & Four-Probe Resistivity Setup' },
    { value: 'Spectrometer with Sodium / Mercury Arc Lamp', label: 'Spectrometer with Sodium / Mercury Arc Lamp' },
    { value: 'Solar Cell Characteristic Trainer Kit', label: 'Solar Cell Characteristic Trainer Kit' },
    { value: 'Planck Constant / Photoelectric Effect Apparatus', label: 'Planck Constant / Photoelectric Effect Apparatus' },
  ],
  'Multimedia, VFX & Sound Recording Studio Lab': [
    { value: 'DSLR / 4K Cinema Camera & Camcorder', label: 'DSLR / 4K Cinema Camera & Camcorder' },
    { value: 'Studio Condenser Microphone & Preamp', label: 'Studio Condenser Microphone & Preamp' },
    { value: 'Audio Mixing Console & USB Audio Interface', label: 'Audio Mixing Console & USB Audio Interface' },
    { value: 'Studio Reference Monitor Speakers', label: 'Studio Reference Monitor Speakers' },
    { value: 'Wacom / Graphics Drawing Display Tablet', label: 'Wacom / Graphics Drawing Display Tablet' },
    { value: 'VR Headset (Meta Quest / HTC Vive)', label: 'VR Headset (Meta Quest / HTC Vive)' },
    { value: 'Chroma Key Green Screen Studio Lighting', label: 'Chroma Key Green Screen Studio Lighting' },
    { value: 'MIDI Keyboard & Music Synthesizer', label: 'MIDI Keyboard & Music Synthesizer' },
  ],
  'Language & Digital Communication Lab': [
    { value: 'Student Workstation with Noise-Cancelling Headset', label: 'Student Workstation with Noise-Cancelling Headset' },
    { value: 'Language Lab Master Console / Teacher PC', label: 'Language Lab Master Console / Teacher PC' },
    { value: 'Audio Distribution Hub / Switcher', label: 'Audio Distribution Hub / Switcher' },
    { value: 'Multimedia Speakers & Soundbar', label: 'Multimedia Speakers & Soundbar' },
  ],
  'Central Innovation & Project Prototyping Lab': [
    { value: '3D Printer / FDM Filament Extruder', label: '3D Printer / FDM Filament Extruder' },
    { value: 'Laser Cutting & Engraving Machine', label: 'Laser Cutting & Engraving Machine' },
    { value: 'PCB Milling & Prototyping Machine', label: 'PCB Milling & Prototyping Machine' },
    { value: 'Digital Storage Oscilloscope & DMM', label: 'Digital Storage Oscilloscope & DMM' },
    { value: 'DC Programmable Electronic Load', label: 'DC Programmable Electronic Load' },
    { value: 'Smart Soldering & Desoldering Workstation', label: 'Smart Soldering & Desoldering Workstation' },
    { value: 'Drill Machine & Dremel Rotary Tool Kit', label: 'Drill Machine & Dremel Rotary Tool Kit' },
  ],
};

const LAB_TYPES_FILTER = [
  'Computer / Software Systems Lab',
  'Hardware, Microprocessor & Embedded Systems Lab',
  'Electronics, Circuits & VLSI Lab',
  'Electrical Machines & Power Electronics Lab',
  'Electric Vehicle (EV) & Battery Research Lab',
  'Robotics, Automation & Mechatronics Lab',
  'AI, Machine Learning & Data Analytics Lab',
  'Cloud Computing & Cyber Forensics Lab',
  'Networking & Server Infrastructure Lab',
  'Instrumentation & Process Control / Sensor Lab',
  'CAD / CAM & Simulation Lab',
  'Mechanical Workshop & Thermal / Fluid Lab',
  'Civil, Geotechnical & Concrete Testing Lab',
  'Surveying & Remote Sensing / GIS Lab',
  'Biomedical Engineering & Medical Diagnostics Lab',
  'Pharmaceutical Sciences & Formulation Lab',
  'Biotechnology, Genetics & Bioinformatics Lab',
  'Chemical Analysis & Instrumental Chemistry Lab',
  'Applied Physics, Optics & Laser Lab',
  'Multimedia, VFX & Sound Recording Studio Lab',
  'Language & Digital Communication Lab',
  'Central Innovation & Project Prototyping Lab',
];

export default function AllReportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State from URL params
  const statusParam = searchParams.get('status') || '';
  const searchParam = searchParams.get('search') || '';
  const buildingParam = searchParams.get('buildingId') || '';
  const departmentParam = searchParams.get('department') || '';
  const labTypeParam = searchParams.get('labType') || '';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Dynamic available equipment based on selected lab type
  const availableEquipment = useMemo(() => {
    if (!labTypeParam) {
      return [];
    }
    const labSpecific = LAB_DEVICES_MAP[labTypeParam] || [];
    return [...labSpecific, ...COMMON_LAB_FACILITIES];
  }, [labTypeParam]);

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
        const depts = await getDepartments();
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
      if (labTypeParam) params.labType = labTypeParam;
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
    labTypeParam,
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
    labTypeParam ||
    deviceTypeParam ||
    dateFromParam ||
    dateToParam
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Search Bar Card */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-card space-y-4">
        {/* Top Row: Page Title & Global Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                All Equipment Reports
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-primary/10 text-primary border border-primary/20">
                {pagination.totalReports} {pagination.totalReports === 1 ? 'Report' : 'Reports'}
              </span>
            </div>
            <p className="text-xs font-sans text-on-surface-variant mt-1">
              Search, filter, categorize, and manage campus hardware tickets.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search Tag, Student, Room, Device..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilter('search', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-bold"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Bottom Row: Unified Filter Strip & Sort Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-1">
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <span className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters:
            </span>

            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <select
                value={statusParam}
                onChange={(e) => updateFilter('status', e.target.value)}
                className={`w-full appearance-none text-xs font-sans pl-3 pr-7 py-2 rounded-xl border ${
                  statusParam
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-outline-variant/60 bg-surface-container-low text-on-surface'
                } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
              >
                <option value="">Status: All</option>
                <option value="open">🟢 Open</option>
                <option value="in_progress">🟡 In Progress</option>
                <option value="resolved">🔵 Resolved</option>
                <option value="rejected">🔴 Rejected</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Department Filter */}
            <div className="relative min-w-[160px] max-w-[210px]">
              <select
                value={departmentParam}
                onChange={(e) => updateFilter('department', e.target.value)}
                className={`w-full appearance-none text-xs font-sans pl-3 pr-7 py-2 rounded-xl border truncate ${
                  departmentParam
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-outline-variant/60 bg-surface-container-low text-on-surface'
                } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
              >
                <option value="">Department: All</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Laboratory Type Filter */}
            <div className="relative min-w-[170px] max-w-[230px]">
              <select
                value={labTypeParam}
                onChange={(e) => {
                  const nextLab = e.target.value;
                  const next = new URLSearchParams(searchParams);
                  if (nextLab) {
                    next.set('labType', nextLab);
                  } else {
                    next.delete('labType');
                  }
                  // When labType changes or resets to default, clear deviceType
                  next.delete('deviceType');
                  next.set('page', '1');
                  setSearchParams(next);
                }}
                className={`w-full appearance-none text-xs font-sans pl-3 pr-7 py-2 rounded-xl border truncate ${
                  labTypeParam
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-outline-variant/60 bg-surface-container-low text-on-surface'
                } focus:border-primary focus:outline-none transition-colors cursor-pointer`}
              >
                <option value="">Lab Type: All</option>
                {LAB_TYPES_FILTER.map((lab) => (
                  <option key={lab} value={lab}>
                    {lab}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Device / Equipment Filter */}
            <div className="relative min-w-[150px] max-w-[220px]">
              <select
                value={deviceTypeParam}
                onChange={(e) => updateFilter('deviceType', e.target.value)}
                disabled={!labTypeParam}
                className={`w-full appearance-none text-xs font-sans pl-3 pr-7 py-2 rounded-xl border truncate ${
                  !labTypeParam
                    ? 'border-outline-variant/30 bg-surface-container-low/50 text-outline cursor-not-allowed opacity-75'
                    : deviceTypeParam
                    ? 'border-primary bg-primary/5 text-primary font-semibold cursor-pointer'
                    : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest cursor-pointer'
                } focus:border-primary focus:outline-none transition-colors`}
              >
                <option value="">Equipment: All</option>
                {availableEquipment.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-headline font-semibold text-status-rejected hover:bg-red-100/60 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
            )}
          </div>

          {/* Right: Sort Control */}
          <div className="relative flex-shrink-0 w-full sm:w-auto">
            <select
              value={`${sortByParam}_${sortOrderParam}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                const next = new URLSearchParams(searchParams);
                next.set('sortBy', sb);
                next.set('sortOrder', so);
                setSearchParams(next);
              }}
              className="w-full sm:w-auto appearance-none text-xs font-headline font-semibold pl-3.5 pr-8 py-2 rounded-xl border border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container-lowest focus:border-primary focus:outline-none transition-colors cursor-pointer shadow-sm"
            >
              <option value="status_workflow_asc">Sort: Status Flow (Open Priority → In Progress → Solved → Rejected)</option>
              <option value="createdAt_desc">Sort: All Newest First</option>
              <option value="createdAt_asc">Sort: All Oldest First</option>
              <option value="reportCount_desc">Sort: Priority (Most Reported)</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
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
