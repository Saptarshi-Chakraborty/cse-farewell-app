import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>SEMICOLON '25 - CSE Department Farewell</title>
        <meta
          name="description"
          content="Join us for SEMICOLON '25 - The CSE Department Farewell celebration at Future Institute of Engineering and Management."
        />
        <meta
          name="keywords"
          content="semicolon, farewell, cse, fiem, future institute"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="SEMICOLON '25 - CSE Department Farewell"
        />
        <meta
          property="og:description"
          content="Join us for SEMICOLON '25 - The CSE Department Farewell celebration at Future Institute of Engineering and Management."
        />
        <meta property="og:image" content="/poster.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SEMICOLON '25 - CSE Department Farewell"
        />
        <meta
          name="twitter:description"
          content="Join us for SEMICOLON '25 - The CSE Department Farewell celebration at Future Institute of Engineering and Management."
        />
        <meta name="twitter:image" content="/poster.jpg" />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFDB33" />
        <link rel="canonical" href="https://cse-farewell-2025.vercel.app" />
      </Head>
      <div className="p-4 md:p-8">
        <Header />
        <div className="flex justify-center my-4 mb-1">
          <img
            src="/poster.jpg"
            alt="Semicolon '25 Poster"
            className="max-h-[90vh]"
          />
        </div>

        <Footer />
      </div>
    </>
  );
}
