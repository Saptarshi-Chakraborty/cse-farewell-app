import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import Head from "next/head";
import FeatureRule from "@/data/Feature.Rules.json";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          {FeatureRule.appName} - {FeatureRule.appShortDescription}
        </title>
        <meta name="description" content={FeatureRule.metaTags.description} />
        <meta
          name="keywords"
          content="semicolon, farewell, cse, fiem, future institute"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`${FeatureRule.appName} - ${FeatureRule.appShortDescription}`}
        />
        <meta
          property="og:description"
          content={FeatureRule.metaTags.description}
        />
        <meta property="og:image" content={FeatureRule.metaTags.urlImage} />

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
