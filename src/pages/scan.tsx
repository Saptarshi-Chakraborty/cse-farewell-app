// /app/scan/page.tsx
"use client";

import withAuth from "@/components/auth/AuthHOC";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/retroui/Sonner";
import { Text } from "@/components/retroui/Text";
import ScanQrBody from "@/components/ScanQr/Body";
import { ROLES } from "@/context/GlobalContext";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";

function ScanQrPage() {
  return (
    <>
      <Head>
        <title>{`Scan QR Code | ${FeatureRule?.appName}`}</title>
      </Head>

      <div className="p-4 md:p-8">
        <Header />

        {FeatureRule?.enableQrScan ? <ScanQrBody /> : 
          <Text as="p">No QR Code Scanning Available</Text>
        }

        <Footer />
      </div>

      <Toaster />
    </>
  );
}

export default withAuth(ScanQrPage, { role: ROLES.ADMIN });
