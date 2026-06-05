# 🎓 Semicolon '26 - CSE Department Farewell App

Welcome to **Semicolon '26**, the official web application designed to streamline student registration, manage attendance, and facilitate food coupon distribution for the Computer Science & Engineering Department Farewell celebration at Future Institute of Engineering and Management (FIEM).

Built using a modern web stack featuring **Next.js (Pages Router)**, **Appwrite (Backend-as-a-Service)**, **Tailwind CSS v4**, and a custom **Retro/Brutalist UI Design System**, this app provides event organizers and administrators with real-time controls, analytics, bulk uploading, and QR-code-based coupon redemption.

---

## ✨ Features

- **🎨 Retro Brutalist Aesthetic**: A unique, high-contrast user interface featuring glassmorphism, bold borders, retro typography, and playful micro-animations.
- **🔐 Role-Based Access Control**:
  - **Admin**: Full control over student records, manual edits, coupon generation, resending emails, unredeeming coupons, viewing comprehensive statistics, and bulk uploads.
  - **Organizer**: Read-only access to student lists with verification checks, and access to the QR scanner page for quick verification at the venue.
- **📋 Year-Wise Student Hub**: Organize and filter student lists by year groups (1st, 2nd, 3rd, and 4th Year) with dynamic sorting.
- **🚀 Bulk Import**: Upload student data instantly from CSV files with an interactive visual column mapping tool.
- **📊 Interactive Statistics & Realtime Updates**:
  - Breakdown of food preferences (Veg vs. Non-Veg).
  - Payment method stats (Online vs. Offline vs. Pending).
  - Registration count charts by academic year.
  - Real-time database updates via Appwrite WebSockets subscription.
- **🔍 QR Code Scanner**: Mobile-responsive scanner leveraging the camera to instantly check, validate, and mark food coupons as redeemed.
- **📧 Automated Mailer Service**: Integrated Google Apps Script that triggers customized emails with dynamically generated inline QR codes.

---

## 🗄️ Appwrite Database Schema

The application relies on two database collections within Appwrite: **Students** and **Food Coupons**. Below is the detailed schema required for both collections.

### 1. Students Collection (`STUDENTS_COLLECTION_ID`)
Stores the main registration and status details of all students.

| Attribute | Type | Required | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Yes | Name (e.g., `"Jane Doe"`) | Full name of the student. |
| `email` | String | Yes | Email address | Contact email for sending the food coupon QR code. |
| `roll` | String | Yes | Roll number (e.g., `"22CSE001"`) | Unique academic identifier. |
| `year` | String | Yes | `"1"`, `"2"`, `"3"`, `"4"` | The student's academic year group. |
| `food_preference` | String | Yes | `"veg"`, `"non-veg"` | Choice of meal. |
| `payment_method` | String | No (Nullable) | `"online"`, `"offline"`, `null` | Chosen method of payment. Null represents unpaid status. |
| `section` | String | No (Nullable) | Section name (e.g., `"A"`, `"B"`) | Academic division section. |
| `coupon_generated` | Boolean | No (Nullable) | `true`, `false`, `null` | Flag indicating if the food coupon email has been generated. |
| `coupon_redeemed` | Boolean | No (Nullable) | `true`, `false`, `null` | Flag indicating if the student has redeemed their food coupon. |

### 2. Food Coupon Collection (`FOOD_COUPON_COLLECTION_ID`)
Manages generated QR codes and validation tokens mapping back to student records.

| Attribute | Type | Required | Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | String | Yes | Document ID | Points to the `$id` of the student document in the Students collection. |
| `random_code` | String | Yes | 6-digit number string (e.g., `"654321"`) | Unique verification code generated alongside the coupon. |
| `created_at` | String | Yes | ISO 8601 Timestamp | Record creation timestamp. |
| `created_by` | String | Yes | Creator identifier (e.g., `"admin"`) | Who or what generated the coupon. |

---

## 🛠️ Project Setup & Installation

Follow these steps to set up the local environment, configure Appwrite, and deploy the Google Apps Script mailer.

### Prerequisites
- **Node.js** (v18.x or newer)
- **NPM**, **Yarn**, or **PNPM**
- An **Appwrite Cloud** account (or self-hosted Appwrite instance)
- A **Google Account** (for setting up the Google Apps Script Mailer Service)

