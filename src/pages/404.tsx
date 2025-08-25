import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import FeatureRule from "@/data/Feature.Rules.json";
import { Home, AlertTriangle } from "lucide-react";
import Head from "next/head";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | {FeatureRule?.appName}</title>
      </Head>
      <div className="p-4 md:p-8 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="p-8 md:p-12 text-center space-y-6 bg-white max-w-lg w-full">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <Text as="h1" className="text-4xl md:text-5xl">
              404 - Page Not Found
            </Text>
            <Text as="p" className="text-lg">
              Oops! The page you are looking for does not exist. It might have
              been moved or deleted.
            </Text>
            <div className="flex justify-center">
              <Link href="/" passHref>
                <Button className="uppercase bg-blue-400 hover:bg-blue-500">
                  <Home className="mr-2 h-5 w-5" />
                  Go Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}
