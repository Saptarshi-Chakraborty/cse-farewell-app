"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StudentsPageBody from "@/components/Students/Body";
import Head from "next/head";

const ThirdYearStudents = () => {

  return (
    <>
      <Head>
        <title>3rd year students</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody
          year="3"
        />
        <Footer />
      </div>

    </>
  );
};

export default ThirdYearStudents;
