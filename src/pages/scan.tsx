// /app/scan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ScanQrCode as QrCodeScanner } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

type Page = 'stats' | 'students' | 'scan';

const retroStyle = "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

export default function ScanQrPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<{ name: string; food: string; status: string } | null>(null);

    const handlePageChange = (page: Page) => {
        switch (page) {
            case 'stats':
                router.push('/stats');
                break;
            case 'students':
                router.push('/students');
                break;
            case 'scan':
                router.push('/scan');
                break;
        }
    };

    // Effect to simulate QR scan when the page loads
    useEffect(() => {
        setScanResult(null); // Reset on page load
        const timer = setTimeout(() => {
            setScanResult({
                name: "Student: Rohan Das",
                food: "Food: Veg",
                status: "Status: Valid Coupon"
            });
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        body {
            font-family: 'VT323', monospace;
            background-color: #FDF6E3;
            color: #2A2A2A;
        }
      `}</style>
            <div className="p-4 md:p-8">
                <Header activePage="scan" onPageChange={handlePageChange} />

                <main id="main-content">
                    <section className="text-center space-y-8">
                        <h2 className="text-3xl">Scan Food Coupon QR Code</h2>
                        <div className="flex flex-col items-center">
                            <div className={`w-64 h-64 md:w-80 md:h-80 bg-gray-800 flex items-center justify-center mb-6 ${retroStyle}`}>
                                <QrCodeScanner className="h-36 w-36 text-gray-500" />
                            </div>
                            <p className="text-lg">Point the camera at the student's QR code.</p>

                            {scanResult ? (
                                <div className={`mt-4 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                                    <h3 className="text-xl mb-2">Scan Result:</h3>
                                    <p className="text-lg">{scanResult.name}</p>
                                    <p className="text-md">{scanResult.food}</p>
                                    <p className="text-md font-bold text-green-600">{scanResult.status}</p>
                                </div>
                            ) : (
                                <div className={`mt-4 p-4 min-w-[300px] bg-white ${retroStyle}`}>
                                    <h3 className="text-xl mb-2">Scanning...</h3>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}