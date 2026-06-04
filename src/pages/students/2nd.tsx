"use client";

import withAuth from "@/components/auth/AuthHOC";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/retroui/Sonner";
import StudentsPageBody from "@/components/Students/Body";
import { ROLES } from "@/context/GlobalContext";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";

const SecondYearStudents = () => {
  return (
    <>
      <Head>
        <title>2nd year students | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody year="2" />
        <Footer />
        <Toaster />
      </div>
    </>
  );
};

export default withAuth(SecondYearStudents, { role: ROLES.ADMIN });
