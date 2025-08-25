"use client";

import { Button } from "@/components/ui/button";
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
  DATABASE_ID,
  databases,
  ID,
  STUDENTS_COLLECTION_ID,
} from "@/lib/appwrite";

import { retroStyle } from "@/lib/styles";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StudentDoc = {
  $id?: string;
  name: string;
  email: string;
  year: string;
  roll: string;
  food_preference: string;
  payment_method: string | null;
};

// Dialog Component
const StudentDialog = ({
  isOpen,
  onOpenChange,
  year,
  mode = "add",
  initialStudent,
  onSubmitted,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  year?: string | null;
  mode?: "add" | "edit";
  initialStudent?: StudentDoc | null;
  onSubmitted?: (saved: any, mode: "add" | "edit") => void;
}) => {
  const [student, setStudent] = useState<StudentDoc>({
    name: "",
    email: "",
    year: year || "",
    roll: "",
    food_preference: "veg",
    payment_method: "null",
  });

  // Prefill when editing or when year changes for add
  useEffect(() => {
    if (mode === "edit" && initialStudent) {
      setStudent({
        $id: initialStudent.$id,
        name: initialStudent.name || "",
        email: initialStudent.email || "",
        year: initialStudent.year || "",
        roll: initialStudent.roll || "",
        food_preference:
          (initialStudent.food_preference || "veg").toLowerCase(),
        payment_method:
          initialStudent.payment_method === null
            ? "null"
            : String(initialStudent.payment_method),
      });
    } else {
      setStudent((prev) => ({
        ...prev,
        year: year || "",
      }));
    }
  }, [mode, initialStudent, year, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    let name: string, value: string;
    if ("target" in e) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = String(student.name).trim();
    const roll = String(student.roll).trim();
    const email = String(student.email).trim();
    let food_preference = String(student.food_preference).trim().toLowerCase();
    let payment_method: string | null = String(student.payment_method).trim();
    const yearVal = String(student.year).trim();

    if (!name || !roll || !email) {
      console.error("Name, Roll and Email are required.");
      return;
    }

    if (payment_method === "null") payment_method = null;
    if (food_preference !== "veg" && food_preference !== "non-veg") {
      food_preference = "veg";
    }

    const payload = {
      name,
      email,
      year: yearVal,
      roll,
      food_preference,
      payment_method,
    };

    try {
      let result;
      if (mode === "edit" && initialStudent?.$id) {
        result = await databases.updateDocument(
          DATABASE_ID,
          STUDENTS_COLLECTION_ID,
          initialStudent.$id,
          payload
        );
      } else {
        result = await databases.createDocument(
          DATABASE_ID,
          STUDENTS_COLLECTION_ID,
          ID.unique(),
          payload
        );
      }

      onSubmitted?.(result, mode);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to save student. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-[#FDF6E3] ${retroStyle} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "edit" ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base">
              Student Name:
            </Label>
            <Input
              id="name"
              name="name"
              value={student.name}
              onChange={handleChange}
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="roll" className="text-base">
              Roll No.:
            </Label>
            <Input
              id="roll"
              name="roll"
              value={student.roll}
              onChange={handleChange}
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-base">
              Email:
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={student.email}
              onChange={handleChange}
              required
              className={`${retroStyle}`}
            />
          </div>
          <div>
            <Label htmlFor="food_preference" className="text-base">
              Food Preference:
            </Label>
            <Select
              name="food_preference"
              value={student.food_preference}
              onValueChange={(value) =>
                handleChange({ name: "food_preference", value })
              }
            >
              <SelectTrigger className={`${retroStyle}`}>
                <SelectValue placeholder="Select food preference" />
              </SelectTrigger>
              <SelectContent className={`bg-[#FDF6E3] ${retroStyle}`}>
                {/* normalized to lower case for consistency */}
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non-veg">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment_method" className="text-base">
              Payment Mode:
            </Label>
            <Select
              name="payment_method"
              value={student.payment_method ?? "null"}
              onValueChange={(value) =>
                handleChange({ name: "payment_method", value })
              }
            >
              <SelectTrigger className={`${retroStyle}`}>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent className={`bg-[#FDF6E3] ${retroStyle}`}>
                <SelectItem value="null">Not-Paid</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
              {mode === "edit" ? "Save Changes" : "Save Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDialog;
