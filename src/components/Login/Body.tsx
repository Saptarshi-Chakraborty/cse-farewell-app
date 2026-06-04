"use client";

import React, { useState } from "react";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { Mail, Key } from "lucide-react";
import { account, ID } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/router";
import { Text } from "../retroui/Text";
import { toast } from "sonner";

const LoginPageBody = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const userIdRef = React.useRef<string | null>(null);
  const { setUser } = useGlobalContext();

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.warning("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const sessionToken = await account.createEmailToken(ID.unique(), email);
      setStep("otp");
      const userId = sessionToken.userId;
      userIdRef.current = userId;

      console.log("OTP sent to:", email, "User ID:", userId);
      toast.success(`OTP sent to ${email}. Please check your inbox.`);

    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      toast.warning("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const userId = userIdRef.current;
      if (!userId) {
        throw new Error(
          "User ID is missing. Please restart the login process."
        );
      }

      const session = await account.createSession(userId, otp);
      const currentUser = await account.get();
      setUser(currentUser);

      // Check for admin label
      const userLabels = currentUser.labels || [];
      if (userLabels.includes("admin")) {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }

      console.log("Session created:", session);
      toast.success("OTP Verified! You are now logged in.");
      // Optionally, update global context or redirect user after login
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="text-center space-y-8">
      <Text as="h2" >Login to CSE Farewell Portal</Text>
      <div className="flex justify-center">
        <Card className={`w-full max-w-md`}>
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === "email" ? "Enter Email" : "Enter OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-xl">Loading...</div>
            ) : step === "email" ? (
              <>
                <div className="flex items-center space-y-4">
                  <div className="w-full space-y-2">
                    <div className="flex items-center">
                      <Mail className="mr-2 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleEmailSubmit}
                      className="block w-full uppercase text-center"
                    >
                      Send OTP
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-y-4">
                  <div className="w-full space-y-2">
                    <div className="flex items-center">
                      <Key className="mr-2 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleOtpSubmit}
                      className={`w-full  uppercase bg-yellow-400 hover:bg-yellow-500`}
                    >
                      Verify OTP
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LoginPageBody;
