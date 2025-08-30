"use client";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import FeatureRules from "@/data/Feature.Rules.json";
import {
  DATABASE_ID,
  databases,
  STUDENTS_COLLECTION_ID,
  Query,
  client,
} from "@/lib/appwrite";
import { Student } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { Text } from "../retroui/Text";
import StudentDialog from "./StudentDialog";
import StudentsStats from "./StudentsStats";
import StudentsTable from "./StudentsTable";

type StudentsPageBodyProps = {
  year: string;
};

// add: local type extension to carry coupon_generated
type LocalStudent = Student & { 
  coupon_generated?: boolean | null;
  coupon_redeemed?: boolean | null; 
};

const StudentsPageBody = ({ year }: StudentsPageBodyProps) => {
  const router = useRouter();
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [query, setQuery] = useState("");
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // feature flags
  const canEdit = !!FeatureRules.enableEditing;

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
        // add: include coupon_redeemed from backend
        coupon_redeemed: Boolean(doc.coupon_redeemed),
      })) as LocalStudent[];
      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }

  // Set up Realtime subscription (patch local state using payload)
  useEffect(() => {
    // Clear any previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const channels = [
      // Generic channel covering all rows
      "rows",
      // Tables/rows (newer)
      `databases.${DATABASE_ID}.tables.${STUDENTS_COLLECTION_ID}.rows`,
      // Collections/documents (older)
      `databases.${DATABASE_ID}.collections.${STUDENTS_COLLECTION_ID}.documents`,
    ];

    const isStudentsEvent = (events: string[]) => {
      // Match either tables/rows or collections/documents forms for this collection
      return events.some(
        (e) =>
          e.includes(
            `databases.${DATABASE_ID}.tables.${STUDENTS_COLLECTION_ID}.rows.`
          ) ||
          e.includes(
            `databases.${DATABASE_ID}.collections.${STUDENTS_COLLECTION_ID}.documents.`
          )
      );
    };

    const toLocalStudent = (p: any): LocalStudent => ({
      $id: p.$id,
      name: p.name,
      roll: p.roll,
      email: p.email,
      year: p.year,
      food_preference: p.food_preference,
      payment_method: p.payment_method,
      coupon_generated: Boolean(p.coupon_generated),
      coupon_redeemed: Boolean(p.coupon_redeemed),
    });

    const unsubscribe = client.subscribe(channels, (response: any) => {
      try {
        const events: string[] = response?.events ?? [];
        const payload = response?.payload as any;
        if (!payload?.$id || !isStudentsEvent(events)) return;

        // Guard: ensure same DB/collection
        const isSameDb =
          !payload?.$databaseId || payload.$databaseId === DATABASE_ID;
        const isSameCollection =
          !payload?.$tableId && !payload?.$collectionId
            ? true
            : payload.$tableId === STUDENTS_COLLECTION_ID ||
              payload.$collectionId === STUDENTS_COLLECTION_ID;
        if (!isSameDb || !isSameCollection) return;

        const isCreate = events.some((e) => e.endsWith(".create"));
        const isUpdate = events.some((e) => e.endsWith(".update"));
        const isDelete = events.some((e) => e.endsWith(".delete"));

        if (isCreate) {
          // Add only if current year matches
          if (payload.year === year) {
            setStudents((prev) => {
              if (prev.some((s) => s.$id === payload.$id)) return prev;
              return [...prev, toLocalStudent(payload)];
            });
          }
          return;
        }

        if (isUpdate) {
          setStudents((prev) => {
            const exists = prev.some((s) => s.$id === payload.$id);
            // If moved to a different year, remove locally
            if (exists && payload.year !== year) {
              return prev.filter((s) => s.$id !== payload.$id);
            }
            // If belongs to current year:
            if (payload.year === year) {
              if (!exists) {
                // New to this year due to year change
                return [...prev, toLocalStudent(payload)];
              }
              // Merge update
              return prev.map((s) =>
                s.$id === payload.$id
                  ? {
                      ...s,
                      name: payload.name,
                      roll: payload.roll,
                      email: payload.email,
                      food_preference: payload.food_preference,
                      payment_method: payload.payment_method,
                      coupon_generated: Boolean(payload.coupon_generated),
                      coupon_redeemed: Boolean(payload.coupon_redeemed),
                    }
                  : s
              );
            }
            // Update not relevant to current year
            return prev;
          });
          return;
        }

        if (isDelete) {
          setStudents((prev) => prev.filter((s) => s.$id !== payload.$id));
          return;
        }
      } catch {
        // ignore malformed messages
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [year]);

  // Initial data fetch
  useEffect(() => {
    fetchStudents();
  }, [year, router]);

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

  return (
    <main id="main-content">
      <section className="space-y-6 mt-4">
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
            {/* Update to pass the refreshStudents callback instead of handleSendEmail */}
            <StudentsTable
              students={filteredStudents}
              loading={loading}
              query={query}
              handleEditStudent={handleEditStudent}
              handleDeleteStudent={handleDeleteStudent}
              onStudentUpdated={fetchStudents}
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

export function getYearShortName(year: string | number): string {
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