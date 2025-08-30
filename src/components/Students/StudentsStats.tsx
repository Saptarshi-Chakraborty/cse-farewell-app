import { Student } from "@/lib/types";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { retroStyle } from "@/lib/styles";
import { useMemo } from "react";

type StudentsStatsProps = {
  students: Student[];
  loading: boolean;
};

const StudentsStats = ({ students, loading }: StudentsStatsProps) => {
  // Calculate stats internally based on the provided students
  const stats = useMemo(() => {
    return {
      vegCount: students.filter((s) => s.food_preference === "veg").length,
      nonVegCount: students.filter((s) => s.food_preference === "non-veg").length,
      paidCount: students.filter((s) => s.payment_method).length,
    };
  }, [students]);

  // Loading skeleton when no data is available yet
  if (loading && students.length === 0) {
    return (
      <Card className={`${retroStyle} p-4 block animate-pulse`}>
        <div className="flex justify-around items-center">
          <div className="space-y-1 text-center">
            <div className="h-6 w-10 bg-gray-300 rounded mx-auto" />
            <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="space-y-1 text-center">
            <div className="h-6 w-10 bg-gray-300 rounded mx-auto" />
            <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="space-y-1 text-center">
            <div className="h-6 w-12 bg-gray-300 rounded mx-auto" />
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </Card>
    );
  }

  // Only render actual stats when we have students
  if (students.length === 0) {
    return null;
  }

  return (
    <Card className={`${retroStyle} p-4 block`}>
      <div className="flex justify-around items-center">
        <div className="text-center">
          <Text as="h4" className="text-green-600">
            {stats.vegCount}
          </Text>
          <Text as="p">Veg</Text>
        </div>
        <div className="text-center">
          <Text as="h4" className="text-red-600">
            {stats.nonVegCount}
          </Text>
          <Text as="p">Non-Veg</Text>
        </div>
        <div className="text-center">
          <Text as="h4" className="text-blue-600">
            {stats.paidCount}
          </Text>
          <Text as="p">Paid Students</Text>
        </div>
      </div>
    </Card>
  );
};

export default StudentsStats;
