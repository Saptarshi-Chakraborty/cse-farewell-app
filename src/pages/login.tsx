'use client';

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginPageBody from "@/components/Login/Body";
import { Toaster } from "@/components/retroui/Sonner";
import FeatureRule from "@/data/Feature.Rules.json";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Login | {FeatureRule?.appName}</title>
      </Head>
     
      <div className="p-4 md:p-8">
        <Header />
        <main id="main-content">
          <LoginPageBody />
        </main>
        <Footer />
      </div>

      <Toaster />
    </>
  );
}
