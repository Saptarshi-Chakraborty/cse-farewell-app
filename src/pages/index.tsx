import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import Head from "next/head";
import FeatureRule from "@/data/Feature.Rules.json";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";

export default function Home() {
  const { user } = useGlobalContext();
  const isAdmin = user?.labels?.includes("admin");

  return (
    <>
      <Head>
        <title>
          {`${FeatureRule.appName} - ${FeatureRule.appShortDescription}`}
        </title>
        <meta name="description" content={FeatureRule.metaTags.description} />
        <meta
          name="keywords"
          content={FeatureRule?.metaTags?.keywords.join(", ") || ""}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`${FeatureRule?.appName} - ${FeatureRule?.appShortDescription}`}
        />
        <meta
          property="og:description"
          content={FeatureRule?.metaTags?.description || ""}
        />
        <meta property="og:image" content={FeatureRule?.metaTags?.urlImage || ""} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${FeatureRule.appName} - ${FeatureRule.appShortDescription}`}
        />
        <meta
          name="twitter:description"
          content={FeatureRule.metaTags.description}
        />
        <meta name="twitter:image" content={FeatureRule.metaTags.urlImage} />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFDB33" />
        <link rel="canonical" href={FeatureRule.metaTags.url} />
      </Head>
      
      <div className="min-h-screen flex flex-col p-4 md:p-8">
        <Header />
        
        <main className="flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 my-12 lg:my-0">
          {/* Text Section */}
          <div className="flex-1 space-y-8 w-full max-w-2xl">
            <div className="inline-block bg-[#ffdb33] text-black px-4 py-2 border-2 border-black shadow-sm font-bold uppercase tracking-wider transform -rotate-2">
              🎉 You are invited!
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              {FeatureRule.appName}
            </h1>
            
            <div className="bg-white border-4 border-black p-5 md:p-8 shadow-md relative">
              <div className="absolute top-0 right-0 w-10 h-10 bg-[#ffdb33] border-l-4 border-b-4 border-black flex items-center justify-center font-bold text-xl -mt-4 -mr-4">
                *
              </div>
              <p className="text-2xl md:text-3xl font-bold uppercase mb-4 leading-tight">
                {FeatureRule.appShortDescription}
              </p>
              <p className="text-lg md:text-xl font-medium text-gray-800">
                {FeatureRule.metaTags.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-xl uppercase tracking-wider h-16 bg-[#ff6b6b] hover:bg-[#ff5252] text-white group flex items-center justify-center gap-2 border-4">
                  Get Started
                  <MoveRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/stats" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-xl uppercase tracking-wider h-16 bg-white border-4">
                    View Stats
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl flex justify-center">
            <div className="relative group w-full">
              <div className="absolute inset-0 bg-[#4ecdc4] translate-x-4 translate-y-4 border-4 border-black transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className="absolute inset-0 bg-[#ffdb33] translate-x-2 translate-y-2 border-4 border-black transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
              <img
                src={FeatureRule?.metaTags?.urlImage}
                alt="App Banner"
                className="relative z-10 w-full h-auto object-cover border-4 border-black transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 bg-white"
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
