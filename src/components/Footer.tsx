"use client";

import { Text } from "./retroui/Text";
import FeatureRule from "@/data/Feature.Rules.json";

export default function Footer() {
  let appName = String(FeatureRule.appName) || "";
  let appShortDescription = String(FeatureRule.appShortDescription) || "";
  let currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 text-center text-sm text-gray-600 pt-4 border-t-2 border-black">
      <Text as="p">© {currentYear} | {appName.toUpperCase()} - {appShortDescription}</Text>
    </footer>
  );
}