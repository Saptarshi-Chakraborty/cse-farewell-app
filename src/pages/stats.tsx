// /pages/stats.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users,
  CircleDollarSign,
  Utensils,
  Beef,
  Activity,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Head from "next/head";
import FeatureRule from "@/data/Feature.Rules.json";
import { databases, DATABASE_ID, STUDENTS_COLLECTION_ID, Query, client } from "@/lib/appwrite";
import { Student } from "@/lib/types";
import { BarChart } from "@/components/retroui/charts/BarChart";
import { PieChart } from "@/components/retroui/charts/PieChart";
import { Button } from "@/components/retroui/Button";
import withAuth from "@/components/auth/AuthHOC";
import { ROLES } from "@/context/GlobalContext";

const retroStyle =
  "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

function StatsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch up to 5000 students to calculate stats accurately
      const response = await databases.listDocuments(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        [Query.limit(5000)]
      );
      setStudents(response.documents as unknown as Student[]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!isRealtime) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    const channels = [
      "rows",
      `databases.${DATABASE_ID}.tables.${STUDENTS_COLLECTION_ID}.rows`,
      `databases.${DATABASE_ID}.collections.${STUDENTS_COLLECTION_ID}.documents`,
    ];

    const isStudentsEvent = (events: string[]) => {
      return events.some(
        (e) =>
          e.includes(
            `databases.${DATABASE_ID}.tables.${STUDENTS_COLLECTION_ID}.rows.`
          ) ||
          e.includes(
            `databases.${DATABASE_ID}.collections.${STUDENTS_COLLECTION_ID}.documents.`
          )
      );
    };

    const unsubscribe = client.subscribe(channels, (response: any) => {
      try {
        const events: string[] = response?.events ?? [];
        const payload = response?.payload as any;
        if (!payload?.$id || !isStudentsEvent(events)) return;

        const isSameDb = !payload?.$databaseId || payload.$databaseId === DATABASE_ID;
        const isSameCollection =
          !payload?.$tableId && !payload?.$collectionId
            ? true
            : payload.$tableId === STUDENTS_COLLECTION_ID ||
              payload.$collectionId === STUDENTS_COLLECTION_ID;
        if (!isSameDb || !isSameCollection) return;

        const isCreate = events.some((e) => e.endsWith(".create"));
        const isUpdate = events.some((e) => e.endsWith(".update"));
        const isDelete = events.some((e) => e.endsWith(".delete"));

        if (isCreate) {
          setStudents((prev) => {
            if (prev.some((s) => s.$id === payload.$id)) return prev;
            return [...prev, payload as unknown as Student];
          });
          return;
        }

        if (isUpdate) {
          setStudents((prev) => {
            const exists = prev.some((s) => s.$id === payload.$id);
            if (!exists) return [...prev, payload as unknown as Student];
            return prev.map((s) =>
              s.$id === payload.$id ? (payload as unknown as Student) : s
            );
          });
          return;
        }

        if (isDelete) {
          setStudents((prev) => prev.filter((s) => s.$id !== payload.$id));
          return;
        }
      } catch {
        // ignore malformed messages
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isRealtime]);

  const totalStudents = students.length;
  const paidStudents = students.filter(
    (s) => s.payment_method && s.payment_method !== "null"
  ).length;
  const vegCount = students.filter((s) => s.food_preference === "veg").length;
  const nonVegCount = students.filter((s) => s.food_preference === "non-veg").length;
  
  const onlineCount = students.filter((s) => s.payment_method === "online").length;
  const offlineCount = students.filter((s) => s.payment_method === "offline").length;
  const totalPaidCount = onlineCount + offlineCount;
  
  const onlinePercent = totalPaidCount ? Math.round((onlineCount / totalPaidCount) * 100) : 0;
  const offlinePercent = totalPaidCount ? Math.round((offlineCount / totalPaidCount) * 100) : 0;

  // Year-wise stats
  const year1Count = students.filter((s) => String(s.year).trim() === "1").length;
  const year2Count = students.filter((s) => String(s.year).trim() === "2").length;
  const year3Count = students.filter((s) => String(s.year).trim() === "3").length;
  const year4Count = students.filter((s) => String(s.year).trim() === "4").length;
  
  const yearData = [
    { year: "1st Year", students: year1Count },
    { year: "2nd Year", students: year2Count },
    { year: "3rd Year", students: year3Count },
    { year: "4th Year", students: year4Count },
  ];

  const paymentData = [
    { name: "Online", value: onlineCount },
    { name: "Offline", value: offlineCount }
  ];

  return (
    <>
      <Head>
        <title>Statistics | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />

        <main id="main-content">
          <section className="space-y-8 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-2 gap-4">
              <h2 className="text-3xl">Dashboard Statistics</h2>
              <div className="flex gap-2">
                 <Button
                  onClick={() => setIsRealtime(!isRealtime)}
                  variant={isRealtime ? "default" : "outline"}
                  className={`border-2 border-black ${isRealtime ? "bg-green-400 hover:bg-green-500" : "bg-gray-100"}`}
                >
                  <Activity className="h-5 w-5 mr-2" />
                  {isRealtime ? "Realtime On" : "Realtime Off"}
                </Button>
                <Button 
                  onClick={fetchStudents} 
                  disabled={loading}
                  className="bg-blue-400 hover:bg-blue-500 border-2 border-black"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Total Students</CardTitle>
                  <Users className="h-6 w-6 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalStudents}</div>
                  <p className="text-sm text-gray-600">Registered for the event</p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Paid Students</CardTitle>
                  <CircleDollarSign className="h-6 w-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{paidStudents}</div>
                  <p className="text-sm text-green-600">
                    {totalStudents ? Math.round((paidStudents / totalStudents) * 100) : 0}% paid
                  </p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Veg Food Pref.</CardTitle>
                  <Utensils className="h-6 w-6 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{vegCount}</div>
                  <p className="text-sm text-gray-600">
                    {totalStudents ? Math.round((vegCount / totalStudents) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Non-Veg Food Pref.</CardTitle>
                  <Beef className="h-6 w-6 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{nonVegCount}</div>
                  <p className="text-sm text-gray-600">
                    {totalStudents ? Math.round((nonVegCount / totalStudents) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={retroStyle}>
                <CardHeader>
                  <CardTitle className="text-2xl">Payment Mode Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                    <div className="w-full flex-1 space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-base">
                          <span>Online Payments</span>
                          <span>{onlineCount} students</span>
                        </div>
                        <Progress value={onlinePercent} className="h-6 border-2 border-black [&>div]:bg-green-400" />
                        <div className="text-right font-bold">{onlinePercent}%</div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-base">
                          <span>Offline Payments</span>
                          <span>{offlineCount} students</span>
                        </div>
                        <Progress value={offlinePercent} className="h-6 border-2 border-black [&>div]:bg-blue-400" />
                        <div className="text-right font-bold">{offlinePercent}%</div>
                      </div>
                    </div>
                    {totalPaidCount > 0 && (
                      <div className="w-48 h-48 flex-shrink-0">
                         <PieChart 
                           data={paymentData} 
                           dataKey="value" 
                           nameKey="name" 
                           colors={["#4ade80", "#60a5fa"]} 
                         />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className={retroStyle}>
                <CardHeader>
                  <CardTitle className="text-2xl">Year-wise Registration</CardTitle>
                </CardHeader>
                <CardContent>
                   <BarChart 
                     data={yearData} 
                     index="year" 
                     categories={["students"]} 
                     fillColors={["#a78bfa"]} 
                     strokeColors={["#000000"]}
                   />
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default withAuth(StatsPage, { role: ROLES.ADMIN });
