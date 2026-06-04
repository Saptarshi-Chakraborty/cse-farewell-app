import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import AllVideoDevicesDropdown from "./AllVideoDevicesDropdown";
import { toast } from "sonner";
import { Button } from "../retroui/Button";
import { ScanQrCode as QrCodeIcon } from "lucide-react";
import FlashLightButton from "./FlashLightButton";

type VideoState = {
  gotPermissions: boolean;
  cameraStarted: boolean;
  numberOfDevices: number;
  errorMessage: string | null;
};

type ScannerProps = {
  qrData: string | null;
  setQrData: (value: string) => void | Promise<void>;
  autoStart?: boolean;
};

// --- GLOBAL CACHE ---
// Keeps camera settings in memory across unmounts for faster "Scan Again"
let globalCachedPermissions = false;
let globalCachedDevices: MediaDeviceInfo[] = [];
let globalCachedCameraId: string | null = null;
// --------------------

const Scanner: React.FC<ScannerProps> = ({ qrData, setQrData, autoStart = false }) => {
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  if (!codeReaderRef.current) {
    codeReaderRef.current = new BrowserMultiFormatReader();
  }

  const isScanningRef = useRef(false);
  const mountedRef = useRef(true);

  const [allVideoInputDevices, setAllVideoInputDevices] = useState<MediaDeviceInfo[]>(globalCachedDevices);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(globalCachedCameraId);
  const [videoState, setVideoState] = useState<VideoState>({
    gotPermissions: globalCachedPermissions,
    cameraStarted: false,
    numberOfDevices: globalCachedDevices.length,
    errorMessage: null,
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Sync state to cache when it changes
  useEffect(() => {
    globalCachedPermissions = videoState.gotPermissions;
    globalCachedDevices = allVideoInputDevices;
    globalCachedCameraId = currentCameraId;
  }, [videoState.gotPermissions, allVideoInputDevices, currentCameraId]);

  // Intent to have the camera running or not
  const [isActive, setIsActive] = useState<boolean>(autoStart);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getAllAvailavleVideoInputs = useCallback(async () => {
    if (!codeReaderRef.current) return;
    try {
      const allDevices = await codeReaderRef.current.listVideoInputDevices();
      if (mountedRef.current) {
        setAllVideoInputDevices(allDevices);
        setVideoState((oldState) => ({
          ...oldState,
          numberOfDevices: allDevices.length,
        }));
      }
    } catch (err) {
      console.error("Failed to list video devices", err);
    }
  }, []);

  const getVideoPermission = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((t) => t.stop());
      
      if (mountedRef.current) {
        setVideoState((prev) => ({ ...prev, gotPermissions: true }));
        getAllAvailavleVideoInputs();
      }
    } catch (err) {
      console.log(err);
      toast.error("Camera permissions denied or unavailable.");
    }
  }, [getAllAvailavleVideoInputs]);

  const stopCamera = useCallback(() => {
    isScanningRef.current = false;

    try {
      (codeReaderRef.current as any)?.stopContinuousDecode?.();
      (codeReaderRef.current as any)?.stopAsyncDecode?.();
      codeReaderRef.current?.reset();
    } catch (e) {
      console.log("Error while stopping decoder", e);
    }

    if (mountedRef.current) {
      setVideoState((prev) => ({ ...prev, cameraStarted: false }));
      setMediaStream(null);
    }

    const videoElement = videoElementRef.current;
    if (videoElement) {
      videoElement.onloadedmetadata = null;
      const src = videoElement.srcObject as MediaStream | null;
      if (src) {
        src.getTracks().forEach((track: MediaStreamTrack) => {
          try {
            track.stop();
          } catch {}
        });
      }
      videoElement.pause();
      videoElement.srcObject = null;
      try {
        videoElement.removeAttribute("src");
        videoElement.load();
      } catch {}
    }
  }, []);

  const startCamera = useCallback(() => {
    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    try {
      stopCamera();

      videoElement.onloadedmetadata = () => {
        const s = videoElement.srcObject as MediaStream | null;
        if (mountedRef.current) {
          setMediaStream(s || null);
          setVideoState((prev) => ({ ...prev, cameraStarted: true }));
        }
      };

      isScanningRef.current = true;

      codeReaderRef.current?.decodeFromVideoDevice(
        currentCameraId ?? null,
        videoElement,
        (result, error) => {
          if (!isScanningRef.current) return;
          if (result) {
            setQrData(result.toString());
            // Intentionally set inactive to trigger stop
            setIsActive(false);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.log("Error in QR Code Decoder", error);
          }
        }
      );
    } catch (err) {
      console.log(err);
      toast.error("Error in starting camera");
    }
  }, [currentCameraId, setQrData, stopCamera]);

  // Initial mount permission check
  useEffect(() => {
    if (!globalCachedPermissions) {
      getVideoPermission();
    }
    return () => {
      stopCamera();
    };
  }, [getVideoPermission, stopCamera]);

  // Handle active state
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && videoState.gotPermissions) {
      // Only start if we have a camera selected OR we know there are no devices
      if (currentCameraId || videoState.numberOfDevices === 0) {
        // Debounce camera start slightly to avoid rapid restarts when swapping cameras
        timer = setTimeout(() => {
          startCamera();
        }, 100);
      }
    } else {
      stopCamera();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, videoState.gotPermissions, currentCameraId, videoState.numberOfDevices, startCamera, stopCamera]);

  // Global listeners to defensively stop camera on tab hide/leave
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setIsActive(false);
      }
    };
    const onPageHide = () => setIsActive(false);
    const onBeforeUnload = () => setIsActive(false);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
      <div className="w-full md:w-2/3 max-w-md h-64 md:h-80 relative rounded border-2 border-dark mx-auto">
        <video
          ref={videoElementRef}
          className="w-full h-full object-cover rounded"
          style={{
            display: videoState.cameraStarted ? "block" : "none",
          }}
          id="videoElement"
          autoPlay
          playsInline
          muted
        />

        {!videoState.cameraStarted && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <QrCodeIcon className="h-24 w-24 text-gray-500" />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
        <AllVideoDevicesDropdown
          videoState={videoState}
          allVideoDeviceObjects={allVideoInputDevices}
          setCurrentCamera={setCurrentCameraId}
          currentCameraId={currentCameraId}
        />

        <ActionButtons
          videoState={videoState}
          getCameraPermission={getVideoPermission}
          startCameraFunction={() => setIsActive(true)}
          stopCameraFunction={() => setIsActive(false)}
          mediaStream={mediaStream}
        />
      </div>
    </div>
  );
};

type ActionButtonsProps = {
  videoState: VideoState;
  getCameraPermission: () => void;
  startCameraFunction: () => void;
  stopCameraFunction: () => void;
  mediaStream: MediaStream | null;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  videoState,
  getCameraPermission,
  startCameraFunction,
  stopCameraFunction,
  mediaStream,
}) => {
  return (
    <>
      {!videoState.gotPermissions ? (
        <Button onClick={getCameraPermission}>Get Permissions</Button>
      ) : (
        <div className="flex items-center gap-2">
          {!videoState.cameraStarted ? (
            <Button
              onClick={startCameraFunction}
              className="bg-green-400 hover:bg-green-500"
            >
              Start Camera
            </Button>
          ) : (
            <>
              <FlashLightButton videoStream={mediaStream} />
              <Button
                onClick={stopCameraFunction}
                className="bg-destructive text-white/90 hover:bg-destructive border-black"
              >
                Stop Camera
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Scanner;
