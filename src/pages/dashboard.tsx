// /app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CircleDollarSign,
  Utensils,
  Beef,
  Milestone,
  ScanQrCode as QrCodeScanner,
  PlusCircle,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// --- Types and Initial Data ---

type Student = {
  id: number;
  name: string;
  roll: string;
  email: string;
  foodPref: 'Veg' | 'Non-Veg';
  paymentMode: 'Online' | 'Offline';
};

type Page = 'stats' | 'students' | 'scan';

const initialStudents: Student[] = [
  { id: 1, name: 'Amit Kumar', roll: 'CSE123', email: 'amit.k@example.com', foodPref: 'Veg', paymentMode: 'Online' },
  { id: 2, name: 'Priya Sharma', roll: 'CSE124', email: 'priya.s@example.com', foodPref: 'Non-Veg', paymentMode: 'Offline' },
  { id: 3, name: 'Rahul Singh', roll: 'CSE125', email: 'rahul.s@example.com', foodPref: 'Veg', paymentMode: 'Online' },
];

// --- Helper to replicate the retro style ---
const retroStyle = "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

// --- Main Component ---

export default function SemicolonAdminPage() {
  const [activePage, setActivePage] = useState<Page>('stats');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ name: string; food: string; status: string } | null>(null);

  // Effect to simulate QR scan when the scan page is opened
  useEffect(() => {
    if (activePage === 'scan') {
      setScanResult(null); // Reset on page view
      const timer = setTimeout(() => {
        setScanResult({
          name: "Student: Rohan Das",
          food: "Food: Veg",
          status: "Status: Valid Coupon"
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePage]);

  const handleDeleteStudent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'stats':
        return <StatsPage />;
      case 'students':
        return <StudentsPage students={students} onAddStudent={() => setIsModalOpen(true)} onDeleteStudent={handleDeleteStudent} />;
      case 'scan':
        return <ScanQrPage scanResult={scanResult} />;
      default:
        return <StatsPage />;
    }
  };

  return (
    // We use a custom font in a style tag to replicate the VT323 font from the original
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        body {
            font-family: 'VT323', monospace;
            background-color: #FDF6E3;
            color: #2A2A2A;
        }
      `}</style>
      <div className="p-4 md:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-4 border-black">
          <h1 className="text-4xl md:text-5xl mb-4 sm:mb-0">SEMICOLON '25</h1>
          <nav className="flex space-x-2">
            <Button variant={activePage === 'stats' ? 'default' : 'outline'} className={`${retroStyle} uppercase`} onClick={() => setActivePage('stats')}>Stats</Button>
            <Button variant={activePage === 'students' ? 'default' : 'outline'} className={`${retroStyle} uppercase`} onClick={() => setActivePage('students')}>Students</Button>
            <Button variant={activePage === 'scan' ? 'default' : 'outline'} className={`${retroStyle} uppercase`} onClick={() => setActivePage('scan')}>Scan QR</Button>
          </nav>
        </header>

        <main id="main-content">
          {renderContent()}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-600 pt-4 border-t-2 border-black">
          <p>© 2024 SEMICOLON '25 - CSE Department Farewell. All rights reserved.</p>
        </footer>

        <StudentDialog isOpen={isModalOpen} onOpenChange={setIsModalOpen} onSave={(newStudent) => {
          setStudents(prev => [...prev, { ...newStudent, id: Date.now() }]);
          setIsModalOpen(false);
        }} />
      </div>
    </>
  );
}

// --- Page Components ---

const StatsPage = () => (
  <section className="space-y-8">
    <h2 className="text-3xl border-b-2 border-black pb-2">Dashboard Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={retroStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Total Students</CardTitle>
          <Users className="h-6 w-6 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">150</div>
          <p className="text-sm text-gray-600">Registered for the event</p>
        </CardContent>
      </Card>
      <Card className={retroStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Paid Students</CardTitle>
          <CircleDollarSign className="h-6 w-6 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">125</div>
          <p className="text-sm text-green-600">83.3% paid</p>
        </CardContent>
      </Card>
      <Card className={retroStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Veg Food Pref.</CardTitle>
          <Utensils className="h-6 w-6 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">60</div>
          <p className="text-sm text-gray-600">40% of total</p>
        </CardContent>
      </Card>
      <Card className={retroStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Non-Veg Food Pref.</CardTitle>
          <Beef className="h-6 w-6 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">90</div>
          <p className="text-sm text-gray-600">60% of total</p>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={retroStyle}>
        <CardHeader>
          <CardTitle className="text-2xl">Payment Mode Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-base">
              <span>Online Payments</span>
              <span>95 students</span>
            </div>
            <Progress value={76} className="h-6 border-2 border-black" />
            <div className="text-right font-bold">76%</div>
          </div>
          <div>
            <div className="flex justify-between mb-1 text-base">
              <span>Offline Payments</span>
              <span>30 students</span>
            </div>
            <Progress value={24} className="h-6 border-2 border-black" />
            <div className="text-right font-bold">24%</div>
          </div>
        </CardContent>
      </Card>
      <Card className={retroStyle}>
        <CardHeader>
          <CardTitle className="text-2xl">Certificates Issued (4th Year)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Milestone className="h-16 w-16 text-yellow-500" />
            <div>
              <p className="text-4xl font-bold">35 <span className="text-lg">/ 40</span></p>
              <p className="text-sm text-gray-600">Digital certificates sent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);

const StudentsPage = ({ students, onAddStudent, onDeleteStudent }: { students: Student[], onAddStudent: () => void, onDeleteStudent: (id: number) => void }) => (
  <section className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl">4th Year Students List</h2>
      <Button className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`} onClick={onAddStudent}>
        <PlusCircle className="mr-2 h-5 w-5" /> Add Student
      </Button>
    </div>
    <Card className={retroStyle}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-lg text-black">Name</TableHead>
            <TableHead className="text-lg text-black">Roll No.</TableHead>
            <TableHead className="text-lg text-black">Email</TableHead>
            <TableHead className="text-lg text-black">Food Pref.</TableHead>
            <TableHead className="text-lg text-black">Payment</TableHead>
            <TableHead className="text-lg text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="text-base">{student.name}</TableCell>
              <TableCell className="text-base">{student.roll}</TableCell>
              <TableCell className="text-base">{student.email}</TableCell>
              <TableCell className="text-base">{student.foodPref}</TableCell>
              <TableCell className="text-base">{student.paymentMode}</TableCell>
              <TableCell className="space-x-1">
                <Button variant="outline" size="icon" className={retroStyle}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className={retroStyle} onClick={() => onDeleteStudent(student.id)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </section>
);

const ScanQrPage = ({ scanResult }: { scanResult: { name: string; food: string; status: string } | null }) => (
  <section className="text-center space-y-8">
    <h2 className="text-3xl">Scan Food Coupon QR Code</h2>
    <div className="flex flex-col items-center">
      <div className={`w-64 h-64 md:w-80 md:h-80 bg-gray-800 flex items-center justify-center mb-6 ${retroStyle}`}>
        <QrCodeScanner className="h-36 w-36 text-gray-500" />
      </div>
      <p className="text-lg">Point the camera at the student's QR code.</p>

      {scanResult ? (
        <div className={`mt-4 p-4 min-w-[300px] bg-white ${retroStyle}`}>
          <h3 className="text-xl mb-2">Scan Result:</h3>
          <p className="text-lg">{scanResult.name}</p>
          <p className="text-md">{scanResult.food}</p>
          <p className="text-md font-bold text-green-600">{scanResult.status}</p>
        </div>
      ) : (
        <div className={`mt-4 p-4 min-w-[300px] bg-white ${retroStyle}`}>
          <h3 className="text-xl mb-2">Scanning...</h3>
        </div>
      )}
    </div>
  </section>
);

// --- Dialog Component ---
const StudentDialog = ({ isOpen, onOpenChange, onSave }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (student: Omit<Student, 'id'>) => void }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent = {
      name: formData.get('student-name') as string,
      roll: formData.get('student-roll') as string,
      email: formData.get('student-email') as string,
      foodPref: formData.get('food-preference') as 'Veg' | 'Non-Veg',
      paymentMode: formData.get('payment-mode') as 'Online' | 'Offline',
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
            <Label htmlFor="student-name" className="text-base">Student Name:</Label>
            <Input id="student-name" name="student-name" required className={`${retroStyle}`} />
          </div>
          <div>
            <Label htmlFor="student-roll" className="text-base">Roll No.:</Label>
            <Input id="student-roll" name="student-roll" required className={`${retroStyle}`} />
          </div>
          <div>
            <Label htmlFor="student-email" className="text-base">Email:</Label>
            <Input id="student-email" name="student-email" type="email" required className={`${retroStyle}`} />
          </div>
          <div>
            <Label htmlFor="food-preference" className="text-base">Food Preference:</Label>
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
            <Label htmlFor="payment-mode" className="text-base">Payment Mode:</Label>
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
              <Button type="button" variant="outline" className={`${retroStyle} uppercase`}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className={`${retroStyle} uppercase bg-yellow-400 hover:bg-yellow-500`}>Save Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
};