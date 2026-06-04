import { ScanLine, Users, FileUp, LineChart } from "lucide-react";
import FeatureRule from "@/data/Feature.Rules.json";

const ROUTES = [
    {
      title: "1st Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/1st",
      bgColor: "bg-blue-200",
      showInDashboard: true,
    },
    {
      title: "2nd Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/2nd",
      bgColor: "bg-green-200",
      showInDashboard: true,
    },
    {
      title: "3rd Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/3rd",
      bgColor: "bg-yellow-200",
      showInDashboard: true,
    },
    {
      title: "4th Year Students",
      icon: <Users className="h-8 w-8" />,
      path: "/students/4th",
      bgColor: "bg-red-200",
      showInDashboard: true,
    },
    // {
    //   title: "Statistics",
    //   icon: <LineChart className="h-8 w-8" />,
    //   path: "/stats",
    //   bgColor: "bg-purple-200",
    // },
    {
      title: "Bulk Upload",
      icon: <FileUp className="h-8 w-8" />,
      path: "/students/bulk_upload",
      bgColor: "bg-purple-200",
      showInDashboard: true,
    },
    {
      title: "Scan QR",
      icon: <ScanLine className="h-8 w-8" />,
      path: "/scan",
      bgColor: "bg-orange-200",
      showInDashboard: FeatureRule.enableQrScan,
    },
  ];

export default ROUTES;