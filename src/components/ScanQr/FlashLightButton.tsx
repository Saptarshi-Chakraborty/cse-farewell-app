import React, { useEffect, useState } from 'react'
import { Button } from "@/components/retroui/Button";
import { retroStyle } from "@/lib/styles";
import { Flashlight } from "lucide-react";

type FlashLightButtonProps = {
  videoStream: MediaStream | null;
}

const FlashLightButton: React.FC<FlashLightButtonProps> = ({ videoStream }) => {
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  useEffect(() => {
    // Check if the device has a flashlight when stream changes
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        setHasFlash(capabilities.torch || false);
      }
    } else {
      setHasFlash(false);
      setIsFlashOn(false);
    }
  }, [videoStream]);

  const toggleFlash = async () => {
    if (!videoStream) return;
    
    const videoTrack = videoStream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const newFlashState = !isFlashOn;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState }]
      });
      setIsFlashOn(newFlashState);
    } catch (error) {
      console.error('Error toggling flashlight:', error);
    }
  };

  if (!hasFlash) return null;

  return (
    <Button
    size="icon"
      variant="outline"
      className={`border-black p-2.5 ${isFlashOn ? "bg-yellow-300 hover:bg-yellow-400 text-black" : ""}`}
      onClick={toggleFlash}
      aria-pressed={isFlashOn}
      title={isFlashOn ? "Turn off flashlight" : "Turn on flashlight"}
    >
      <Flashlight className="h-4 w-4" />
    </Button>
  );
}

export default FlashLightButton