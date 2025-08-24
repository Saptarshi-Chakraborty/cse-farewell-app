export type Page =
  | "stats"
  | "students"
  | "scan"
  | "login"
  | "profile"
  | "dashboard"
  | "students/[year]"
  | "students/bulk_upload";

export type Student = {
  $id: string;
  name: string;
  email: string;
  year: undefined | string | null;
  roll: string;
  food_preference: "veg" | "non-veg";
  payment_method: "online" | "offline" | "null" | null;
  coupon_generated?: boolean;
};

export type StudentsPageBodyProps = {
  year: string;
};

export type ScannedStudent = {
  name: string;
  food: string;
  roll: string;
  status?: string;
};

export type VideoState = {
    gotPermissions: boolean;
    cameraStarted: boolean;
    numberOfDevices: number;
    errorMessage: string | null;
};
