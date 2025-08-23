"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { ScanLine, Users, FileUp, LineChart } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const navigationCards = [
    {
      title: "1st Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/1st",
      bgColor: "bg-blue-200",
    },
    {
      title: "2nd Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/2nd",
      bgColor: "bg-green-200",
    },
    {
      title: "3rd Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/3rd",
      bgColor: "bg-yellow-200",
    },
    {
      title: "4th Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/4th",
      bgColor: "bg-red-200",
    },
    // {
    //   title: "Statistics",
    //   icon: <LineChart className="h-8 w-8" />,
    //   path: "/stats",
    //   bgColor: "bg-purple-200",
    // },
    {
      title: "Bulk Upload",
      icon: <FileUp className="h-8 w-8" />,
      path: "/students/bulk_upload",
      bgColor: "bg-purple-200",
    },
    {
      title: "Scan QR",
      icon: <ScanLine className="h-8 w-8" />,
      path: "/scan",
      bgColor: "bg-orange-200",
    },
  ];

  return (
    <>
      <div className="p-4 md:p-8">
        <Header />
        <main className="py-8">
          <Text as="h1" className="mb-8 text-center">
            CSE Farewell Dashboard
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {navigationCards.map((card) => (
              <Link href={card.path} key={card.path}>
                <Card className={`${card.bgColor} p-6 w-full`}>
                  <div className="flex flex-col items-center space-y-4">
                    {card.icon}
                    <h2 className="text-2xl font-bold text-center">
                      {card.title}
                    </h2>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
