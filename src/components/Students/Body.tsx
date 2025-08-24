"use client";

import { Student } from "@/lib/types";
import { retroStyle } from "@/lib/styles";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/retroui/Table"; // switched to RetroUI
import { useEffect, useState, useMemo } from "react";
import StudentDialog from "./StudentDialog";
import {
  DATABASE_ID,
  databases,
  Query,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Text } from "../retroui/Text";
import { Input } from "@/components/retroui/Input";

type StudentsPageBodyProps = {
  year: string;
};

const StudentsPageBody = ({ year }: StudentsPageBodyProps) => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    vegCount: 0,
    nonVegCount: 0,
    paidCount: 0,
  });
  // sorting state
  const [sortBy, setSortBy] = useState<"name" | "roll" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  // add: search state
  const [query, setQuery] = useState("");

  const yearShortName = getYearShortName(year);

  const calculateStats = (studentList: Student[]) => {
    return {
      vegCount: studentList.filter((s) => s.food_preference === "veg").length,
      nonVegCount: studentList.filter((s) => s.food_preference === "non-veg")
        .length,
      paidCount: studentList.filter((s) => s.payment_method).length,
    };
  };

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
      }));
      setStudents(fetchedStudents);
      // Calculate stats after fetching students
      setStats(calculateStats(fetchedStudents));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await databases.deleteDocument(DATABASE_ID, STUDENTS_COLLECTION_ID, id);
        // Recompute with updated list
        const updated = students.filter((s) => s.$id !== id);
        setStudents(updated);
        setStats(calculateStats(updated));
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  // Check authentication and fetch students
  useEffect(() => {
    fetchStudents();
  }, [year, router]);

  // add: sorting handler
  const handleSort = (field: "name" | "roll") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // add: filtered list by query
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const email = (s.email ?? "").toLowerCase();
      const roll = String(s.roll ?? "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        roll.includes(q)
      );
    });
  }, [students, query]);

  // update: memoized sorted list (sort after filtering)
  const sortedStudents = useMemo(() => {
    const base = filteredStudents;
    if (!sortBy) return base;
    const sorted = [...base];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        });
      } else {
        cmp = String(a.roll || "").localeCompare(String(b.roll || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredStudents, sortBy, sortDir]);

  return (
    <main id="main-content">
      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <Text as="h2" className="text-3xl text-center sm:text-left">
            {yearShortName} Year Students
          </Text>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            {/* replace: use RetroUI Input */}
            <Input
              aria-label="Search students"
              type="text"
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

        {students.length > 0 && (
          <Card className={`${retroStyle} p-4 block`}>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {stats.vegCount}
                </p>
                <Text as="p">Veg</Text>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {stats.nonVegCount}
                </p>
                <p className="text-sm">Non-Veg</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {stats.paidCount}
                </p>
                <p className="text-sm">Paid Students</p>
              </div>
            </div>
          </Card>
        )}

        <Card className={`p-4 block`}>
          {/* ...existing code... */}
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg text-black">#</TableHead>
                  <TableHead className="text-lg text-black">
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => handleSort("name")}
                      title="Sort by Name"
                    >
                      Name
                      {sortBy === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : null}
                    </button>
                  </TableHead>
                  <TableHead className="text-lg text-black">
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => handleSort("roll")}
                      title="Sort by Roll No."
                    >
                      Roll No.
                      {sortBy === "roll" ? (sortDir === "asc" ? " ▲" : " ▼") : null}
                    </button>
                  </TableHead>
                  <TableHead className="text-lg text-black">Email</TableHead>
                  <TableHead className="text-lg text-black">Food Pref.</TableHead>
                  <TableHead className="text-lg text-black">Payment</TableHead>
                  <TableHead className="text-lg text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500"
                    >
                      {query
                        ? "No matching students found."
                        : "No students found. Add some students to see them here."}
                    </TableCell>
                  </TableRow>
                ) : (
                  // render filtered + sorted students
                  sortedStudents.map((student, i) => (
                    <TableRow key={student.$id}>
                      <TableCell className="text-base font-semibold">
                        {i + 1}
                      </TableCell>
                      <TableCell className="text-base">{student.name}</TableCell>
                      <TableCell className="text-base">{student.roll}</TableCell>
                      <TableCell className="text-base">{student.email}</TableCell>
                      <TableCell className="text-base">
                        {student.food_preference}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.payment_method || "N/A"}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={retroStyle}
                            onClick={() => handleEditStudent(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            className="bg-destructive text-white hover:bg-destructive/90 border-black"
                            onClick={() =>
                              handleDeleteStudent(String(student.$id))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
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
