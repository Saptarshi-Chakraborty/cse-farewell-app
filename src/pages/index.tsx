import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>SEMICOLON '25 - CSE Department Farewell</title>
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <div className="flex justify-center my-4 mb-1">
          <img src="/poster.jpg" alt="Semicolon '25 Poster" className="max-h-[90vh]" />
        </div>

        <Footer />
      </div>
    </>
  );
}
