// /app/stats/page.tsx
'use client';

import {
  Users,
  CircleDollarSign,
  Utensils,
  Beef,
  Milestone,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

type Page = 'stats' | 'students' | 'scan';

const retroStyle = "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

export default function StatsPage() {
  const router = useRouter();

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
        <Header activePage="stats" onPageChange={handlePageChange} />

        <main id="main-content">
          <section className="space-y-8">
            <h2 className="text-3xl border-b-2 border-black pb-2">Dashboard Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Total Students</CardTitle>
                  <Users className="h-6 w-6 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">150</div>
                  <p className="text-sm text-gray-600">Registered for the event</p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Paid Students</CardTitle>
                  <CircleDollarSign className="h-6 w-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">125</div>
                  <p className="text-sm text-green-600">83.3% paid</p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Veg Food Pref.</CardTitle>
                  <Utensils className="h-6 w-6 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">60</div>
                  <p className="text-sm text-gray-600">40% of total</p>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Non-Veg Food Pref.</CardTitle>
                  <Beef className="h-6 w-6 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">90</div>
                  <p className="text-sm text-gray-600">60% of total</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={retroStyle}>
                <CardHeader>
                  <CardTitle className="text-2xl">Payment Mode Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-base">
                      <span>Online Payments</span>
                      <span>95 students</span>
                    </div>
                    <Progress value={76} className="h-6 border-2 border-black" />
                    <div className="text-right font-bold">76%</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-base">
                      <span>Offline Payments</span>
                      <span>30 students</span>
                    </div>
                    <Progress value={24} className="h-6 border-2 border-black" />
                    <div className="text-right font-bold">24%</div>
                  </div>
                </CardContent>
              </Card>
              <Card className={retroStyle}>
                <CardHeader>
                  <CardTitle className="text-2xl">Certificates Issued (4th Year)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Milestone className="h-16 w-16 text-yellow-500" />
                    <div>
                      <p className="text-4xl font-bold">35 <span className="text-lg">/ 40</span></p>
                      <p className="text-sm text-gray-600">Digital certificates sent</p>
                    </div>
                  </div>
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