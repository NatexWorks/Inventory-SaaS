"use client";

import { useEffect, useRef, useState } from "react";
import { MdCameraAlt, MdFlashOn, MdFlipCameraIos, MdOutlineQrCodeScanner, MdStop } from "react-icons/md";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat } from "@zxing/library";
// ZXing formats we want the scanner to recognize.
const SUPPORTED_FORMATS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
  BarcodeFormat.DATA_MATRIX,
];

const LAST_CAMERA_KEY = "inventory-saas:last-camera";

// Camera support only depends on browser media APIs, not on BarcodeDetector.
function detectSupport() {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && !!navigator.mediaDevices?.enumerateDevices;
}

function cameraLabel(value, index, device) {
  if (value === "mode:environment") return "Rear camera";
  if (value === "mode:user") return "Front camera";
  return device?.label || `Camera ${index + 1}`;
}

export default function BarcodeCameraScanner({ onScan, onStatus, className = "" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  // `readerRef` stores the ZXing reader instance so we do not recreate it every render.
  const readerRef = useRef(null);
  // `scanControlsRef` holds the active ZXing scan controller for cleanup.
  const scanControlsRef = useRef(null);
  // In dev, React can briefly unmount/remount effects; this avoids stopping the camera too early.
  const cleanupTimerRef = useRef(null);
  // Keep the latest callbacks in refs so scanner effects do not restart on parent re-renders.
  const onScanRef = useRef(onScan);
  const onStatusRef = useRef(onStatus);
  const trackRef = useRef(null);
  const lastCodeRef = useRef("");

  const [open, setOpen] = useState(false);
  // `supported` is derived once because camera capability does not change during the session.
  const [supported] = useState(() => detectSupport());
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);

  // have to change mode : environment
  const [cameraValue, setCameraValue] = useState(() => {
    if (typeof window === "undefined") {
      return "mode:environment";
    }

    try {
      return window.localStorage.getItem(LAST_CAMERA_KEY) || "mode:environment";
    } catch {
      return "mode:environment";
    }
  });
  // 
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "Camera scanner ready" });

  // Create the ZXing reader once and clean it up when the component unmounts.
  useEffect(() => {
    if (supported) {
      const reader = new BrowserMultiFormatReader();
      reader.possibleFormats = SUPPORTED_FORMATS;
      readerRef.current = reader;
    }

    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      scanControlsRef.current?.stop?.();
      scanControlsRef.current = null;
      readerRef.current = null;
    };
  }, [supported]);

  // Update callback refs whenever the parent passes new handlers.
  useEffect(() => {
    onScanRef.current = onScan;
    onStatusRef.current = onStatus;
  }, [onScan, onStatus]);

  useEffect(() => {
    if (!open || !supported) {
      return undefined;
    }

    let active = true;

    // Enumerate cameras without asking for permission a second time.
    async function loadDevices() {
      try {
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter((device) => device.kind === "videoinput");
        if (!active) return;

        setDevices(videoDevices);

        if (cameraValue.startsWith("device:")) {
          const currentId = cameraValue.replace("device:", "");
          const hasSaved = videoDevices.some((device) => device.deviceId === currentId);
          if (!hasSaved && videoDevices[0]) {
            setCameraValue(`device:${videoDevices[0].deviceId}`);
          }
        }
      } catch (error) {
        if (active) {
          console.error("[BarcodeCameraScanner] Failed to enumerate cameras", error);
          const message = error?.message || "Camera unavailable";
          setStatus({ type: "unavailable", message });
          onStatusRef.current?.(message);
        }
      }
    }

    loadDevices();

    return () => {
      active = false;
    };
  }, [open, supported, cameraValue]);

  useEffect(() => {
    if (!open || !supported || !readerRef.current) {
      return undefined;
    }

    let active = true;

    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    function stopActiveStream() {
      scanControlsRef.current?.stop?.();
      scanControlsRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    function buildCameraCandidates() {
      const savedCamera = cameraValue || "mode:environment";

      if (savedCamera.startsWith("device:")) {
        const deviceId = savedCamera.replace("device:", "");
        return [
          { video: { deviceId: { exact: deviceId } }, audio: false },
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          { video: { facingMode: { ideal: "user" } }, audio: false },
        ];
      }

      const preferredFacingMode = savedCamera === "mode:user" ? "user" : "environment";
      const fallbackFacingMode = preferredFacingMode === "user" ? "environment" : "user";

      return [
        { video: { facingMode: { ideal: preferredFacingMode } }, audio: false },
        { video: { facingMode: { ideal: fallbackFacingMode } }, audio: false },
      ];
    }

    // Opens the selected camera and starts continuous ZXing decoding.
    async function startStream() {
      try {
        setLoading(true);
        setStatus({ type: "starting", message: "Starting camera..." });
        onStatusRef.current?.("Starting camera...");

        stopActiveStream();

        let stream = null;
        let lastError = null;
        const cameraCandidates = buildCameraCandidates();

        for (const constraints of cameraCandidates) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (error) {
            lastError = error;
            console.error("[BarcodeCameraScanner] getUserMedia failed", {
              constraints,
              error,
            });

            // Permission errors should stop immediately; unsupported camera IDs can fall back.
            if (error?.name === "NotAllowedError") {
              throw error;
            }
          }
        }

        if (!stream) {
          throw lastError || new Error("Unable to access camera");
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        trackRef.current = stream.getVideoTracks()[0] || null;
        const capabilities = trackRef.current?.getCapabilities?.() || {};
        setTorchAvailable(Boolean(capabilities.torch));
        setTorchEnabled(false);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        if (!videoRef.current) {
          throw new Error("Video element unavailable");
        }

        const controls = await readerRef.current.decodeFromVideoElement(videoRef.current, (result, error, scannerControls) => {
          scanControlsRef.current = scannerControls;

          if (error || !active || !result) {
            if (error && active) {
              console.warn("[BarcodeCameraScanner] ZXing scan callback error", error);
            }
            return;
          }

          const code = result.getText().trim();
          if (code && code !== lastCodeRef.current) {
            lastCodeRef.current = code;
            setStatus({ type: "scanning", message: `Detected ${code}` });
            onStatusRef.current?.(`Detected ${code}`);
            onScanRef.current?.(code);
          }
        });

        if (!active) {
          controls.stop?.();
          return;
        }

        scanControlsRef.current = controls;
        setStatus({ type: "ready", message: "Scanning in progress" });
        onStatusRef.current?.("Scanning in progress");
      } catch (error) {
        console.error("[BarcodeCameraScanner] Camera start failed", error);
        stopActiveStream();

        const message =
          error?.name === "NotAllowedError"
            ? "Camera permission denied"
            : error?.name === "NotFoundError"
              ? "Camera unavailable"
              : error?.message || "Unable to access camera";
        const type = error?.name === "NotAllowedError" ? "permission-denied" : error?.name === "NotFoundError" ? "unavailable" : "error";
        setStatus({ type, message });
        onStatusRef.current?.(message);

        if (error?.name === "NotAllowedError" || error?.name === "NotFoundError") {
          setOpen(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    startStream();

    return () => {
      active = false;
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }

      cleanupTimerRef.current = window.setTimeout(() => {
        stopActiveStream();
        cleanupTimerRef.current = null;
      }, 150);
    };
  }, [cameraValue, open, supported]);

  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      scanControlsRef.current?.stop?.();
      scanControlsRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function persistCamera(value) {
    setCameraValue(value);
    try {
      window.localStorage.setItem(LAST_CAMERA_KEY, value);
      } catch {
      console.warn("[BarcodeCameraScanner] Failed to persist selected camera");
    }
  }

  function stopCamera() {
    // Stop ZXing and the media stream together so nothing keeps running in the background.
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    if (scanControlsRef.current) {
      scanControlsRef.current.stop?.();
      scanControlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    trackRef.current = null;
    setTorchAvailable(false);
    setTorchEnabled(false);
    lastCodeRef.current = "";
    setOpen(false);
    setStatus({ type: "idle", message: "Camera stopped" });
    onStatusRef.current?.("Camera stopped");

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function toggleTorch() {
    const track = trackRef.current;
    const canUseTorch = track?.getCapabilities?.()?.torch;
    if (!track || !canUseTorch) {
      return;
    }

    const nextValue = !torchEnabled;
    try {
      await track.applyConstraints({ advanced: [{ torch: nextValue }] });
      setTorchEnabled(nextValue);
      onStatus?.(nextValue ? "Torch enabled" : "Torch disabled");
    } catch (error) {
      onStatus?.(error?.message || "Torch unavailable");
    }
  }

  function statusTone() {
    switch (status.type) {
      case "permission-denied":
        return "border-rose-200 bg-rose-50 text-rose-700";
      case "unsupported":
      case "unavailable":
      case "error":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "ready":
      case "starting":
      case "scanning":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  }

  const unavailableMessage = !supported
    ? "Your browser does not support live barcode detection."
    : status.message;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MdCameraAlt className="text-lg text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Camera Scanner</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-200"
          >
            <MdOutlineQrCodeScanner />
            {open ? "Scanning" : "Start Camera"}
          </button>
          {open ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <MdStop />
              Stop
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!supported ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {unavailableMessage} Manual barcode entry still works.
          </div>
        ) : null}

        {open && supported ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-slate-600">Camera</label>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <MdFlipCameraIos className="text-slate-400" />
                <select
                  value={cameraValue}
                  onChange={(event) => persistCamera(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="mode:environment">Rear camera</option>
                  <option value="mode:user">Front camera</option>
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={`device:${device.deviceId}`}>
                      {cameraLabel(`device:${device.deviceId}`, index, device)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleTorch}
                disabled={!torchAvailable}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdFlashOn className={torchEnabled ? "text-amber-500" : "text-slate-400"} />
                {torchEnabled ? "Torch on" : "Torch off"}
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="h-72 w-full object-cover" />
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${statusTone()}`}>
              {loading ? "Opening camera..." : status.message}
            </div>
          </>
        ) : open && !supported ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Browser unsupported. Use manual barcode input or a supported browser.
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Start the camera scanner to scan with a phone camera or an external USB webcam.
          </div>
        )}
      </div>
    </div>
  );
}