---

### Step 1: Install Dependencies
Clone the repository, navigate to the root directory, and install the package dependencies:

```bash
npm install
```

---

### Step 2: Configure Environment Variables
Copy the template `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure the following variables:

```env
# Appwrite Credentials
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="Semicolon '26"
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# Database Configuration
NEXT_PUBLIC_DATABASE_ID=your_database_id
NEXT_PUBLIC_STUDENTS_COLLECTION_ID=your_students_collection_id
NEXT_PUBLIC_FOOD_COUPON_COLLECTION_ID=your_food_coupon_collection_id

# Mailer API Configuration
NEXT_PUBLIC_EMAIL_API_URL=your_google_apps_script_web_app_url
```

---

### Step 3: Configure Appwrite
1. Go to your **Appwrite Console** and create a new Web project.
2. Under **Databases**, create a new Database (copy its ID to `NEXT_PUBLIC_DATABASE_ID`).
3. Within the database, create the **Students** and **Food Coupon** collections using the schemas described above. Ensure all attribute names, types, and constraints are configured correctly.
4. Enable **Read** and **Write** permissions under collection settings. For student data, you may restrict roles or let all authenticated users with roles access them.
5. Under **Auth / Users**, create accounts for your administrators and organizers.
6. **Assign User Labels**:
   - Go to your Appwrite console under Auth -> Users -> Select User -> Labels.
   - Add label `admin` to grant administrative access.
   - Add label `organizer` to grant organizer access.

---

### Step 4: Setup Google Apps Script Mailer
The application relies on Google Apps Script as a microservice to send emails with inline QR codes via Gmail.

1. Navigate to [Google Apps Script](https://script.google.com/) and create a **New Project**.
2. Replace the code in `Code.gs` with the contents of the local file `scripts/code.gs`.
3. Add a new HTML file in the project, name it **`EmailTemplate`** (case-sensitive), and paste the contents of `scripts/EmailTemplate.html`.
4. Run the `testProcessCouponEmail` function to authorize your script and verify it runs successfully.
5. Deploy the script as a **Web App**:
   - **Execute as**: `Me` (your account).
   - **Who has access**: `Anyone` (this ensures the Next.js app can trigger the mailer without credentials).
6. Copy the **Web App URL** provided at the end of the deployment and set it as `NEXT_PUBLIC_EMAIL_API_URL` in your `.env.local` file.

*For detailed, step-by-step script setup instructions, refer to the [Google Apps Script Mailer Service Setup Guide](file:///e:/Coding%20and%20Programming/Playground/cse-farewell-app/scripts/README.md).*

---

### Step 5: Start the Development Server
Once environment variables are configured, start the server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Production Build
To build the application for deployment or production environments:

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
├── .github/             # GitHub workflow configs
├── public/              # Static assets (images, icons, posters)
├── scripts/             # Mailer Scripts & setup documentation
│   ├── code.gs          # Google Apps Script code
│   ├── EmailTemplate.html
│   └── README.md
├── src/
│   ├── components/      # React components grouped by feature
│   │   ├── BulkUploadData/
│   │   ├── Login/
│   │   ├── ScanQr/
│   │   ├── Students/
│   │   ├── auth/        # Auth Guard High Order Components
│   │   ├── retroui/     # Customized retro themed design system elements
│   │   └── ui/          # Generic UI primitives
│   ├── context/         # React Context for Global state (Auth, users, sessions)
│   ├── data/            # Static routes and rules configurations
│   ├── lib/             # Utility modules, styles configuration, and Appwrite client
│   └── pages/           # Next.js Pages and routes (stats, scan, login, profile, students)
├── package.json         # Project manifests and scripts
└── tsconfig.json        # TypeScript configuration
```

---

## 🔒 Security & Roles Definition

The app uses `withAuth` Higher-Order Component (`src/components/auth/AuthHOC.tsx`) to enforce page-level protection.
- **Admin Page Access (`stats`, `students/bulk_upload`)**: Only accessible by users having the `admin` label.
- **Organizer Page Access (`scan`, `/students/[year]`, `dashboard`)**: Accessible by users with either `admin` or `organizer` labels.
- **Login Redirects**: Unauthenticated users are redirected to `/login` automatically.

---

Made with ❤️ by the Saptarshi Chakraborty.
