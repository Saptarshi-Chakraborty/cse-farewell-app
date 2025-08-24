"use client";

import React, { useEffect, useState } from "react";
import { Text } from "../retroui/Text";
import { Button } from "../retroui/Button";
import { Card } from "../retroui/Card";
import { retroStyle } from "@/lib/styles";
import { ScanQrCode as QrCodeScanner } from "lucide-react";

type ScanResult = {
  name: string;
  food: string;
  status: string;
} | null;

const ScanQrBody = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);

  const startScan = () => {
    setIsScanning(true);
    setScanResult(null);
    // Simulate scan after 2s
    setTimeout(() => {
      setScanResult({
        name: "Student: Rohan Das",
        food: "Food: Veg",
        status: "Status: Valid Coupon",
      });
      setIsScanning(false);
    }, 2000);
  };

  useEffect(() => {
    // Auto-start on mount
    startScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main id="main-content">
      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <Text as="h2" className="text-3xl text-center sm:text-left">
            Scan Food Coupon QR Code
          </Text>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <Button
              className={`uppercase bg-blue-400 hover:bg-blue-500`}
              onClick={startScan}
              disabled={isScanning}
            >
              <QrCodeScanner className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">
                {scanResult ? "Rescan" : "Start Scan"}
              </span>
            </Button>
          </div>
        </div>

        <Card className={`${retroStyle} p-6 block`}>
          <div className="flex flex-col items-center">
            <div
              className={`w-64 h-64 md:w-80 md:h-80 bg-gray-800 flex items-center justify-center mb-6 ${retroStyle}`}
            >
              <QrCodeScanner className="h-36 w-36 text-gray-500" />
            </div>

            {isScanning ? (
              <div className={`mt-2 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                <Text as="h3" className="text-xl mb-2">
                  Scanning...
                </Text>
                <p className="text-gray-600">Point the camera at the QR code.</p>
              </div>
            ) : scanResult ? (
              <div className={`mt-2 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                <Text as="h3" className="text-xl mb-2">
                  Scan Result
                </Text>
                <p className="text-lg">{scanResult.name}</p>
                <p className="text-md">{scanResult.food}</p>
                <p className="text-md font-bold text-green-600">
                  {scanResult.status}
                </p>
              </div>
            ) : (
              <div className={`mt-2 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                <Text as="h3" className="text-xl mb-2">
                  Ready to Scan
                </Text>
                <p className="text-gray-600">Click Start Scan to begin.</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
};

export default ScanQrBody;