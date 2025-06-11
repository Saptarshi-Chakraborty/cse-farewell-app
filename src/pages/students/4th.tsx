"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StudentsPageBody from "@/components/Students/Body";
import StudentDialog from "@/components/Students/StudentDialog";
import { Student } from "@/lib/types";
import Head from "next/head";
import { useState } from "react";

const FourthYearStudents = () => {

  return (
    <>
      <Head>
        <title>4th year students</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <StudentsPageBody
          year="4"
        />
        <Footer />
      </div>

     
    </>
  );
};

export default FourthYearStudents;
