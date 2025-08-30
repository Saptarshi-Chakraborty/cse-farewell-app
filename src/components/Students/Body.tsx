"use client";

import { Student } from "@/lib/types";
import { retroStyle } from "@/lib/styles";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import StudentDialog from "./StudentDialog";
import {
  DATABASE_ID,
  databases,
  FOOD_COUPON_COLLECTION_ID,
  ID,
  Query,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Text } from "../retroui/Text";
import { Input } from "@/components/retroui/Input";
import FeatureRules from "@/data/Feature.Rules.json";
import { toast } from "sonner";
import StudentsStats from "./StudentsStats";
import StudentsTable from "./StudentsTable"; // Import the new component

type StudentsPageBodyProps = {
  year: string;
};

// add: local type extension to carry coupon_generated
type LocalStudent = Student & { coupon_generated?: boolean | null };

const StudentsPageBody = ({ year }: StudentsPageBodyProps) => {
  const router = useRouter();
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  // Remove sorting state - it's moved to StudentsTable
  // const [sortBy, setSortBy] = useState<"name" | "roll" | null>(null);
  // const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const [emailSendLoading, setEmailSendLoading] = useState(false);

  // feature flags
  const canEdit = !!FeatureRules.enableEditing;
  const canEmail = !!FeatureRules.enableEmailSending;

  const yearShortName = getYearShortName(year);

  async function fetchStudents() {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        [Query.equal("year", year)]
      );
      const fetchedStudents = response.documents.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        roll: doc.roll,
        email: doc.email,
        year: doc.year,
        food_preference: doc.food_preference,
        payment_method: doc.payment_method,
        // add: include coupon_generated from backend
        coupon_generated: Boolean(doc.coupon_generated),
      })) as LocalStudent[];
      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddStudent = () => {
    // if (!canEdit) return toast.error("Editing is disabled.");
    setSelectedStudent(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    if (!canEdit) return toast.error("Editing is disabled.");
    setSelectedStudent(student);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!canEdit) return toast.error("Editing is disabled.");
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await databases.deleteDocument(DATABASE_ID, STUDENTS_COLLECTION_ID, id);
        // Recompute with updated list
        const updated = students.filter((s) => s.$id !== id);
        setStudents(updated);
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student. Please try again.");
      }
    }
  };

  // change: accept LocalStudent so we can read coupon_generated and control flow
  const handleSendEmail = async (student: LocalStudent): Promise<void> => {
    if (!canEmail) {
      toast.error("Email sending is disabled", { richColors: true });
      return;
    }

    if (student.payment_method === null) {
      toast.error("Cannot send email to unpaid student.", { richColors: true });
      return;
    }

    try {
      if (!student.email) throw new Error("Student has no email address.");

      const existing = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COUPON_COLLECTION_ID,
        [Query.equal("user_id", student.$id)]
      );

      if (existing.documents.length === 0) {
        // no coupon yet -> create one, update student, then send email
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        const ISOTimestamp = new Date().toISOString();

        const result = await databases.createDocument(
          DATABASE_ID,
          FOOD_COUPON_COLLECTION_ID,
          ID.unique(),
          {
            user_id: student.$id,
            random_code: `${randomNumber}`,
            created_at: ISOTimestamp,
            created_by: "admin",
          }
        );

        if (!result) {
          toast.error("Failed to create food coupon", { richColors: true });
          return;
        }

        try {
          await databases.updateDocument(
            DATABASE_ID,
            STUDENTS_COLLECTION_ID,
            student.$id as string,
            { coupon_generated: true }
          );
          // optimistic local state update
          setStudents((prev) =>
            prev.map((s) =>
              s.$id === student.$id ? { ...s, coupon_generated: true } : s
            )
          );
        } catch (updateError) {
          console.error(
            "Error updating student coupon_generated:",
            updateError
          );
        }
      }

      // at this point a coupon exists -> send/resend email
      await sendEmail(student);
    } catch (error) {
      console.error("Error in handleSendEmail:", error);
      toast.error("Failed to send email. Please try again.", {
        richColors: true,
      });
    }
  };

  async function sendEmail(student: LocalStudent) {
    // 1) Fetch the coupon to include in the QR
    const couponResponse = await databases.listDocuments(
      DATABASE_ID,
      FOOD_COUPON_COLLECTION_ID,
      [Query.equal("user_id", student.$id)]
    );

    if (couponResponse.documents.length === 0) {
      toast.error("No coupon found for this student.", {
        description: "Please generate a coupon before sending an email.",
      });
      return;
    }

    // 2) Build a stable text for QR generation
    const coupon = couponResponse.documents[0];
    const couponCode = coupon.random_code;
    const couponText = `${coupon.$id}-${coupon.user_id}-${couponCode}`;

    // 3) Generate QR image (Data URL)
    const imageUrl = await generateQrImage(couponText);
    if (!imageUrl) {
      toast.error("Failed to generate QR code for the email.");
      return;
    }

    console.log("Sending mail");
    let name = String(student.name).trim();
    let email = String(student.email).trim();
    let year = getYearShortName(student.year ?? "").trim();
    let roll = String(student.roll ?? "").trim();
    let food = String(student.food_preference ?? "").trim();

    if (!name || !email || !year || !roll || !food) {
      toast.error("Invalid Student data in email send functionality.");
      return;
    }

    if (food !== "veg" && food !== "non-veg") {
      toast.error("Food preference not selected.");
      return;
    }

    if (food === "veg") {
      food = "Veg";
    } else if (food === "non-veg") {
      food = "Non Veg";
    }

    console.log({ name, email, year, roll, food });

    const body: Record<string, string> = {
      name: name,
      email: email,
      roll: roll,
      year: year,
      food: food,
      imageUrl: imageUrl,
    };

    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => formData.append(key, value));

    const API_ENDPOINT = process.env.NEXT_PUBLIC_EMAIL_API_URL;

    if (!API_ENDPOINT) {
      toast.error("Email API URL is not configured.");
      return;
    }

    const params = {
      method: "POST",
      body: formData,
    };

    try {
      setEmailSendLoading(true);
      const response = await fetch(API_ENDPOINT, params);
      if (!response.ok) throw new Error("Failed to send email");
      toast.success("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.", {
        richColors: true,
      });
    } finally {
      setEmailSendLoading(false);
    }
  }

  async function generateQrImage(text: string | number | null) {
    if (!text) return null;
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(String(text), {
        type: "image/png",
        errorCorrectionLevel: "Q",
        width: 250,
        scale: 6,
      });

      console.log("Generated QR code URL:", url);

      return url;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  }

  // Check authentication and fetch students
  useEffect(() => {
    fetchStudents();
  }, [year, router]);

  // Remove handleSort function - it's moved to StudentsTable
  // const handleSort = (field: "name" | "roll") => {
  //   if (sortBy === field) {
  //     setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  //   } else {
  //     setSortBy(field);
  //     setSortDir("asc");
  //   }
  // };

  // Keep the filtered list by query logic
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const email = (s.email ?? "").toLowerCase();
      const roll = String(s.roll ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || roll.includes(q);
    });
  }, [students, query]);

  // Remove the sorting logic - it's moved to StudentsTable
  // const sortedStudents = useMemo(() => {
  //   const base = filteredStudents;
  //   if (!sortBy) return base;
  //   const sorted = [...base];
  //   sorted.sort((a, b) => {
  //     let cmp = 0;
  //     if (sortBy === "name") {
  //       cmp = (a.name || "").localeCompare(b.name || "", undefined, {
  //         sensitivity: "base",
  //       });
  //     } else {
  //       cmp = String(a.roll || "").localeCompare(
  //         String(b.roll || ""),
  //         undefined,
  //         {
  //           numeric: true,
  //           sensitivity: "base",
  //         }
  //       );
  //     }
  //     return sortDir === "asc" ? cmp : -cmp;
  //   });
  //   return sorted;
  // }, [filteredStudents, sortBy, sortDir]);

  return (
    <main id="main-content">
      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <Text as="h2" className="text-center sm:text-left">
            {yearShortName} Year Students
          </Text>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <Input
              aria-label="Search students"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, roll"
              className="w-full sm:w-64 bg-white text-black"
            />

            <Button
              className={`uppercase bg-blue-400 hover:bg-blue-500`}
              onClick={fetchStudents}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              </svg>
              <span className="hidden sm:inline ml-2">
                {loading ? "Refreshing..." : "Refresh List"}
              </span>
            </Button>

            <Button
              className={`uppercase bg-green-400 hover:bg-green-500`}
              onClick={handleAddStudent}
              disabled={loading}
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">Add Student</span>
            </Button>
          </div>
        </div>

        {/* Student Statistics */}
        <StudentsStats students={students} loading={loading} />

        <Card className="p-4 block">
          <div className="w-full overflow-x-auto">
            {/* Update to pass filteredStudents instead of sortedStudents */}
            <StudentsTable
              students={filteredStudents}
              loading={loading}
              query={query}
              handleEditStudent={handleEditStudent}
              handleDeleteStudent={handleDeleteStudent}
              handleSendEmail={handleSendEmail}
            />
          </div>
        </Card>
      </section>
      {canEdit && (
        <StudentDialog
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedStudent(null);
          }}
          mode={modalMode}
          year={year}
          initialStudent={
            modalMode === "edit"
              ? {
                  $id: selectedStudent?.$id,
                  name: selectedStudent?.name || "",
                  email: selectedStudent?.email || "",
                  year: selectedStudent?.year || "",
                  roll: selectedStudent?.roll || "",
                  food_preference: selectedStudent?.food_preference || "veg",
                  payment_method:
                    (selectedStudent?.payment_method as any) ?? null,
                }
              : undefined
          }
          onSubmitted={() => {
            fetchStudents();
          }}
        />
      )}
    </main>
  );
};

export default StudentsPageBody;

function getYearShortName(year: string | number): string {
  year = String(year).trim();

  switch (year) {
    case "1st Year":
    case "1":
      return "1st";
    case "2nd Year":
    case "2":
      return "2nd";
    case "3rd Year":
    case "3":
      return "3rd";
    case "4th Year":
    case "4":
      return "4th";
    default:
      return year;
  }
}