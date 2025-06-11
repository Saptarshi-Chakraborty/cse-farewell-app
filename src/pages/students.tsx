// /app/students/page.tsx
"use client";

import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Page } from "@/lib/types";
import { useRouter } from "next/router";

type Student = {
  id: number;
  name: string;
  roll: string;
  email: string;
  foodPref: "Veg" | "Non-Veg";
  paymentMode: "Online" | "Offline";
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Amit Kumar",
    roll: "CSE123",
    email: "amit.k@example.com",
    foodPref: "Veg",
    paymentMode: "Online",
  },
  {
    id: 2,
    name: "Priya Sharma",
    roll: "CSE124",
    email: "priya.s@example.com",
    foodPref: "Non-Veg",
    paymentMode: "Offline",
  },
  {
    id: 3,
    name: "Rahul Singh",
    roll: "CSE125",
    email: "rahul.s@example.com",
    foodPref: "Veg",
    paymentMode: "Online",
  },
];

const retroStyle =
  "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = (page: Page) => {
    switch (page) {
      case "stats":
        router.push("/stats");
        break;
      case "students":
        router.push("/students");
        break;
      case "scan":
        router.push("/scan");
        break;
    }
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
    }
  };

  const handleAddStudent = () => {
    setIsModalOpen(true);
  };

  const handleSaveStudent = (newStudent: Omit<Student, "id">) => {
    setStudents((prev) => [...prev, { ...newStudent, id: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");
        body {
          font-family: "VT323", monospace;
          background-color: #fdf6e3;
          color: #2a2a2a;
        }
      `}</style>
      <div className="p-4 md:p-8">
        <Header  />

        <main id="main-content">
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl">4th Year Students List</h2>
              <Button
                className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`}
                onClick={handleAddStudent}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add Student
              </Button>
            </div>
            <Card className={retroStyle}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg text-black">Name</TableHead>
                    <TableHead className="text-lg text-black">
                      Roll No.
                    </TableHead>
                    <TableHead className="text-lg text-black">Email</TableHead>
                    <TableHead className="text-lg text-black">
                      Food Pref.
                    </TableHead>
                    <TableHead className="text-lg text-black">
                      Payment
                    </TableHead>
                    <TableHead className="text-lg text-black">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-base">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.roll}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.foodPref}
                      </TableCell>
                      <TableCell className="text-base">
                        {student.paymentMode}
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
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
        </main>

        <Footer />

        <StudentDialog
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={handleSaveStudent}
        />
      </div>
    </>
  );
}

// Dialog Component
const StudentDialog = ({
  isOpen,
  onOpenChange,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: Omit<Student, "id">) => void;
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent = {
      name: formData.get("student-name") as string,
      roll: formData.get("student-roll") as string,
      email: formData.get("student-email") as string,
      foodPref: formData.get("food-preference") as "Veg" | "Non-Veg",
      paymentMode: formData.get("payment-mode") as "Online" | "Offline",
    };
    onSave(newStudent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-[#FDF6E3] ${retroStyle} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student-name" className="text-base">
              Student Name:
            </Label>
            <Input
              id="student-name"
              name="student-name"
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="student-roll" className="text-base">
              Roll No.:
            </Label>
            <Input
              id="student-roll"
              name="student-roll"
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="student-email" className="text-base">
              Email:
            </Label>
            <Input
              id="student-email"
              name="student-email"
              type="email"
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="food-preference" className="text-base">
              Food Preference:
            </Label>
            <Select name="food-preference" defaultValue="Veg">
              <SelectTrigger className={`${retroStyle}`}>
                <SelectValue placeholder="Select food preference" />
              </SelectTrigger>
              <SelectContent className={`bg-[#FDF6E3] ${retroStyle}`}>
                <SelectItem value="Veg">Veg</SelectItem>
                <SelectItem value="Non-Veg">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment-mode" className="text-base">
              Payment Mode:
            </Label>
            <Select name="payment-mode" defaultValue="Online">
              <SelectTrigger className={`${retroStyle}`}>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent className={`bg-[#FDF6E3] ${retroStyle}`}>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className={`${retroStyle} uppercase`}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`}
            >
              Save Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
