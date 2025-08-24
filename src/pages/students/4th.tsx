"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StudentsPageBody from "@/components/Students/Body";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";
import { Toaster } from "sonner";

const FourthYearStudents = () => {
  return (
    <>
      <Head>
        <title>4th year students | {FeatureRule?.appName}</title>
      </Head>

      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody year="4" />
        <Footer />
        <Toaster />
      </div>
    </>
  );
};

export default FourthYearStudents;
