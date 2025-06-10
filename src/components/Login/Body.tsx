import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Key } from "lucide-react";
import { account, ID } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalContext";

const retroStyle =
  "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

const LoginPageBody = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const userIdRef = React.useRef<string | null>(null);
  const { setUser } = useGlobalContext();

  const handleEmailSubmit = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const sessionToken = await account.createEmailToken(ID.unique(), email);
      setStep("otp");
      const userId = sessionToken.userId;
      userIdRef.current = userId;

      console.log("OTP sent to:", email, "User ID:", userId);
      alert(`OTP sent to ${email}. Please check your inbox.`);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const userId = userIdRef.current;
      if (!userId) {
        throw new Error("User ID is missing. Please restart the login process.");
      }

      const session = await account.createSession(userId, otp);
      const currentUser = await account.get();
      setUser(currentUser);
      console.log("Session created:", session);
      alert("OTP Verified! You are now logged in.");
      // Optionally, update global context or redirect user after login
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className={`p-6 w-full max-w-md bg-white ${retroStyle}`}>
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        {loading ? (
          <div className="text-center">Loading...</div> // Loading indicator
        ) : step === "email" ? (
          <>
            <div className="flex items-center mb-4">
              <Mail className="mr-2 text-gray-500" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={retroStyle}
              />
            </div>
            <Button
              onClick={handleEmailSubmit}
              className={`w-full ${retroStyle}`}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <Key className="mr-2 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={retroStyle}
              />
            </div>
            <Button
              onClick={handleOtpSubmit}
              className={`w-full ${retroStyle}`}
            >
              Verify OTP
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPageBody;
