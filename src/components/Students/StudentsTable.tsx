import { Student } from "@/lib/types";
import { Pencil, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/retroui/Table";
import { retroStyle } from "@/lib/styles";
import { Badge } from "../retroui/Badge";
import { useMemo, useState } from "react";
import FeatureRules from "@/data/Feature.Rules.json";

// Extended Student type with coupon_generated field
type LocalStudent = Student & { coupon_generated?: boolean | null };

interface StudentsTableProps {
  students: LocalStudent[];
  loading: boolean;
  query: string;
  handleEditStudent?: (student: Student) => void;
  handleDeleteStudent?: (id: string) => void;
  handleSendEmail: (student: LocalStudent) => Promise<void>;
}

const StudentsTable = ({
  students: filteredStudents,
  loading,
  query,
  handleEditStudent,
  handleDeleteStudent,
  handleSendEmail,
}: StudentsTableProps) => {
  // Move sort state to this component
  const [sortBy, setSortBy] = useState<"name" | "roll" | null>("roll");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // feature flags
  const canEdit = !!FeatureRules.enableEditing;
  const canEmail = !!FeatureRules.enableEmailSending;

  // Move sort handler to this component
  const handleSort = (field: "name" | "roll") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // Move sorting logic to this component
  const sortedStudents = useMemo(() => {
    if (!sortBy) return filteredStudents;
    const sorted = [...filteredStudents];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        });
      } else {
        cmp = String(a.roll || "").localeCompare(
          String(b.roll || ""),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        );
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredStudents, sortBy, sortDir]);

  return (
    <Table className="min-w-[720px]" aria-busy={loading}>
      <TableHeader>
        <TableRow>
          {/* Roll */}
          <TableHead className="text-lg text-black">
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("roll")}
              title="Sort by Roll No."
            >
              Roll
              {sortBy === "roll" ? (sortDir === "asc" ? " ▲" : " ▼") : null}
            </button>
          </TableHead>

          {/* Student Name */}
          <TableHead className="text-lg text-black">
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("name")}
              title="Sort by Name"
            >
              Name
              {sortBy === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : null}
            </button>
          </TableHead>

          <TableHead className="text-lg text-black">Email</TableHead>
          <TableHead className="text-lg text-black">Food Pref.</TableHead>
          <TableHead className="text-lg text-black">Payment</TableHead>
          {(canEmail || canEdit) && (
            <TableHead className="text-lg text-black">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>

            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M12 2a10 10 0 0 1 10 10h-4A6 6 0 0 0 12 6V2z"
                  />
                </svg>
                <span>Loading students...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : sortedStudents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              {query
                ? "No matching students found."
                : "No students found. Add some students to see them here."}
            </TableCell>
          </TableRow>
        ) : (
          sortedStudents.map((student, i) => (
            <TableRow key={student.$id}>
            
              <TableCell className="text-base">{student.roll}</TableCell>
              <TableCell className="text-base">{student.name}</TableCell>
              <TableCell className="text-base">{student.email}</TableCell>
              <TableCell className="text-base">
                {student.food_preference === "veg" ? (
                  <Badge size="sm" className="bg-green-500 text-black">
                    Veg
                  </Badge>
                ) : student.food_preference === "non-veg" ? (
                  <Badge size="sm" className="bg-red-500 text-white">
                    Non&nbsp;Veg
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500">N/A</Badge>
                )}
              </TableCell>
              <TableCell className="text-base">
                {student.payment_method || "N/A"}
              </TableCell>
              {(canEmail || canEdit) && (
                <TableCell className="space-x-1">
                  <div className="flex space-x-2">
                    {canEmail && (
                      <Button
                        className={`disabled:opacity-50 uppercase ${
                          student.coupon_generated
                            ? "bg-blue-400 hover:bg-blue-500"
                            : "bg-green-400 hover:bg-green-500"
                        }`}
                        onClick={() => handleSendEmail(student)}
                        disabled={student.payment_method === null}
                        title={
                          student.payment_method === null
                            ? "Payment not made"
                            : student.coupon_generated
                            ? "Resend Email"
                            : "Send Email"
                        }
                      >
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">
                          {student.payment_method === null
                            ? "Payment due"
                            : student.coupon_generated
                            ? "Resend Email"
                            : "Send Email"}
                        </span>
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className={retroStyle}
                          onClick={() => handleEditStudent?.(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="bg-destructive text-white hover:bg-destructive/90 border-black"
                          onClick={() =>
                            handleDeleteStudent?.(String(student.$id))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StudentsTable;
