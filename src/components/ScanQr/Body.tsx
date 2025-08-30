"use client";

import React, { useState } from "react";
import { Text } from "../retroui/Text";
import { Button } from "../retroui/Button";
import { Card } from "../retroui/Card";
import { retroStyle } from "@/lib/styles";
import Scanner from "./Scanner";
import { ScannedStudent } from "@/lib/types";
import {
  DATABASE_ID,
  databases,
  FOOD_COUPON_COLLECTION_ID,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Badge } from "../retroui/Badge";
import { toast } from "sonner";

// add: extend scanned result to include year for display
type LocalScannedStudent = ScannedStudent & {
  year?: string;
  alreadyRedeemed?: boolean; // Track if the coupon was already redeemed
};

// add: normalize year to short form for display (matches Students page)
function getYearShortName(year: string | number): string {
  year = String(year).trim();
  switch (year) {
    case "1st Year":
    case "1":
      return "1st";
    case "2nd Year":
    case "2":
      return "2nd";
    case "3rd Year":
    case "3":
      return "3rd";
    case "4th Year":
    case "4":
      return "4th";
    default:
      return year;
  }
}

const ScanQrBody = () => {
  const [qrData, setQrData] = useState<string | null>(null);
  // change: use LocalScannedStudent to carry 'year'
  const [scannedStudent, setScannedStudent] =
    useState<LocalScannedStudent | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // new: auto-start camera after clearing result
  const [autoStartOnMount, setAutoStartOnMount] = useState(false);

  // derived UI state: show result box when verifying, after success, or when there's an error
  const showResultBox = verifying || Boolean(scannedStudent) || Boolean(errorMessage);

  const handleQrData = async (data: string) => {
    setQrData(data);
    setScannedStudent(null);
    setErrorMessage(null);

    const text = String(data || "").trim();
    const parts = text.split("-");
    if (parts.length !== 3) {
      setErrorMessage("Malformed QR data. Please try again.");
      return;
    }

    const [couponId, userId, randomCode] = parts;

    try {
      setVerifying(true);

      const coupon = await databases.getDocument(
        DATABASE_ID,
        FOOD_COUPON_COLLECTION_ID,
        couponId
      );

      if (
        !coupon ||
        String(coupon.user_id) !== userId ||
        String(coupon.random_code) !== String(randomCode)
      ) {
        console.log("Coupon data mismatch:", { coupon, userId, randomCode });
        setErrorMessage("Malformed QR data.");
        setVerifying(false);
        return;
      }

      const student = await databases.getDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        userId
      );

      if (!student) {
        setErrorMessage("Student not found for this coupon.");
        return;
      }

      const foodPref = String(student.food_preference || "").toLowerCase();
      const food =
        foodPref === "veg" ? "Veg" : foodPref === "non-veg" ? "Non Veg" : "N/A";

      // change: include normalized year for display so it always shows
      const yearShort = getYearShortName(student.year ?? "");

      // Check if coupon was already redeemed
      const alreadyRedeemed = Boolean(student.coupon_redeemed);
      let status = "";

      if (alreadyRedeemed) {
        status = "Coupon already redeemed";
      } else {
        // Mark the coupon as redeemed in the database
        try {
          await databases.updateDocument(
            DATABASE_ID,
            STUDENTS_COLLECTION_ID,
            userId,
            { coupon_redeemed: true }
          );
          status = "Valid Coupon";
        } catch (updateError) {
          console.error("Failed to mark coupon as redeemed:", updateError);
          status = "Valid coupon, but failed to mark as redeemed";
          toast.error("Error updating redemption status", { richColors: true });
        }
      }

      setScannedStudent({
        name: String(student.name || ""),
        roll: String(student.roll || ""),
        year: yearShort,
        food,
        status,
        alreadyRedeemed,
      });
    } catch (e) {
      console.error("Error verifying QR:", e);
      setErrorMessage("Error verifying QR. Please try again.");
    } finally {
      setVerifying(false);
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
            {/* Scanner is hidden while verifying, after a successful scan, or when there's an error */}
            {!showResultBox && (
              <div className="mb-4 w-full">
                <Scanner
                  qrData={qrData}
                  setQrData={handleQrData}
                  autoStart={autoStartOnMount}
                />
              </div>
            )}

            {/* Result box for verifying, success, or error */}
            {showResultBox && (
              <div
                className={`mt-2 p-4 min-w-[300px] bg-white text-center ${retroStyle}`}
              >
                <Text as="h3" className="text-xl mb-2">
                  Scan Result
                </Text>

                {verifying ? (
                  <p className="text-gray-600">Verifying QR...</p>
                ) : scannedStudent ? (
                  <>
                    <p className="text-2xl font-semibold mb-1">
                      {scannedStudent.name}
                    </p>
                    <div className="my-3 flex flex-col items-center gap-1">
                      {/* Food Preference Badge */}
                      <div className="text-md">
                        {scannedStudent.food === "Veg" ? (
                          <Badge className="bg-green-500 text-black">Veg</Badge>
                        ) : scannedStudent.food === "Non Veg" ? (
                          <Badge className="bg-red-500 text-white">Non&nbsp;Veg</Badge>
                        ) : (
                          <Badge className="bg-gray-500">N/A</Badge>
                        )}
                      </div>

                      <Text as="p" className="mt-3">
                        Roll: {scannedStudent.roll}
                      </Text>
                      <Text as="p" className="text-md">
                        Year: {scannedStudent.year || "N/A"}
                      </Text>
                    </div>
                    {scannedStudent.status && (
                      <Text
                        as="p"
                        className={`mt-2 text-md font-bold ${
                          scannedStudent.alreadyRedeemed
                            ? "text-red-600 text-xl"
                            : "text-green-600"
                        }`}
                      >
                        {scannedStudent.status}
                      </Text>
                    )}
                  </>
                ) : errorMessage ? (
                  <div className="flex flex-col items-center py-4">
                    <Text as="p" className="text-2xl font-bold text-red-600 mb-3">
                      Error!
                    </Text>
                    <Text as="p" className="text-xl text-red-600">
                      {errorMessage}
                    </Text>
                  </div>
                ) : null}

                <div className="mt-4 flex justify-center">
                  <Button
                    className="uppercase bg-blue-400 hover:bg-blue-500"
                    onClick={() => {
                      // trigger auto-start for next scan
                      setAutoStartOnMount(true);
                      // ensure result box hides and scanner mounts
                      setVerifying(false);
                      // clear previous result
                      setQrData(null);
                      setScannedStudent(null);
                      setErrorMessage(null);
                    }}
                  >
                    Scan Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
};

export default ScanQrBody;
