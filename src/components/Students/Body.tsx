// /app/students/page.tsx
"use client";

import { Student } from "@/lib/types";
import { retroStyle } from "@/lib/styles";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import StudentDialog from "./StudentDialog";
import {
  DATABASE_ID,
  databases,
  Query,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";

type StudentsPageBodyProps = {
  year: string;
};

const StudentsPageBody = ({ year }: StudentsPageBodyProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchStudents() {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        [Query.equal("year", year)]
      );
      setStudents(
        response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          roll: doc.roll,
          email: doc.email,
          year: doc.year,
          food_preference: doc.food_preference,
          payment_method: doc.payment_method,
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddStudent = () => {
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
    }
  };

  const handleSaveStudent = (newStudent: Omit<Student, "id">) => {
    setStudents((prev) => [...prev, { ...newStudent, id: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <main id="main-content">
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl">{year} Year Students List</h2>
          <div className="space-x-2">
            <Button
              className={`${retroStyle} uppercase bg-blue-400 hover:bg-blue-500`}
              onClick={fetchStudents}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh List"}
            </Button>
            <Button
              className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`}
              onClick={handleAddStudent}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add Student
            </Button>
          </div>
        </div>
        <Card className={retroStyle}>
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
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No students found. Add some students to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, i) => (
                  <TableRow key={student.id}>
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
                      <Button
                        variant="outline"
                        size="icon"
                        className={retroStyle}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={retroStyle}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
