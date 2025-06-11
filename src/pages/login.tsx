'use client';

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginPageBody from "@/components/Login/Body";
import { Page } from "@/lib/types";
import Head from "next/head";

export default function Login() {
  const router = useRouter();

  const handlePageChange = (page: Page) => {
    switch (page) {
      case "stats":
        router.push("/stats");
        break;
      case "students":
        router.push("/students");
        break;
      case "scan":
        router.push("/scan");
        break;
      case "login":
        router.push("/login");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        body {
            font-family: 'VT323', monospace;
            background-color: #FDF6E3;
            color: #2A2A2A;
        }
      `}</style>
      <div className="p-4 md:p-8">
        <Header activePage="login" onPageChange={handlePageChange} />
        <main id="main-content">
          <LoginPageBody />
        </main>
        <Footer />
      </div>
    </>
  );
}
