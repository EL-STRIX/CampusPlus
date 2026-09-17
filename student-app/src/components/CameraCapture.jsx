import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * CameraCapture Component
 * 
 * Exclusively Live Camera Capture.
 * Entirely eliminates file uploads, file pickers, and gallery selection.
 * Directly streams the device camera (webcam / mobile camera) via WebRTC getUserMedia,
 * frames the fault with an interactive viewfinder, and snaps a live photo.
 */
export default function CameraCapture({
  photoFile,
  photoPreview,
  onPhotoCaptured,
  onPhotoRemoved,
  error,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [captureTime, setCaptureTime] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Stop camera stream tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping camera track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsConnecting(false);
  }, []);

  // Check for multiple video input devices
  const checkVideoDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch (e) {
      console.warn('Could not enumerate video devices:', e);
    }
  }, []);

  // Effect to manage live camera stream when isCameraActive or facingMode changes
  useEffect(() => {
    let isCancelled = false;

    if (!isCameraActive) {
      stopCameraStream();
      return;
    }

    async function initCamera() {
      stopCameraStream();
      setCameraError(null);
      setIsStreaming(false);
      setIsConnecting(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isCancelled) {
          setIsConnecting(false);
          setCameraError(
            'Live camera access is not supported by this browser. Please open in Chrome, Edge, Safari, or Firefox with camera permissions.'
          );
        }
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          const handleReady = () => {
            if (!isCancelled) {
              setIsStreaming(true);
              setIsConnecting(false);
            }
          };

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(handleReady)
              .catch((err) => {
                console.warn('Auto-play caught:', err);
                handleReady();
              });
          };

          videoRef.current.oncanplay = handleReady;

          if (videoRef.current.readyState >= 2) {
            handleReady();
          }
        }

        await checkVideoDevices();
      } catch (err) {
        console.error('Camera initialization error:', err);
        if (!isCancelled) {
          setIsConnecting(false);
          let message = 'Unable to access your device camera.';
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Camera permission was denied. Please allow camera permissions in your browser address bar and retry.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            message = 'No camera or webcam was found on this device.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            message = 'Camera is already in use by another app. Please close other camera applications.';
          }
          setCameraError(message);
        }
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      stopCameraStream();
    };
  }, [isCameraActive, facingMode, stopCameraStream, checkVideoDevices]);

  // Open live camera stream
  const handleStartCamera = () => {
    setCameraError(null);
    setIsCameraActive(true);
  };

  // Close live camera
  const handleStopCamera = () => {
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Flip facing mode (Front vs Back camera)
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture snapshot from the live stream
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Visual shutter flash effect
    setIsCapturingFlash(true);

    // If front camera, optionally mirror the captured photo or draw standard
    ctx.drawImage(video, 0, 0, width, height);

    setTimeout(() => {
      setIsCapturingFlash(false);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const timestamp = new Date();
          const fileName = `live_camera_${timestamp.toISOString().replace(/[:.]/g, '-')}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });

          setCaptureTime(
            timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          onPhotoCaptured(file);
          setIsCameraActive(false);
        },
        'image/jpeg',
        0.92
      );
    }, 120);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header with Camera-Only Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-sm font-headline font-semibold text-on-surface flex items-center gap-1.5">
          <span>Live Camera Evidence Photo</span>
          <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Real-Time Live Camera Only</span>
        </div>
      </div>

      {/* STATE 1: PHOTO CAPTURED PREVIEW */}
      {photoPreview && !isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-surface-container-low to-emerald-500/5 p-4 sm:p-5 shadow-card transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Captured Thumbnail with LIVE Badge */}
            <div className="relative group shrink-0">
              <img
                src={photoPreview}
                alt="Captured live fault evidence"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl border-2 border-emerald-600/40 shadow-md"
              />
              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE CAPTURED
              </div>
            </div>

            {/* Photo Details & Verification status */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Live Authenticated
                </span>
                {captureTime && (
                  <span className="text-xs text-outline font-medium">
                    Snapped at {captureTime}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-headline font-bold text-on-surface truncate">
                {photoFile?.name || 'Live Camera Capture'}
              </h4>

              <span className="text-xs text-on-surface-variant block mt-0.5">
                {photoFile?.size ? `${(photoFile.size / (1024 * 1024)).toFixed(2)} MB • Live Frame` : 'Live Frame Captured'}
              </span>

              <p className="text-[11px] text-emerald-800/90 font-medium mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Captured in real-time from device camera feed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={handleStartCamera}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-headline font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake Live Photo
              </button>

              <button
                type="button"
                onClick={onPhotoRemoved}
                className="px-3 py-2 rounded-xl border border-error/30 text-error hover:bg-error/10 text-xs font-headline font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: CAMERA IS CURRENTLY LIVE (EMBEDDED VIEWFINDER) */}
      {isCameraActive && (
        <div className="relative w-full bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/40 flex flex-col animate-fadeIn">
          {/* Viewfinder Top Bar */}
          <div className="px-4 py-3 bg-neutral-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-headline font-bold tracking-wider uppercase">
                🔴 LIVE CAMERA ACTIVE
              </span>
              <span className="text-neutral-400 text-xs hidden sm:inline">
                ({facingMode === 'environment' ? 'Back / Environment Camera' : 'Front Camera'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5"
                  title="Switch between front and back camera"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Flip Camera</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStopCamera}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Viewfinder Video Frame */}
          <div className="relative w-full h-[280px] sm:h-[360px] bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="p-6 text-center max-w-md">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="text-white font-headline font-bold text-sm mb-2">Camera Unavailable</h4>
                <p className="text-neutral-300 text-xs mb-4 leading-relaxed">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCameraError(null);
                    setIsCameraActive(false);
                    setTimeout(() => setIsCameraActive(true), 50);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all"
                >
                  Retry Camera
                </button>
              </div>
            ) : (
              <>
                {/* Video Element is mounted and attached via useEffect */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  className="w-full h-full object-cover bg-black"
                />

                {/* Connecting Loading Indicator */}
                {isConnecting && !isStreaming && (
                  <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="w-10 h-10 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-white text-xs font-headline font-semibold">
                      Connecting live camera feed...
                    </span>
                    <span className="text-neutral-400 text-[11px] mt-1">
                      Starting camera stream
                    </span>
                  </div>
                )}

                {/* Visual Flash effect on snap */}
                {isCapturingFlash && (
                  <div className="absolute inset-0 bg-white z-30 animate-ping opacity-95 pointer-events-none" />
                )}

                {/* Viewfinder Target Framing Grid */}
                {isStreaming && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-8">
                    <div className="w-full max-w-sm h-48 sm:h-56 border-2 border-white/40 rounded-2xl relative shadow-inner">
                      {/* 4 Corner reticles */}
                      <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-fixed rounded-tl" />
                      <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-fixed rounded-tr" />
                      <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-fixed rounded-bl" />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-fixed rounded-br" />

                      <div className="absolute bottom-2.5 inset-x-0 text-center">
                        <span className="bg-black/70 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md">
                          Point at the equipment fault or asset tag
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Viewfinder Bottom Capture Control Bar */}
          <div className="p-4 bg-neutral-900 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleStopCamera}
              className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-headline font-semibold transition-all"
            >
              Cancel
            </button>

            {/* Central Shutter Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!isStreaming || cameraError}
                onClick={handleCaptureSnapshot}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white flex items-center justify-center p-1 transition-all shadow-xl ${
                  !isStreaming || cameraError
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95 active:border-primary-fixed ring-4 ring-white/20'
                }`}
                title="Take Photo"
              >
                <div className="w-full h-full bg-white rounded-full hover:bg-primary-fixed transition-colors flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                </div>
              </button>
            </div>

            <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
              Click shutter to snap
            </span>
          </div>
        </div>
      )}

      {/* STATE 3: IDLE / NO PHOTO YET */}
      {!photoPreview && !isCameraActive && (
        <div
          className={`w-full rounded-2xl border-2 transition-all p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface-container-lowest to-surface-container-low ${
            error
              ? 'border-error bg-red-50/40'
              : 'border-primary/30 hover:border-primary shadow-subtle hover:shadow-card'
          }`}
        >
          {/* Live Camera Aperture Icon */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-8 ring-primary/5 transition-transform group-hover:scale-105">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm text-[10px] font-bold animate-pulse">
              ●
            </span>
          </div>

          <h3 className="text-base font-headline font-bold text-on-surface mb-1">
            Live Camera Photo Required
          </h3>
          <p className="text-xs font-sans text-on-surface-variant max-w-md mb-5 leading-relaxed">
            Click below to start your live camera and capture the malfunctioning equipment directly on the spot.
            <span className="font-semibold text-primary block mt-1">
              Live webcam &amp; camera capture only • No gallery or file uploads permitted.
            </span>
          </p>

          <button
            type="button"
            onClick={handleStartCamera}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-headline font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Start Live Camera</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span className="text-xs text-error font-medium flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
