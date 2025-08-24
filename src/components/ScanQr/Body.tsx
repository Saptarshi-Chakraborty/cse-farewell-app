"use client";

import React, { useState } from "react";
import { Text } from "../retroui/Text";
import { Button } from "../retroui/Button";
import { Card } from "../retroui/Card";
import { retroStyle } from "@/lib/styles";
import Scanner from "./Scanner";
import { ScannedStudent } from "@/lib/types";

const ScanQrBody = () => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [scannedStudent, setScannedStudent] = useState<ScannedStudent | null>(null);

  // Process QR data when received
  const handleQrData = (data: string) => {
    setQrData(data);
    try {
      // Attempt to parse as JSON if it's a valid student data
      const parsedData = JSON.parse(data);
      if (parsedData.name && parsedData.roll) {
        setScannedStudent(parsedData);
      }
    } catch (e) {
      // If not JSON, just display as raw text
      setScannedStudent(null);
    }
  };

  return (
    <main id="main-content" className="flex justify-center">
      <section className="space-y-6 max-w-3xl w-full">
        <div className="grid grid-cols-1 gap-4 items-center">
          <Text as="h2" className="text-3xl text-center">
            Scan Food Coupon QR Code
          </Text>
        </div>

        <Card className={`${retroStyle} p-6 block`}>
          <div className="flex flex-col items-center w-full">
            {/* Custom QR Scanner with fixed dimensions */}
            <div className="mb-4 w-full">
              <Scanner qrData={qrData} setQrData={handleQrData} />
            </div>

            {/* Result / Helper */}
            {qrData ? (
              <div className={`mt-2 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                <Text as="h3" className="text-xl mb-2">
                  Scan Result
                </Text>
                {scannedStudent ? (
                  <>
                    <p className="text-lg">{scannedStudent.name}</p>
                    <p className="text-md">{scannedStudent.food}</p>
                    {scannedStudent.status && (
                      <p className="text-md font-bold text-green-600">
                        {scannedStudent.status}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lg break-words">{qrData}</p>
                )}
                <div className="mt-4">
                  <Button
                    className="uppercase bg-blue-400 hover:bg-blue-500"
                    onClick={() => setQrData(null)}
                  >
                    Clear Result
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`mt-2 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                <Text as="h3" className="text-xl mb-2">
                  Ready to Scan
                </Text>
                <Text as="p" className="text-gray-600">
                  Click "Start Camera" and point the camera at the QR code.
                </Text>
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
};

export default ScanQrBody;