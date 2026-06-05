// /pages/profile.tsx

import withAuth from "@/components/auth/AuthHOC";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { Text } from "@/components/retroui/Text";
import { useGlobalContext, ROLES } from "@/context/GlobalContext";
import FeatureRule from "@/data/Feature.Rules.json";
import {
  DATABASE_ID,
  databases,
  deleteSession,
  FOOD_COUPON_COLLECTION_ID,
  Query,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Student } from "@/lib/types";
import {
  CircleDollarSign,
  Loader2,
  LogOut,
  Mail,
  QrCode,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  User,
  UserX,
  Utensils,
  Wrench,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type StudentRecord = Student & {
  coupon_generated?: boolean | null;
  coupon_redeemed?: boolean | null;
};

const ProfilePage = () => {
  const { user, checkAuth } = useGlobalContext();
  const router = useRouter();

  const [studentData, setStudentData] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // QR Coupon dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Derive user roles
  const userLabels = user?.labels || [];
  const isAdmin = userLabels.includes(ROLES.ADMIN);
  const isOrganizer = userLabels.includes(ROLES.ORGANIZER);
  const hasSpecialAccess = isAdmin || isOrganizer;

  // Fetch student record matching the logged-in user's email
  const fetchStudentData = useCallback(async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(false);

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        [Query.equal("email", user.email)]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0] as any;
        setStudentData({
          $id: doc.$id,
          name: doc.name,
          email: doc.email,
          year: doc.year,
          roll: doc.roll,
          food_preference: doc.food_preference,
          payment_method: doc.payment_method,
          coupon_generated: Boolean(doc.coupon_generated),
          coupon_redeemed: Boolean(doc.coupon_redeemed),
        });
      } else {
        setStudentData(null);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setFetchError(true);
      setStudentData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleLogout = async () => {
    await deleteSession();
    await checkAuth();
    router.push("/");
  };

  // Fetch coupon and generate QR code image
  const handleViewQrCoupon = async () => {
    if (!studentData?.$id) return;

    setQrDialogOpen(true);
    setQrLoading(true);
    setQrImageUrl(null);

    try {
      const couponResponse = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COUPON_COLLECTION_ID,
        [Query.equal("user_id", studentData.$id)]
      );

      if (couponResponse.documents.length === 0) {
        setQrImageUrl(null);
        return;
      }

      const coupon = couponResponse.documents[0];
      const couponCode = coupon.random_code;
      const couponText = `${coupon.$id}-${coupon.user_id}-${couponCode}`;

      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(String(couponText), {
        type: "image/png",
        errorCorrectionLevel: "Q",
        width: 280,
        scale: 6,
      });

      setQrImageUrl(url);
    } catch (error) {
      console.error("Error generating QR coupon:", error);
      setQrImageUrl(null);
    } finally {
      setQrLoading(false);
    }
  };

  if (!user) {
    return null; // AuthHOC handles loading and redirection
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <>
        <Head>
          <title>{`Profile | ${FeatureRule?.appName}`}</title>
        </Head>
        <div className="p-4 md:p-8">
          <Header />
          <main className="max-w-4xl mx-auto py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Card className="p-8 flex flex-col items-center space-y-4 bg-white">
                <svg
                  className="animate-spin h-10 w-10 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <Text as="p" className="text-lg">
                  Loading your profile...
                </Text>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // --- Scenario 1: No student data AND no special access ---
  if (!studentData && !hasSpecialAccess) {
    return (
      <>
        <Head>
          <title>{`Profile | ${FeatureRule?.appName}`}</title>
        </Head>
        <div className="p-4 md:p-8 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="p-6 md:p-10 max-w-lg w-full bg-red-50 text-center space-y-5">
              <div className="flex justify-center">
                <div className="p-4 bg-red-100 border-2 border-black inline-block">
                  <UserX className="h-12 w-12 text-red-600" />
                </div>
              </div>

              <Text as="h2" className="text-2xl md:text-3xl">
                No Records Found
              </Text>

              <Text as="p" className="text-gray-700 text-base md:text-lg">
                We couldn&apos;t find any registration data linked to your
                account. If you believe this is a mistake, please reach out to
                your Class Representative for assistance.
              </Text>

              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white border-2 border-black">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-base font-mono break-all">
                  {user.email}
                </span>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="uppercase bg-red-100 hover:bg-red-200 w-full justify-center"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // --- Render helpers ---
  const roleBannerContent = () => {
    if (!hasSpecialAccess) return null;

    const roleLabel = isAdmin ? "Administrator" : "Organizer";
    const bgColor = isAdmin ? "bg-amber-50" : "bg-sky-50";
    const borderColor = isAdmin ? "border-amber-400" : "border-sky-400";
    const accentColor = isAdmin ? "text-amber-700" : "text-sky-700";
    const iconBg = isAdmin ? "bg-amber-100" : "bg-sky-100";
    const Icon = isAdmin ? ShieldCheck : Wrench;

    return (
      <div
        className={`${bgColor} border-2 ${borderColor} border-l-4 p-4 md:p-5 flex items-center gap-4 shadow-[3px_3px_0px_#2A2A2A]`}
      >
        <div className={`p-2.5 ${iconBg} border-2 border-black`}>
          <Icon className={`h-6 w-6 ${accentColor}`} />
        </div>
        <div>
          <Text as="h4" className={`font-bold ${accentColor}`}>
            {isAdmin ? "✨" : "🛠️"} {roleLabel} Access
          </Text>
          <Text as="p" className="text-gray-600 text-sm mt-0.5">
            You have {roleLabel.toLowerCase()}-level privileges on this portal.
          </Text>
        </div>
      </div>
    );
  };

  // --- Scenario 3b: Admin/Organizer WITHOUT student data ---
  if (!studentData && hasSpecialAccess) {
    return (
      <>
        <Head>
          <title>{`Profile | ${FeatureRule?.appName}`}</title>
        </Head>
        <div className="p-4 md:p-8 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 max-w-4xl mx-auto w-full py-8 space-y-6">
            <Text as="h2" className="border-b-2 border-black pb-2">
              Your Profile
            </Text>

            {/* Role banner */}
            {roleBannerContent()}

            {/* No student data notice */}
            <Card className="p-6 md:p-8 bg-gray-50 text-center space-y-4 w-full block">
              <div className="flex justify-center">
                <div className="p-3 bg-gray-100 border-2 border-black inline-block">
                  <ShieldAlert className="h-10 w-10 text-gray-500" />
                </div>
              </div>
              <Text as="h3" className="text-xl">
                No Student Record Found
              </Text>
              <Text as="p" className="text-gray-600">
                There is no student registration linked to your email (
                <span className="font-mono font-medium">{user.email}</span>).
                Your account only has {isAdmin ? "administrator" : "organizer"}{" "}
                access.
              </Text>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  className="uppercase bg-red-100 hover:bg-red-200 justify-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // --- Scenario 2 & 3: Student data exists (with or without special access) ---
  const paymentLabel =
    studentData!.payment_method === "online"
      ? "Online"
      : studentData!.payment_method === "offline"
      ? "Offline"
      : "Not Paid";

  const couponLabel = studentData!.coupon_redeemed
    ? "Redeemed"
    : studentData!.coupon_generated
    ? "Generated"
    : "Not Generated";

  const couponColor = studentData!.coupon_redeemed
    ? "text-purple-600"
    : studentData!.coupon_generated
    ? "text-green-600"
    : "text-gray-500";

  const foodLabel =
    studentData!.food_preference === "non-veg" ? "Non-Veg" : "Veg";

  return (
    <>
      <Head>
        <title>{`Profile | ${FeatureRule?.appName}`}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />

        <main className="max-w-4xl mx-auto space-y-8 py-4">
          <Text as="h2" className="border-b-2 border-black pb-2">
            Your Profile
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="w-full block">
              <Card.Header>
                <Card.Title className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Personal Information
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600 shrink-0" />
                  <span className="text-lg">{studentData!.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-gray-600 shrink-0" />
                  <span className="text-lg">
                    Roll: {studentData!.roll || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-600 shrink-0" />
                  <span className="text-lg break-all">
                    {studentData!.email || "—"}
                  </span>
                </div>
              </Card.Content>
            </Card>

            {/* Event Details */}
            <Card className="w-full block">
              <Card.Header>
                <Card.Title className="text-2xl flex items-center gap-2">
                  <Utensils className="h-6 w-6" />
                  Event Details
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-500 shrink-0" />
                  <span className="text-lg">
                    Food Preference: {foodLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-lg">
                    Payment: {paymentLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className={`h-5 w-5 ${couponColor} shrink-0`} />
                  <span className="text-lg">
                    Coupon: {couponLabel}
                  </span>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* View QR Coupon button — only if coupon was generated */}
          {studentData!.coupon_generated && (
            <div className="flex justify-center">
              <Button
                className="uppercase bg-yellow-400 hover:bg-yellow-500"
                size="lg"
                onClick={handleViewQrCoupon}
              >
                <QrCode className="mr-2 h-5 w-5" />
                View QR Coupon
              </Button>
            </div>
          )}

          {/* QR Coupon Dialog */}
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogContent size="sm" className="bg-[#FDF6E3]">
              <DialogHeader className="bg-yellow-400">
                <h2 className="text-xl font-bold">Your Food Coupon</h2>
              </DialogHeader>
              <div className="p-6 flex flex-col items-center space-y-4">
                {qrLoading ? (
                  <div className="flex flex-col items-center space-y-3 py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                    <Text as="p" className="text-gray-600">
                      Generating your QR code...
                    </Text>
                  </div>
                ) : qrImageUrl ? (
                  <>
                    <div className="border-2 border-black p-2 bg-white shadow-[4px_4px_0px_#2A2A2A]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrImageUrl}
                        alt="Food Coupon QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                    <Text as="p" className="text-gray-600 text-sm text-center">
                      Present this QR code at the event to redeem your food coupon.
                    </Text>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <ShieldAlert className="h-10 w-10 text-gray-400 mx-auto" />
                    <Text as="p" className="text-gray-600">
                      Could not load your coupon. Please try again later.
                    </Text>
                  </div>
                )}
              </div>
              <DialogFooter className="bg-[#FDF6E3]">
                <Button
                  variant="outline"
                  className="uppercase"
                  onClick={() => setQrDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Role banner for admin/organizer who also have student data */}
          {hasSpecialAccess && roleBannerContent()}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default withAuth(ProfilePage);
