'use client';

import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginPageBody from "@/components/Login/Body";
import { Page } from "@/lib/types";
import Head from "next/head";

export default function Login() {
  const router = useRouter();

  

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
     
      <div className="p-4 md:p-8">
        <Header />
        <main id="main-content">
          <LoginPageBody />
        </main>
        <Footer />
      </div>
    </>
  );
}
