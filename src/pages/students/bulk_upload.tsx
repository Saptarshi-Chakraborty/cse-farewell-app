"use client";

import BulkUploadPageBody from "@/components/BulkUploadData/Body";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/retroui/Sonner";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";

const BulkUploadStudents = () => {
  return (
    <>
      <Head>
        <title>Bulk Upload students data | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />

        <BulkUploadPageBody />

        <Footer />
      </div>

      <Toaster />
    </>
  );
};

export default BulkUploadStudents;
