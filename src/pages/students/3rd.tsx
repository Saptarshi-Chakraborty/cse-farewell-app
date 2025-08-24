"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/retroui/Sonner";
import StudentsPageBody from "@/components/Students/Body";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";

const ThirdYearStudents = () => {
  return (
    <>
      <Head>
        <title>3rd year students | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody year="3" />
        <Footer />
        <Toaster />
      </div>
    </>
  );
};

export default ThirdYearStudents;
