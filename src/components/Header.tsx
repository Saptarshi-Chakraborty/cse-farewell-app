// /components/Header.tsx
"use client";

import { Button } from "@/components/retroui/Button";
import { Select } from "@/components/retroui/Select";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { LogOut, Menu, LogIn } from "lucide-react";
import { deleteSession } from "@/lib/appwrite";
import { Page } from "@/lib/types";
import { useRouter } from "next/router"; // Correct: Use router from 'next/router'
import Link from "next/link";
import { Text } from "./retroui/Text";
import FeatureRule from "@/data/Feature.Rules.json";

export default function Header() {
  const { checkAuth, user } = useGlobalContext();
  const router = useRouter();
  const { pathname } = router; // Correct: Get pathname from the router instance
  const [activePage, setActivePage] = useState<Page>("stats");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: Page) => {
    setActivePage(page);
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await deleteSession();
    await checkAuth(); // Re-check auth after logout to update state
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleStudentYearSelect = (year: string) => {
    handlePageChange(`students/${year}` as Page);
  };

  const isAdmin = user?.labels?.includes('admin');

  return (
    <header className="relative">
      <div className="flex justify-between items-center mb-0 md:mb-4 pb-4 border-b-4 border-black">
        <Link href="/">
          <Text as="h1" className="text-3xl md:text-4xl ">{FeatureRule?.appName?.toUpperCase()}</Text>
        </Link>

        {user ? (
          <>
            <div className="hidden md:flex items-center space-x-4">
              {/* Desktop Navigation for Admins */}
              {isAdmin && (
                <nav className="flex space-x-2">
                  <Button
                    variant={activePage === "dashboard" ? "default" : "outline"}
                    size="sm"
                    className="uppercase"
                    onClick={() => handlePageChange("dashboard" as Page)}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={activePage === "stats" ? "default" : "outline"}
                    size="sm"
                    className="uppercase"
                    onClick={() => handlePageChange("stats" as Page)}
                  >
                    Stats
                  </Button>
                  <Select onValueChange={handleStudentYearSelect}>
                    <Select.Trigger className="uppercase">
                      <Select.Value placeholder="Students" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        <Select.Item value="1st">First Year</Select.Item>
                        <Select.Item value="2nd">Second Year</Select.Item>
                        <Select.Item value="3rd">Third Year</Select.Item>
                        <Select.Item value="4th">Fourth Year</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select>
                  <Button
                    variant={activePage === "scan" ? "default" : "outline"}
                    size="sm"
                    className="uppercase"
                    onClick={() => handlePageChange("scan")}
                  >
                    Scan QR
                  </Button>
                </nav>
              )}
              {/* Logout Button for all logged in users */}
              <Button
                variant="outline"
                size="sm"
                className="uppercase bg-red-100 hover:bg-red-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button className="md:hidden" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>

            {/* Mobile Menu */}
            <div
              className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              } md:hidden z-50 p-4`}
            >
              <div className="flex flex-col space-y-4">
                {isAdmin && (
                  <>
                    <Button
                      variant={activePage === "dashboard" ? "default" : "outline"}
                      className="uppercase w-full"
                      onClick={() => { handlePageChange("dashboard"); toggleMobileMenu(); }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant={activePage === "stats" ? "default" : "outline"}
                      className="uppercase w-full"
                      onClick={() => { handlePageChange("stats"); toggleMobileMenu(); }}
                    >
                      Stats
                    </Button>
                    <Select onValueChange={(value) => { handleStudentYearSelect(value); toggleMobileMenu(); }}>
                      <Select.Trigger className="uppercase w-full">
                        <Select.Value placeholder="Students" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Group>
                          <Select.Item value="1st">First Year</Select.Item>
                          <Select.Item value="2nd">Second Year</Select.Item>
                          <Select.Item value="3rd">Third Year</Select.Item>
                          <Select.Item value="4th">Fourth Year</Select.Item>
                        </Select.Group>
                      </Select.Content>
                    </Select>
                    <Button
                      variant={activePage === "scan" ? "default" : "outline"}
                      className="uppercase w-full"
                      onClick={() => { handlePageChange("scan"); toggleMobileMenu(); }}
                    >
                      Scan QR
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase bg-red-100 hover:bg-red-200 w-full"
                  onClick={() => { handleLogout(); toggleMobileMenu(); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="uppercase"
            onClick={() => router.push("/login")}
          >
            <LogIn className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Login</span>
          </Button>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </header>
  );
}