import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartments, submitFaultReport } from '../api/reports';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/FormField';

// Base facility & electrical hardware common across all campus labs and classrooms
const COMMON_LAB_FACILITIES = [
  { value: 'Ceiling / Wall Air Conditioner (AC)', label: 'Ceiling / Wall Air Conditioner (AC)' },
  { value: 'Ceiling / Wall Fan', label: 'Ceiling / Wall Fan' },
  { value: 'Tubelight / LED Panel Lighting', label: 'Tubelight / LED Panel Lighting' },
  { value: 'Ceiling Projector / Smart Interactive Screen', label: 'Ceiling Projector / Smart Interactive Screen' },
  { value: 'Central UPS / Power Backup Inverter', label: 'Central UPS / Power Backup Inverter' },
  { value: 'Power Strip / Spike Buster / Electrical Switchboard', label: 'Power Strip / Spike Buster / Electrical Switchboard' },
  { value: 'LAN Wall Port / Network Switch', label: 'LAN Wall Port / Network Switch' },
  { value: 'Exhaust Fan / Lab Ventilation Unit', label: 'Exhaust Fan / Lab Ventilation Unit' },
];

// Department and Stream specific devices catalogue
const STREAM_KEYWORD_DEVICES_MAP = [
  // AI, ML & Data Science
  {
    matches: (dept, stream) =>
      /ai|machine learning|data science|analytics|deep learning|vision/i.test(stream || '') ||
      /ai|data science/i.test(dept || ''),
    devices: [
      { value: 'GPU Deep Learning Workstation (NVIDIA / CUDA)', label: 'GPU Deep Learning Workstation (NVIDIA / CUDA)' },
      { value: 'High-Resolution Visual Display Monitor', label: 'High-Resolution Visual Display Monitor' },
      { value: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)', label: 'AI Edge Device (NVIDIA Jetson / Raspberry Pi)' },
      { value: 'Computer Vision Depth Camera / LiDAR Sensor', label: 'Computer Vision Depth Camera / LiDAR Sensor' },
      { value: 'Mechanical Keyboard & Optical Mouse', label: 'Mechanical Keyboard & Optical Mouse' },
      { value: 'High-Speed Gigabit LAN / Fibre Port', label: 'High-Speed Gigabit LAN / Fibre Port' },
      { value: 'CPU / Computer Workstation', label: 'CPU / Computer Workstation' },
      { value: 'Display Monitor', label: 'Display Monitor' },
    ],
  },
  // Cyber Security, Forensics, Cloud & Systems
  {
    matches: (dept, stream) =>
      /cyber|forensic|security|cloud|devops|virtualization|network|server/i.test(stream || ''),
    devices: [
      { value: 'Virtualization & Cloud Server Node', label: 'Virtualization & Cloud Server Node' },
      { value: 'Cyber Forensics Hardware Write Blocker', label: 'Cyber Forensics Hardware Write Blocker' },
      { value: 'High-Performance Dual-Monitor PC Workstation', label: 'High-Performance Dual-Monitor PC Workstation' },
      { value: 'Hardware Security Module / Firewall Appliance', label: 'Hardware Security Module / Firewall Appliance' },
      { value: 'Network Sniffer / Packet Capture Station', label: 'Network Sniffer / Packet Capture Station' },
      { value: 'Managed Gigabit L2/L3 Network Switch', label: 'Managed Gigabit L2/L3 Network Switch' },
      { value: 'Server Rack Mount / Blade Server Unit', label: 'Server Rack Mount / Blade Server Unit' },
      { value: 'Managed Router (Cisco / Juniper / MikroTik)', label: 'Managed Router (Cisco / Juniper / MikroTik)' },
      { value: 'Patch Panel & RJ45 Termination Rack', label: 'Patch Panel & RJ45 Termination Rack' },
      { value: 'Optical Fiber Splicer & Optical Power Meter', label: 'Optical Fiber Splicer & Optical Power Meter' },
      { value: 'CPU / Computer Workstation', label: 'CPU / Computer Workstation' },
      { value: 'Display Monitor', label: 'Display Monitor' },
    ],
  },
  // IoT & Smart Systems
  {
    matches: (dept, stream) =>
      /iot|internet of things|smart cit|sensor|embedded/i.test(stream || ''),
    devices: [
      { value: 'IoT Sensor & Actuator Development Board', label: 'IoT Sensor & Actuator Development Board' },
      { value: 'Microcontroller (ESP32 / Arduino / NodeMCU) Kit', label: 'Microcontroller (ESP32 / Arduino / NodeMCU) Kit' },
      { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
      { value: 'Regulated DC Power Supply (RPS)', label: 'Regulated DC Power Supply (RPS)' },
      { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
      { value: 'Smart Gateway & Zigbee / LoRa Module', label: 'Smart Gateway & Zigbee / LoRa Module' },
      { value: 'Soldering Station & De-soldering Tool', label: 'Soldering Station & De-soldering Tool' },
      { value: 'CPU / Computer Workstation', label: 'CPU / Computer Workstation' },
      { value: 'Display Monitor', label: 'Display Monitor' },
    ],
  },
  // VLSI & Microelectronics
  {
    matches: (dept, stream) =>
      /vlsi|microelectronics|semiconductor|chip/i.test(stream || ''),
    devices: [
      { value: 'VLSI CAD Workstation & Hardware Emulator', label: 'VLSI CAD Workstation & Hardware Emulator' },
      { value: 'FPGA / CPLD Development Board (Xilinx / Altera)', label: 'FPGA / CPLD Development Board (Xilinx / Altera)' },
      { value: 'IC Programmer / EEPROM Flasher', label: 'IC Programmer / EEPROM Flasher' },
      { value: 'Logic Analyzer / Protocol Analyzer', label: 'Logic Analyzer / Protocol Analyzer' },
      { value: 'Digital IC Tester / Trainer Board', label: 'Digital IC Tester / Trainer Board' },
      { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
      { value: 'Dual Regulated DC Power Supply (RPS)', label: 'Dual Regulated DC Power Supply (RPS)' },
      { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
    ],
  },
  // Microprocessor & Embedded Systems
  {
    matches: (dept, stream) =>
      /microprocessor|microcontroller|embedded/i.test(stream || ''),
    devices: [
      { value: '8085 / 8086 Microprocessor Trainer Kit', label: '8085 / 8086 Microprocessor Trainer Kit' },
      { value: 'Microcontroller (8051 / ARM / PIC / STM32) Trainer Kit', label: 'Microcontroller (8051 / ARM / PIC / STM32) Trainer Kit' },
      { value: 'FPGA / CPLD Development Board', label: 'FPGA / CPLD Development Board' },
      { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
      { value: 'Logic Analyzer / Protocol Analyzer', label: 'Logic Analyzer / Protocol Analyzer' },
      { value: 'Regulated DC Power Supply (RPS)', label: 'Regulated DC Power Supply (RPS)' },
      { value: 'Soldering Station & De-soldering Tool', label: 'Soldering Station & De-soldering Tool' },
      { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
      { value: 'Interfacing Card (ADC / DAC / Stepper / Traffic)', label: 'Interfacing Card (ADC / DAC / Stepper / Traffic)' },
    ],
  },
  // Electric Vehicle (EV) & Battery
  {
    matches: (dept, stream) =>
      /electric vehicle|ev|battery|traction|energy storage/i.test(stream || ''),
    devices: [
      { value: 'EV Motor (BLDC/PMSM) & Controller Test Bench', label: 'EV Motor (BLDC/PMSM) & Controller Test Bench' },
      { value: 'Battery Management System (BMS) Test Rig', label: 'Battery Management System (BMS) Test Rig' },
      { value: 'Li-Ion Battery Pack Testing & Cycler Station', label: 'Li-Ion Battery Pack Testing & Cycler Station' },
      { value: 'EV AC/DC Fast Charging Station Setup', label: 'EV AC/DC Fast Charging Station Setup' },
      { value: 'Dyno / Dynamometer Load Test Rig', label: 'Dyno / Dynamometer Load Test Rig' },
      { value: 'Regenerative Braking Simulator Rig', label: 'Regenerative Braking Simulator Rig' },
      { value: 'Programmable High-Power DC Electronic Load', label: 'Programmable High-Power DC Electronic Load' },
      { value: 'Digital Storage Oscilloscope (DSO)', label: 'Digital Storage Oscilloscope (DSO)' },
    ],
  },
  // Robotics, Automation & Mechatronics
  {
    matches: (dept, stream) =>
      /robot|automation|mechatronic|autonomous|drone|uav|plc|scada/i.test(stream || '') ||
      /robot/i.test(dept || ''),
    devices: [
      { value: 'Robotic Arm / Articulated Manipulator', label: 'Robotic Arm / Articulated Manipulator' },
      { value: 'PLC (Programmable Logic Controller) Trainer Kit', label: 'PLC (Programmable Logic Controller) Trainer Kit' },
      { value: 'SCADA Workstation & HMI Touch Panel', label: 'SCADA Workstation & HMI Touch Panel' },
      { value: 'Pneumatic / Electro-Pneumatic Trainer Kit', label: 'Pneumatic / Electro-Pneumatic Trainer Kit' },
      { value: 'Hydraulic Valve & Cylinder Actuator Rig', label: 'Hydraulic Valve & Cylinder Actuator Rig' },
      { value: 'Servo / Stepper Motor Drive Module', label: 'Servo / Stepper Motor Drive Module' },
      { value: '3D Printer / Rapid Prototyping Machine', label: '3D Printer / Rapid Prototyping Machine' },
      { value: 'CNC Milling / Lathe Machine Interface', label: 'CNC Milling / Lathe Machine Interface' },
      { value: 'Autonomous AGV / Mobile Robot Platform', label: 'Autonomous AGV / Mobile Robot Platform' },
      { value: 'Drone / UAV Quadcopter Test Bench', label: 'Drone / UAV Quadcopter Test Bench' },
      { value: 'Proximity / Optical / Ultrasonic Sensor Rig', label: 'Proximity / Optical / Ultrasonic Sensor Rig' },
    ],
  },
  // CAD / CAM & Simulation
  {
    matches: (dept, stream) =>
      /cad|cam|design|fea|modeling|prototyping/i.test(stream || ''),
    devices: [
      { value: 'High-Performance 3D CAD Workstation', label: 'High-Performance 3D CAD Workstation' },
      { value: 'Digitizer / Drawing Graphics Display Tablet', label: 'Digitizer / Drawing Graphics Display Tablet' },
      { value: '3D Scanner & Laser Measurement Tool', label: '3D Scanner & Laser Measurement Tool' },
      { value: 'Large Format Blueprint Plotter / Color Printer', label: 'Large Format Blueprint Plotter / Color Printer' },
      { value: 'CNC Simulation Controller Console', label: 'CNC Simulation Controller Console' },
      { value: '3D Printer / Rapid Prototyping Machine', label: '3D Printer / Rapid Prototyping Machine' },
    ],
  },
  // Animation, Multimedia & VFX
  {
    matches: (dept, stream) =>
      /animation|vfx|multimedia|film|audio|sound|graphic|game/i.test(stream || '') ||
      /multimedia|animation|media/i.test(dept || ''),
    devices: [
      { value: 'DSLR / 4K Cinema Camera & Camcorder', label: 'DSLR / 4K Cinema Camera & Camcorder' },
      { value: 'Studio Condenser Microphone & Preamp', label: 'Studio Condenser Microphone & Preamp' },
      { value: 'Audio Mixing Console & USB Audio Interface', label: 'Audio Mixing Console & USB Audio Interface' },
      { value: 'Studio Reference Monitor Speakers', label: 'Studio Reference Monitor Speakers' },
      { value: 'Wacom / Graphics Drawing Display Tablet', label: 'Wacom / Graphics Drawing Display Tablet' },
      { value: 'VR Headset (Meta Quest / HTC Vive)', label: 'VR Headset (Meta Quest / HTC Vive)' },
      { value: 'Chroma Key Green Screen Studio Lighting', label: 'Chroma Key Green Screen Studio Lighting' },
      { value: 'MIDI Keyboard & Music Synthesizer', label: 'MIDI Keyboard & Music Synthesizer' },
      { value: 'High-Performance Video Rendering Workstation', label: 'High-Performance Video Rendering Workstation' },
    ],
  },
  // Power Systems & High Voltage
  {
    matches: (dept, stream) =>
      /power system|high voltage|drives|power electronics|renewable|solar|grid/i.test(stream || ''),
    devices: [
      { value: 'Power Electronics (SCR / MOSFET / IGBT) Trainer', label: 'Power Electronics (SCR / MOSFET / IGBT) Trainer' },
      { value: 'Inverter / Converter / Chopper Rig', label: 'Inverter / Converter / Chopper Rig' },
      { value: '1-Phase / 3-Phase Auto-Transformer (Variac)', label: '1-Phase / 3-Phase Auto-Transformer (Variac)' },
      { value: 'Solar PV Emulator & Inverter Trainer', label: 'Solar PV Emulator & Inverter Trainer' },
      { value: 'Smart Grid & Energy Meter Test Bench', label: 'Smart Grid & Energy Meter Test Bench' },
      { value: 'High Voltage Testing Transformer Setup', label: 'High Voltage Testing Transformer Setup' },
      { value: 'Relay & Circuit Breaker (MCB / MCCB) Test Panel', label: 'Relay & Circuit Breaker (MCB / MCCB) Test Panel' },
      { value: 'Earth Resistance Tester / Megger Insulation Meter', label: 'Earth Resistance Tester / Megger Insulation Meter' },
    ],
  },
];

// Department default devices
const DEPARTMENT_DEFAULTS_MAP = {
  // CSE / IT / BCA / MCA
  cse: [
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
    { value: 'High-Performance Deep Learning PC', label: 'High-Performance Deep Learning PC' },
  ],
  // Electronics & Communication (ECE)
  ece: [
    { value: 'Cathode Ray / Digital Oscilloscope (CRO / DSO)', label: 'Cathode Ray / Digital Oscilloscope (CRO / DSO)' },
    { value: 'Function / Signal Generator (AFG / RF)', label: 'Function / Signal Generator (AFG / RF)' },
    { value: 'Dual Regulated DC Power Supply (RPS)', label: 'Dual Regulated DC Power Supply (RPS)' },
    { value: 'Digital Multimeter (DMM)', label: 'Digital Multimeter (DMM)' },
    { value: 'Analog & Digital Breadboard Trainer Kit', label: 'Analog & Digital Breadboard Trainer Kit' },
    { value: 'Microprocessor (8085/8086) / Microcontroller (8051/ARM) Kit', label: 'Microprocessor / Microcontroller Trainer Kit' },
    { value: 'VLSI CAD Workstation & FPGA Board', label: 'VLSI CAD Workstation & FPGA Board' },
    { value: 'Spectrum Analyzer / Network Analyzer', label: 'Spectrum Analyzer / Network Analyzer' },
    { value: 'Soldering Station & SMD Rework Tool', label: 'Soldering Station & SMD Rework Tool' },
    { value: 'Frequency Counter & Timer Unit', label: 'Frequency Counter & Timer Unit' },
    { value: 'LCR Meter / Component Analyzer', label: 'LCR Meter / Component Analyzer' },
  ],
  // Electrical (EEE / EE)
  eee: [
    { value: 'AC / DC Motor-Generator (MG) Set', label: 'AC / DC Motor-Generator (MG) Set' },
    { value: '1-Phase / 3-Phase Auto-Transformer (Variac)', label: '1-Phase / 3-Phase Auto-Transformer (Variac)' },
    { value: 'Rheostat / Variable Resistance Load Bank', label: 'Rheostat / Variable Resistance Load Bank' },
    { value: 'Resistive / Inductive / Capacitive Load Bank', label: 'Resistive / Inductive / Capacitive Load Bank' },
    { value: 'Digital / Analog Wattmeter / Ammeter / Voltmeter', label: 'Wattmeter / Ammeter / Voltmeter' },
    { value: 'Power Electronics (SCR / MOSFET / IGBT) Trainer', label: 'Power Electronics (SCR / MOSFET / IGBT) Trainer' },
    { value: 'Inverter / Converter / Chopper Rig', label: 'Inverter / Converter / Chopper Rig' },
    { value: 'Earth Resistance Tester / Megger Insulation Meter', label: 'Earth Resistance Tester / Megger Insulation Meter' },
    { value: 'Synchronous Alternator / 3-Phase Induction Motor', label: 'Synchronous Alternator / 3-Phase Induction Motor' },
    { value: 'Relay & Circuit Breaker (MCB / MCCB) Test Panel', label: 'Relay & Circuit Breaker Test Panel' },
    { value: 'High Voltage Testing Transformer Setup', label: 'High Voltage Testing Transformer Setup' },
    { value: 'EV Motor / Battery Management Test Rig', label: 'EV Motor / Battery Management Test Rig' },
  ],
  // Mechanical Engineering (ME)
  me: [
    { value: 'Universal Testing Machine (UTM) Digital Console', label: 'Universal Testing Machine (UTM) Digital Console' },
    { value: 'Computerized Engine Test Rig (IC Engine)', label: 'Computerized Engine Test Rig (IC Engine)' },
    { value: 'Refrigeration & AC (RAC) Test Rig', label: 'Refrigeration & AC (RAC) Test Rig' },
    { value: 'Pelton / Francis Turbine Test Setup', label: 'Pelton / Francis Turbine Test Setup' },
    { value: 'Centrifugal Pump Test Rig', label: 'Centrifugal Pump Test Rig' },
    { value: 'Bomb / Junker Calorimeter Apparatus', label: 'Bomb / Junker Calorimeter Apparatus' },
    { value: 'Heat Exchanger (Parallel / Counter Flow) Apparatus', label: 'Heat Exchanger (Parallel / Counter Flow) Apparatus' },
    { value: 'High-Performance 3D CAD Workstation', label: 'High-Performance 3D CAD Workstation' },
    { value: '3D Printer / Rapid Prototyping Machine', label: '3D Printer / Rapid Prototyping Machine' },
    { value: 'CNC Milling / Lathe Machine Interface', label: 'CNC Milling / Lathe Machine Interface' },
    { value: 'Digital Tachometer & Stroboscope', label: 'Digital Tachometer & Stroboscope' },
  ],
  // Civil Engineering (CE)
  ce: [
    { value: 'Universal Testing Machine (UTM) Digital Console', label: 'Universal Testing Machine (UTM) Digital Console' },
    { value: 'Compression Testing Machine (CTM)', label: 'Compression Testing Machine (CTM)' },
    { value: 'Digital Sieve Shaker & Vibrator', label: 'Digital Sieve Shaker & Vibrator' },
    { value: 'Electronic Precision Analytical Balance', label: 'Electronic Precision Analytical Balance' },
    { value: 'Soil Direct Shear / Triaxial Apparatus', label: 'Soil Direct Shear / Triaxial Apparatus' },
    { value: 'Concrete Rebound Hammer & Ultrasonic Pulse Tester', label: 'Concrete Rebound Hammer & Ultrasonic Pulse Tester' },
    { value: 'Electronic Total Station (Digital Theodolite)', label: 'Electronic Total Station (Digital Theodolite)' },
    { value: 'Auto Level / Digital Level Device', label: 'Auto Level / Digital Level Device' },
    { value: 'Handheld & Differential GPS (DGPS) Receiver', label: 'Handheld & Differential GPS (DGPS) Receiver' },
    { value: 'Laser Distance Meter & Rangefinder', label: 'Laser Distance Meter & Rangefinder' },
    { value: 'GIS Workstation & Spatial Plotter', label: 'GIS Workstation & Spatial Plotter' },
  ],
  // Pharmacy
  pharmacy: [
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
  // Biotechnology & Genetics
  biotech: [
    { value: 'PCR (Thermal Cycler) Machine', label: 'PCR (Thermal Cycler) Machine' },
    { value: 'Gel Electrophoresis Power Supply Unit', label: 'Gel Electrophoresis Power Supply Unit' },
    { value: 'UV Gel Transilluminator & Gel Doc System', label: 'UV Gel Transilluminator & Gel Doc System' },
    { value: 'High-Speed Refrigerated Micro-Centrifuge', label: 'High-Speed Refrigerated Micro-Centrifuge' },
    { value: 'Compound Trinocular Research Microscope', label: 'Compound Trinocular Research Microscope' },
    { value: 'Autoclave / Bio-Fermenter Unit', label: 'Autoclave / Bio-Fermenter Unit' },
    { value: 'BOD / Orbital Shaking Incubator', label: 'BOD / Orbital Shaking Incubator' },
    { value: 'Laminar Air Flow Hood / Biosafety Cabinet', label: 'Laminar Air Flow Hood / Biosafety Cabinet' },
  ],
  // Chemical Engineering
  chemical: [
    { value: 'Fractional Distillation Column Unit', label: 'Fractional Distillation Column Unit' },
    { value: 'Packed Bed & Fluidized Bed Reactor Setup', label: 'Packed Bed & Fluidized Bed Reactor Setup' },
    { value: 'Heat Exchanger (Shell & Tube / Plate)', label: 'Heat Exchanger (Shell & Tube / Plate)' },
    { value: 'Liquid-Liquid Extraction Column', label: 'Liquid-Liquid Extraction Column' },
    { value: 'Rotary Vacuum Evaporator', label: 'Rotary Vacuum Evaporator' },
    { value: 'Digital pH & Conductivity Meter', label: 'Digital pH & Conductivity Meter' },
    { value: 'Gas Chromatography (GC) Analyzer', label: 'Gas Chromatography (GC) Analyzer' },
  ],
  // Biomedical Engineering
  biomedical: [
    { value: 'ECG / EKG Patient Simulator & Monitor', label: 'ECG / EKG Patient Simulator & Monitor' },
    { value: 'Digital Pulse Oximeter & Multi-Para Patient Monitor', label: 'Digital Pulse Oximeter & Multi-Para Patient Monitor' },
    { value: 'EEG / EMG Biopotential Signal Acquisition Kit', label: 'EEG / EMG Biopotential Signal Acquisition Kit' },
    { value: 'Defibrillator & Pacemaker Analyzer', label: 'Defibrillator & Pacemaker Analyzer' },
    { value: 'Ultrasound Scanner & Doppler Probe Rig', label: 'Ultrasound Scanner & Doppler Probe Rig' },
    { value: 'Medical Spectrophotometer & Colorimeter', label: 'Medical Spectrophotometer & Colorimeter' },
    { value: 'Spirometer & Respiratory Gas Analyzer', label: 'Spirometer & Respiratory Gas Analyzer' },
  ],
  // Aerospace & Aeronautical
  aerospace: [
    { value: 'Subsonic / Supersonic Wind Tunnel Test Setup', label: 'Subsonic / Supersonic Wind Tunnel Test Setup' },
    { value: 'Aircraft Propulsion & Gas Turbine Test Bench', label: 'Aircraft Propulsion & Gas Turbine Test Bench' },
    { value: 'Flight Simulator Control Console & Avionics Trainer', label: 'Flight Simulator Control Console & Avionics Trainer' },
    { value: 'Gyroscope & Attitude Heading Indicator Test Rig', label: 'Gyroscope & Attitude Heading Indicator Test Rig' },
    { value: 'Drone / UAV Flight Controller Test Setup', label: 'Drone / UAV Flight Controller Test Setup' },
  ],
  // Physics & Basic Sciences
  physics: [
    { value: 'He-Ne / Diode Laser Source & Optical Rail', label: 'He-Ne / Diode Laser Source & Optical Rail' },
    { value: 'Michelson Interferometer Optical Bench', label: 'Michelson Interferometer Optical Bench' },
    { value: 'Hall Effect & Four-Probe Resistivity Setup', label: 'Hall Effect & Four-Probe Resistivity Setup' },
    { value: 'Spectrometer with Sodium / Mercury Arc Lamp', label: 'Spectrometer with Sodium / Mercury Arc Lamp' },
    { value: 'Solar Cell Characteristic Trainer Kit', label: 'Solar Cell Characteristic Trainer Kit' },
    { value: 'Planck Constant / Photoelectric Effect Apparatus', label: 'Planck Constant / Photoelectric Effect Apparatus' },
  ],
};

function getDevicesForDepartmentAndStream(deptName, streamName) {
  const deptStr = (deptName || '').toLowerCase();
  const streamStr = (streamName || '').toLowerCase();

  const matchedDevices = [];

  // Check specific stream keyword matches
  for (const streamRule of STREAM_KEYWORD_DEVICES_MAP) {
    if (streamRule.matches(deptStr, streamStr)) {
      matchedDevices.push(...streamRule.devices);
    }
  }

  // Check department category defaults
  if (
    deptStr.includes('computer') ||
    deptStr.includes('cse') ||
    deptStr.includes('it') ||
    deptStr.includes('bca') ||
    deptStr.includes('mca') ||
    deptStr.includes('information tech')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.cse);
  } else if (
    deptStr.includes('communication') ||
    deptStr.includes('ece') ||
    deptStr.includes('telecom')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.ece);
  } else if (
    deptStr.includes('electrical') ||
    deptStr.includes('eee') ||
    deptStr.includes('ee')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.eee);
  } else if (
    deptStr.includes('instrumentation') ||
    deptStr.includes('eie') ||
    deptStr.includes('ice')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.ece);
  } else if (
    deptStr.includes('mechanical') ||
    deptStr.includes('me') ||
    deptStr.includes('automobile') ||
    deptStr.includes('production')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.me);
  } else if (
    deptStr.includes('civil') ||
    deptStr.includes('ce') ||
    deptStr.includes('structural')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.ce);
  } else if (deptStr.includes('pharmacy') || deptStr.includes('pharm')) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.pharmacy);
  } else if (
    deptStr.includes('biotech') ||
    deptStr.includes('genetic') ||
    deptStr.includes('biology')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.biotech);
  } else if (deptStr.includes('chemical')) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.chemical);
  } else if (
    deptStr.includes('biomedical') ||
    deptStr.includes('medical electronics')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.biomedical);
  } else if (deptStr.includes('aero')) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.aerospace);
  } else if (
    deptStr.includes('physics') ||
    deptStr.includes('science') ||
    deptStr.includes('optics')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.physics);
  } else if (
    deptStr.includes('multimedia') ||
    deptStr.includes('animation') ||
    deptStr.includes('media')
  ) {
    matchedDevices.push(...DEPARTMENT_DEFAULTS_MAP.cse);
  }

  // Fallback if none matched
  if (matchedDevices.length === 0) {
    matchedDevices.push(
      ...DEPARTMENT_DEFAULTS_MAP.cse,
      ...DEPARTMENT_DEFAULTS_MAP.ece,
      ...DEPARTMENT_DEFAULTS_MAP.me
    );
  }

  // Deduplicate by value
  const seen = new Set();
  const uniqueDevices = [];
  for (const item of matchedDevices) {
    if (!seen.has(item.value)) {
      seen.add(item.value);
      uniqueDevices.push(item);
    }
  }

  return [
    ...uniqueDevices,
    ...COMMON_LAB_FACILITIES,
    { value: 'OTHER_DEVICE', label: 'Other Equipment / Device (Specify Manually)' },
  ];
}

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
  const [loadingRefData, setLoadingRefData] = useState(true);

  // Form Fields
  const [studentCode, setStudentCode] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [customStream, setCustomStream] = useState('');
  const [yearSemester, setYearSemester] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [customDeviceType, setCustomDeviceType] = useState('');
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

  // Fetch departments on mount
  useEffect(() => {
    async function loadReferenceData() {
      try {
        setLoadingRefData(true);
        const deptsData = await getDepartments();
        setDepartments(deptsData || []);
      } catch (err) {
        setSubmitError('Failed to load campus departments. Please refresh the page.');
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

  // Compute dynamic equipment & device list based on selected Department and Stream/Branch
  const availableDevices = useMemo(() => {
    const deptToUse = selectedDept === 'OTHER' ? customDepartment : selectedDept;
    const streamToUse = selectedStream === 'OTHER_STREAM' ? customStream : selectedStream;
    return getDevicesForDepartmentAndStream(deptToUse, streamToUse);
  }, [selectedDept, selectedStream, customDepartment, customStream]);

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

    if (!buildingName.trim()) {
      newErrors.buildingName = 'Building name or block number is required.';
    }
    if (!roomName.trim()) {
      newErrors.roomName = 'Room number or lab identifier is required.';
    }
    if (!deviceType) {
      newErrors.deviceType = 'Please select the equipment / device type.';
    } else if (deviceType === 'OTHER_DEVICE' && !customDeviceType.trim()) {
      newErrors.customDeviceType = 'Please specify the equipment / device name.';
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
      const finalDeviceType =
        deviceType === 'OTHER_DEVICE' ? customDeviceType.trim() : deviceType;

      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('studentCode', studentCode.trim());
      formData.append('department', finalDepartment);
      formData.append('stream', finalStream);
      if (yearSemester) formData.append('yearSemester', yearSemester);
      formData.append('buildingName', buildingName.trim());
      formData.append('roomName', roomName.trim());
      formData.append('deviceType', finalDeviceType);
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
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.photo}
                </span>
              )}
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 2: Student Information & Academic Stream */}
            <div>
              <h2 className="text-base font-headline font-bold text-on-surface mb-4">
                Student & Academic Details
              </h2>
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
                      setDeviceType(''); // Reset device selection to refresh tailored list
                      setCustomDeviceType('');
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
                      onChange={(e) => {
                        setCustomDepartment(e.target.value);
                        setDeviceType('');
                        setCustomDeviceType('');
                      }}
                      error={errors.customDepartment}
                      required
                    />

                    <Input
                      label="Specify Stream / Branch"
                      id="customStream"
                      name="customStream"
                      placeholder="e.g. B.Pharm / General / Specialized Core"
                      value={customStream}
                      onChange={(e) => {
                        setCustomStream(e.target.value);
                        setDeviceType('');
                        setCustomDeviceType('');
                      }}
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
                        setDeviceType(''); // Refresh tailored devices
                        setCustomDeviceType('');
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
                          onChange={(e) => {
                            setCustomStream(e.target.value);
                            setDeviceType('');
                            setCustomDeviceType('');
                          }}
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
              <h2 className="text-base font-headline font-bold text-on-surface mb-4">Campus Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Building Name / Block / Number"
                  id="buildingName"
                  name="buildingName"
                  placeholder="e.g. Block A, Tech Park, Main Building, Academic Block 2"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  error={errors.buildingName}
                  required
                />

                <Input
                  label="Room Number / Lab Identifier"
                  id="roomName"
                  name="roomName"
                  placeholder="e.g. Lab 102, Room 305, Workshop 1, Ground Floor Lab"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  error={errors.roomName}
                  required
                />
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Section 4: Device & Equipment Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-headline font-bold text-on-surface">
                  Equipment & Device Details
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                <Select
                  label="Equipment / Device Type"
                  id="deviceType"
                  name="deviceType"
                  placeholder={
                    !selectedDept
                      ? 'Select Department above to view customized devices (or choose general facility)'
                      : `Select Equipment for ${selectedStream || selectedDept}`
                  }
                  options={availableDevices}
                  value={deviceType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDeviceType(val);
                    if (val !== 'OTHER_DEVICE') {
                      setCustomDeviceType('');
                    }
                  }}
                  error={errors.deviceType}
                  helperText={
                    !selectedDept
                      ? 'Tip: Select your academic department and stream in Section 2 above to view equipment customized for your branch.'
                      : `Displaying lab equipment tailored for ${selectedStream || selectedDept} + common campus facilities.`
                  }
                  required
                />

                {deviceType === 'OTHER_DEVICE' && (
                  <Input
                    label="Specify Equipment / Device Name"
                    id="customDeviceType"
                    name="customDeviceType"
                    placeholder="e.g. Spectrum Analyzer, Fiber Optic Splicer, Rotary Evaporator"
                    value={customDeviceType}
                    onChange={(e) => setCustomDeviceType(e.target.value)}
                    error={errors.customDeviceType}
                    required
                  />
                )}

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
