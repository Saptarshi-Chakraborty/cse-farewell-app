"use client";

import BulkUploadPageBody from "@/components/BulkUploadData/Body";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Head from "next/head";

const BulkUploadStudents = () => {
  return (
    <>
      <Head>
        <title>Bulk Upload students data</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />

        <BulkUploadPageBody />

        <Footer />
      </div>
    </>
  );
};

export default BulkUploadStudents;
