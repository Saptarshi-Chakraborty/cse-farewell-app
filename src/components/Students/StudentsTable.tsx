import { Button } from "@/components/retroui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/retroui/Table";
import FeatureRules from "@/data/Feature.Rules.json";
import { DATABASE_ID, databases, FOOD_COUPON_COLLECTION_ID, ID, Query, STUDENTS_COLLECTION_ID } from "@/lib/appwrite";
import { retroStyle } from "@/lib/styles";
import { Student } from "@/lib/types";
import { Mail, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../retroui/Badge";
import { getYearShortName } from "./Body";


// Extended Student type with coupon_generated field
type LocalStudent = Student & { 
  coupon_generated?: boolean | null;
  coupon_redeemed?: boolean | null;
};

interface StudentsTableProps {
  students: LocalStudent[];
  loading: boolean;
  query: string;
  handleEditStudent?: (student: Student) => void;
  handleDeleteStudent?: (id: string) => void;
  onStudentUpdated: () => void; // New prop to refresh students after update
}

const StudentsTable = ({
  students: filteredStudents,
  loading,
  query,
  handleEditStudent,
  handleDeleteStudent,
  onStudentUpdated,
}: StudentsTableProps) => {
  // Move sort state to this component
  const [sortBy, setSortBy] = useState<"name" | "roll" | null>("roll");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [emailSendLoading, setEmailSendLoading] = useState(false);

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

  // Email sending logic moved from Body component
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
          
          // Call the callback to refresh the student list
          onStudentUpdated();
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
                      student.coupon_redeemed ? (
                        <Badge size="sm" className="bg-purple-500 text-white flex items-center px-3 py-1">
                          Redeemed
                        </Badge>
                      ) : (
                        <Button
                          className={`disabled:opacity-50 uppercase ${
                            student.coupon_generated
                              ? "bg-blue-400 hover:bg-blue-500"
                              : "bg-green-400 hover:bg-green-500"
                          }`}
                          onClick={() => handleSendEmail(student)}
                          disabled={
                            student.payment_method === null || 
                            emailSendLoading
                          }
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
                      )
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
