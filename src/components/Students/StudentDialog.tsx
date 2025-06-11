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
import { useState } from "react";

type Student = {
  id: string;
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
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  year: String | undefined | null;
}) => {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    year: year || "",
    roll: "",
    food_preference: "veg",
    payment_method: "null",
  });

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
    let food_preference = String(student.food_preference).trim();
    let payment_method: string | null = String(student.payment_method).trim();
    let year = String(student.year).trim();

    if (!name) {
      console.error("Name is required.");
      return;
    }

    if (payment_method === "null") payment_method = null;

    const newStudent = {
      name,
      email,
      year,
      roll,
      food_preference,
      payment_method,
    };

    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        ID.unique(),
        newStudent
      );

      console.log("Student saved successfully:", result);
    } catch (error) {
      console.error("Error saving student:", error);
    }

    console.log("New Student Data:", newStudent);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-[#FDF6E3] ${retroStyle} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Student</DialogTitle>
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
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non-Veg">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment_method" className="text-base">
              Payment Mode:
            </Label>
            <Select
              name="payment_method"
              value={student.payment_method}
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
              Save Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDialog;
