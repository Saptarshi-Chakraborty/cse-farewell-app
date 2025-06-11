
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  CircleDollarSign,
  Mail,
  QrCode,
  ScrollText,
  User,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const retroStyle =
  "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null; // Prevent flash of content while redirecting
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <Header />

        <main className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl border-b-2 border-black pb-2">
            Student Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={retroStyle}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-xl">{user?.name || "--"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-gray-600" />
                  <span className="text-xl">Roll: CSE/19/123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-xl">{user?.email || "--"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className={retroStyle}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Utensils className="h-6 w-6" />
                  Food & Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  <span className="text-xl">Food Preference: Veg</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-xl">Payment Status: Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-500" />
                  <span className="text-xl">Coupon Status: Generated</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`}
            >
              <QrCode className="mr-2 h-5 w-5" />
              View QR Coupon
            </Button>
            <Button variant="outline" className={`${retroStyle} uppercase`}>
              <User className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
