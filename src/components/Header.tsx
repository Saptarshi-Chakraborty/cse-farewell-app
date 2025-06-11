// /components/Header.tsx
"use client";

import { Button } from "@/components/retroui/Button";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { LogOut, Menu, LogIn } from "lucide-react";
import { deleteSession } from "@/lib/appwrite";
import { Page } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Text } from "./retroui/Text";

export default function Header() {
  const { checkAuth, user } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState<Page>("stats");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    // Set active page based on pathname
    const path = pathname.replace("/", "") as Page;
    if (path) setActivePage(path);
  }, [pathname]);

  const handlePageChange = (page: Page) => {
    setActivePage(page);
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await deleteSession();
    checkAuth();
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-4 border-black">
        <Link href="/">
          <Text as="h1" className="text-3xl md:text-4xl ">SEMICOLON '25</Text>
        </Link>

        {user ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Button
                variant={activePage === "stats" ? "default" : "outline"}
                size="sm"
                className="uppercase"
                onClick={() => handlePageChange("stats")}
              >
                Stats
              </Button>
              <Button
                variant={activePage === "students" ? "default" : "outline"}
                size="sm"
                className="uppercase"
                onClick={() => handlePageChange("students")}
              >
                Students
              </Button>
              <Button
                variant={activePage === "scan" ? "default" : "outline"}
                size="sm"
                className="uppercase"
                onClick={() => handlePageChange("scan")}
              >
                Scan QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="uppercase bg-red-100 hover:bg-red-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>

            {/* Mobile Hamburger */}
            <button className="md:hidden" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>

            {/* Mobile Menu */}
            <div
              className={`
              fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              ${
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }
              md:hidden z-50 p-4
            `}
            >
              <div className="flex flex-col space-y-4">
                <Button
                  variant={activePage === "stats" ? "default" : "outline"}
                  className="uppercase w-full"
                  onClick={() => {
                    handlePageChange("stats");
                    toggleMobileMenu();
                  }}
                >
                  Stats
                </Button>
                <Button
                  variant={activePage === "students" ? "default" : "outline"}
                  className="uppercase w-full"
                  onClick={() => {
                    handlePageChange("students");
                    toggleMobileMenu();
                  }}
                >
                  Students
                </Button>
                <Button
                  variant={activePage === "scan" ? "default" : "outline"}
                  className="uppercase w-full"
                  onClick={() => {
                    handlePageChange("scan");
                    toggleMobileMenu();
                  }}
                >
                  Scan QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase bg-red-100 hover:bg-red-200 w-full"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
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

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20  bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </header>
  );
}
