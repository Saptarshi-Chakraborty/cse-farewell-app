import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import AllVideoDevicesDropdown from "./AllVideoDevicesDropdown";
import { toast } from "react-toastify";
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
  setQrData: (value: string) => void;
};

const Scanner: React.FC<ScannerProps> = ({ qrData, setQrData }) => {
  const codeReader = new BrowserMultiFormatReader();

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
    const allDevices = await codeReader.listVideoInputDevices();
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
      video: {
        facingMode: "environment",
      },
      audio: false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((_stream) => {
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
      const constraints: MediaStreamConstraints = {
        video: currentCameraId
          ? { deviceId: { exact: currentCameraId } }
          : true,
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
      videoElement.play();

      // Store the media stream for flashlight control
      setMediaStream(stream);

      setVideoState((prev) => ({ ...prev, cameraStarted: true }));

      // Start reading QR code
      await codeReader.decodeFromVideoDevice(
        currentCameraId,
        videoElement,
        (result, error) => {
          console.log("Scanning for Qr Code...");
          if (result) {
            stopCamera();

            console.log(result);
            outputBoxRef.current &&
              (outputBoxRef.current.innerText = result.toString());
            setQrData(result.toString());

            codeReader.stopAsyncDecode();
            codeReader.reset();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.log("Error in QR Code Decoder");
            console.log(error);
          }
        }
      );

      console.log(videoElementRef.current?.style.display);
    } catch (err) {
      console.log(err);
      alert("Error in starting camera");
    }
  }

  function stopCamera() {
    console.log("Stopping camera...");
    codeReader.stopAsyncDecode();
    codeReader.reset();

    setVideoState((prev) => ({ ...prev, cameraStarted: false }));

    const videoElement = videoElementRef.current;
    if (!videoElement) return;
    const src = videoElement.srcObject as MediaStream | null;
    if (!src) return;
    src.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    videoElement.srcObject = null;

    // Clear the media stream
    setMediaStream(null);
  }

  // ----- HOOCKs ----- //

  // when the document loads
  useEffect(() => {
    getVideoPermission();

    const el = document.getElementById(
      "videoElement"
    ) as HTMLVideoElement | null;
    console.log(`display : ${el?.style.height}`);

    return () => {
      stopCamera();
      setAllVideoInputDevices([]);
      setVideoState({
        gotPermissions: false,
        cameraStarted: false,
        numberOfDevices: 0,
        errorMessage: null,
      });
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
