export type Page = "stats" | "students" | "scan" | "login" | "profile" | "dashboard" | "students/[year]" | "students/bulk_upload";



export type Student = {
  $id: string;
  name: string;
  email: string;
  year: undefined | string | null;
  roll: string;
  food_preference: "veg" | "non-veg";
  payment_method: "online" | "offline" | "null" | null;
};

export type StudentsPageBodyProps = {
  year: string;
};
