"use client";

import withAuth from "@/components/auth/AuthHOC";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { ROLES } from "@/context/GlobalContext";
import FeatureRule from "@/data/Feature.Rules.json";
import ROUTES from "@/data/Routes";
import Head from "next/head";
import Link from "next/link";

function Dashboard() {
  const navigationCards = ROUTES.filter((r) => r.showInDashboard);

  return (
    <>
      <Head>
        <title>{`Dashboard | ${FeatureRule?.appName}`}</title>
      </Head>

      <div className="p-4 md:p-8">
        <Header />
        <main className="py-8">
          <Text as="h1" className="mb-8 text-center">
            CSE Farewell Dashboard
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {navigationCards.map((card) => (
              <Link href={card.path} key={card.path}>
                <Card className={`${card.bgColor} p-6 md:py-10 w-full`}>
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

export default withAuth(Dashboard, { role: ROLES.ADMIN });
