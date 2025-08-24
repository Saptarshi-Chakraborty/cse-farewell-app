"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StudentsPageBody from "@/components/Students/Body";
import Head from "next/head";
import FeatureRule from "@/data/Feature.Rules.json";
import { Toaster } from "@/components/retroui/Sonner";

const FirstYearStudents = () => {

  return (
    <>
      <Head>
        <title>1st year students | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody
          year="1"
        />
        <Footer />
      </div>

      <Toaster />
    </>
  );
};

export default FirstYearStudents;
