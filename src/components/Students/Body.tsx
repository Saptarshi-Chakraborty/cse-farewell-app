"use client";

import { Student } from "@/lib/types";
import { retroStyle } from "@/lib/styles";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import StudentDialog from "./StudentDialog";
import {
  DATABASE_ID,
  databases,
  Query,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Text } from "../retroui/Text";

type StudentsPageBodyProps = {
  year: string;
};

const StudentsPageBody = ({ year }: StudentsPageBodyProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    vegCount: 0,
    nonVegCount: 0,
    paidCount: 0,
  });

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
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        // Delete from Appwrite database
        await databases.deleteDocument(DATABASE_ID, STUDENTS_COLLECTION_ID, id);

        // Update local state after successful deletion
        setStudents((prev) => prev.filter((student) => student.$id !== id));

        // Update stats
        setStats((prev) =>
          calculateStats(students.filter((s) => s.$id !== id))
        );
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  // Fetch students when the component mounts
  useEffect(() => {
    fetchStudents();
  }, [year]);

  return (
    <main id="main-content">
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <Text as="h2" className="text-3xl">{yearShortName} Year Students</Text>
          <div className="flex items-center gap-2">
            <Button
              className={`uppercase bg-blue-400 hover:bg-blue-500`}
              onClick={fetchStudents}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh List"}
            </Button>
            <Button
              className={`uppercase bg-green-400 hover:bg-green-500`}
              onClick={handleAddStudent}
              disabled={loading}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add Student
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg text-black">#</TableHead>
                <TableHead className="text-lg text-black">Name</TableHead>
                <TableHead className="text-lg text-black">Roll No.</TableHead>
                <TableHead className="text-lg text-black">Email</TableHead>
                <TableHead className="text-lg text-black">Food Pref.</TableHead>
                <TableHead className="text-lg text-black">Payment</TableHead>
                <TableHead className="text-lg text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    No students found. Add some students to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, i) => (
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
        </Card>
      </section>
      <StudentDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        year={year}
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
