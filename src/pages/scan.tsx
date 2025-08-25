// /app/scan/page.tsx
"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScanQrBody from "@/components/ScanQr/Body";
import Head from "next/head";
import FeatureRule from "@/data/Feature.Rules.json";
import { Toaster } from "@/components/retroui/Sonner";

export default function ScanQrPage() {
  return (
    <>
      <Head>
        <title>Scan QR Code | {FeatureRule?.appName}</title>
      </Head>

      <div className="p-4 md:p-8">
        <Header />
        <ScanQrBody />
        <Footer />
      </div>

      <Toaster />
    </>
  );
}
