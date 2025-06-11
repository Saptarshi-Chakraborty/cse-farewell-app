// /components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { LogOut } from "lucide-react";
import { deleteSession } from "@/lib/appwrite";
import { Page } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";

const retroStyle =
  "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

export default function Header() {
  const { checkAuth, user } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState<Page>("stats");

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

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-4 border-black">
      <h1 className="text-4xl md:text-5xl mb-4 sm:mb-0">SEMICOLON '25</h1>
      <nav className="flex space-x-2">
        <Button
          variant={activePage === "stats" ? "default" : "outline"}
          className={`${retroStyle} uppercase`}
          onClick={() => handlePageChange("stats")}
        >
          Stats
        </Button>
        <Button
          variant={activePage === "students" ? "default" : "outline"}
          className={`${retroStyle} uppercase`}
          onClick={() => handlePageChange("students")}
        >
          Students
        </Button>
        <Button
          variant={activePage === "scan" ? "default" : "outline"}
          className={`${retroStyle} uppercase`}
          onClick={() => handlePageChange("scan")}
        >
          Scan QR
        </Button>
        {user && (
          <Button
            variant="outline"
            className={`${retroStyle} uppercase bg-red-100 hover:bg-red-200`}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </nav>
    </header>
  );
}
