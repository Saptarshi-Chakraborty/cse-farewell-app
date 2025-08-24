// /app/scan/page.tsx
// "use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScanQrBody from "@/components/ScanQr/Body";

export default function ScanQrPage() {
  return (
    <>
      <div className="p-4 md:p-8">
        <Header />
        <ScanQrBody />
        <Footer />
      </div>
    </>
  );
}
    