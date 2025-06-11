"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StudentsPageBody from "@/components/Students/Body";
import Head from "next/head";

const SecondYearStudents = () => {
  return (
    <>
      <Head>
        <title>2nd year students</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody year="2" />
        <Footer />
      </div>
    </>
  );
};

export default SecondYearStudents;
