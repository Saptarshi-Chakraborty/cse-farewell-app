import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import AllVideoDevicesDropdown from "./AllVideoDevicesDropdown";
import { toast } from "sonner";
import { Button } from "../retroui/Button";
// Import an icon for the placeholder
// import { QrCodeIcon } from "@heroicons/react/24/outline";
import { ScanQrCode as QrCodeIcon } from "lucide-react";
import FlashLightButton from "./FlashLightButton";
// import { retroStyle } from "@/lib/styles";

type VideoState = {
  gotPermissions: boolean;
  cameraStarted: boolean;
  numberOfDevices: number;
  errorMessage: string | null;
};

type ScannerProps = {
  qrData: string | null;
  // allow async handler
  setQrData: (value: string) => void | Promise<void>;
  // new: auto start camera when true
  autoStart?: boolean;
};

const Scanner: React.FC<ScannerProps> = ({ qrData, setQrData, autoStart = false }) => {
  // Use a stable ZXing reader instance across renders
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  if (!codeReaderRef.current) {
    codeReaderRef.current = new BrowserMultiFormatReader();
  }
  // Guard to prevent callback work after stopping
  const isScanningRef = useRef(false);

  // Track mount state to avoid setState after unmount
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stable ref to the latest stopCamera for event handlers
  const stopCameraRef = useRef<() => void>(() => {});
  useEffect(() => {
    stopCameraRef.current = stopCamera;
  });

  // State Variables
  const [allVideoInputDevices, setAllVideoInputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    gotPermissions: false,
    cameraStarted: false,
    numberOfDevices: 0,
    errorMessage: null,
  });
  const [qrCodeResult, setQrCodeResult] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Reference variables
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const outputBoxRef = useRef<HTMLParagraphElement | null>(null);

  // ---- Functions ---- //
  async function getAllAvailavleVideoInputs() {
    if (!codeReaderRef.current) return;
    const allDevices = await codeReaderRef.current.listVideoInputDevices();
    // console.log(allDevices);

    setAllVideoInputDevices(allDevices);

    setVideoState((oldState) => {
      return {
        ...oldState,
        numberOfDevices: allDevices.length,
      };
    });
  }

  function getVideoPermission() {
    const constraints: MediaStreamConstraints = {
      video: { facingMode: "environment" },
      audio: false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((_stream) => {
        // Immediately stop the temp permission stream
        _stream.getTracks().forEach((t) => t.stop());

        console.log("Got camera permissions");
        setVideoState((prev) => ({ ...prev, gotPermissions: true }));
        getAllAvailavleVideoInputs();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error in getting camera permissions");
      });
  }

  async function startCamera() {
    console.log("Starting camera...");
    console.log(`Camera ID: ${currentCameraId}`);

    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    try {
      // Ensure previous session is fully stopped
      stopCamera();

      // Capture the stream that ZXing attaches to the video element
      const onLoadedMetadata = () => {
        const s = videoElement.srcObject as MediaStream | null;
        setMediaStream(s || null);
        setVideoState((prev) => ({ ...prev, cameraStarted: true }));
      };
      videoElement.onloadedmetadata = onLoadedMetadata;

      isScanningRef.current = true;

      // Let ZXing open and manage the MediaStream
      codeReaderRef.current?.decodeFromVideoDevice(
        currentCameraId ?? null,
        videoElement,
        (result, error) => {
          if (!isScanningRef.current) return; // ignore callbacks after stop
          console.log("Scanning for Qr Code...");
          if (result) {
            outputBoxRef.current &&
              (outputBoxRef.current.innerText = result.toString());
            setQrData(result.toString());
            stopCamera();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.log("Error in QR Code Decoder");
            console.log(error);
          }
        }
      );
    } catch (err) {
      console.log(err);
      toast.error("Error in starting camera");
    }
  }

  function stopCamera() {
    console.log("Stopping camera...");
    isScanningRef.current = false;

    // Stop ZXing’s decoding and its internal stream
    try {
      (codeReaderRef.current as any)?.stopContinuousDecode?.();
      (codeReaderRef.current as any)?.stopAsyncDecode?.();
      codeReaderRef.current?.reset();
    } catch (e) {
      console.log("Error while stopping decoder", e);
    }

    // Avoid state updates during unmount
    if (mountedRef.current) {
      setVideoState((prev) => ({ ...prev, cameraStarted: false }));
    }

    const videoElement = videoElementRef.current;
    if (videoElement) {
      // Detach handlers
      videoElement.onloadedmetadata = null;
      // Clear additional potential listeners defensively
      videoElement.onloadeddata = null;
      videoElement.oncanplay = null;
      videoElement.onplay = null;
      videoElement.onpause = null;
      videoElement.onended = null;
      videoElement.ontimeupdate = null;

      // Hard-stop any remaining tracks attached to the video element
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
      // Remove any lingering src and force a load to fully detach
      try {
        videoElement.removeAttribute("src");
        videoElement.load();
      } catch {}
    }

    // Clear the media stream (used for flashlight) only if mounted
    if (mountedRef.current) {
      setMediaStream(null);
    }
  }

  // ----- HOOCKs ----- //

  // Auto-start camera when requested (used after Clear Result).
  useEffect(() => {
    if (!autoStart) return;
    if (videoState.cameraStarted) return;
    if (videoState.gotPermissions) {
      startCamera();
    } else {
      // request permission; once granted, effect will run again and start camera
      getVideoPermission();
    }
  }, [autoStart, videoState.gotPermissions, videoState.cameraStarted]);

  // Global listeners to defensively stop camera on tab hide/leave
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopCameraRef.current();
      }
    };
    const onPageHide = () => stopCameraRef.current();
    const onBeforeUnload = () => stopCameraRef.current();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // when the document loads
  useEffect(() => {
    getVideoPermission();

    const el = document.getElementById(
      "videoElement"
    ) as HTMLVideoElement | null;
    console.log(`display : ${el?.style.height}`);

    return () => {
      // Only stop devices/decoders; do not set state during unmount
      stopCamera();
      setAllVideoInputDevices([]);
      // setVideoState({
      //   gotPermissions: false,
      //   cameraStarted: false,
      //   numberOfDevices: 0,
      //   errorMessage: null,
      // });
    };
  }, []);

  // Add this useEffect to watch for camera changes
  useEffect(() => {
    // If camera is already running and the camera ID changes, restart the camera
    if (videoState.cameraStarted && currentCameraId) {
      stopCamera();
      // Small delay to ensure previous camera is fully stopped
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  }, [currentCameraId]);

  // ----- JSX ----- //
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
      {/* Camera container with fixed dimensions - centered */}
      <div className="w-full md:w-2/3 max-w-md h-64 md:h-80 relative rounded border-2 border-dark mx-auto">
        {/* Video element */}
        <video
          ref={videoElementRef}
          className="w-full h-full object-cover rounded"
          style={{
            display: videoState.cameraStarted ? "block" : "none",
          }}
          id="videoElement"
          autoPlay
        />

        {/* Placeholder when camera is not active */}
        {!videoState.cameraStarted && (
          <div
            className={`w-full h-full bg-gray-800 flex items-center justify-center`}
          >
            <QrCodeIcon className="h-24 w-24 text-gray-500" />
          </div>
        )}
      </div>

      {/* Controls - centered */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
        {/* All Video Inputs Dropdown */}
        <AllVideoDevicesDropdown
          videoState={videoState}
          allVideoDeviceObjects={allVideoInputDevices}
          setCurrentCamera={setCurrentCameraId}
          currentCameraId={currentCameraId}
        />

        {/* Action Buttons */}
        <ActionButtons
          videoState={videoState}
          getCameraPermission={getVideoPermission}
          startCameraFunction={startCamera}
          stopCameraFunction={stopCamera}
          mediaStream={mediaStream}
        />

        <p className="text-wrap d-none" ref={outputBoxRef} id="outputBox"></p>
      </div>
    </div>
  );
};

type ActionButtonsProps = {
  videoState: VideoState;
  getCameraPermission: () => void;
  startCameraFunction: () => void | Promise<void>;
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
      {videoState.gotPermissions === false ? (
        <Button onClick={getCameraPermission} className="">
          Get Permissions
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          {videoState.cameraStarted === false ? (
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
