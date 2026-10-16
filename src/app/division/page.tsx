// src/app/division/page.tsx
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowRight, PhoneCall, CheckCircle, GraduationCap, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { connection } from "next/server"; // <-- New import
import prisma from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const instant = false;

export default async function DivisionDashboard() {
  // Explicitly tell Next.js to render this dynamically at request time
  await connection();
  const session = await getServerSession(authOptions);
  const divisionName = session?.user?.divisionName || "";

  // Run all database queries in parallel for maximum speed
  const [totalStudents, calledCount, registeredCount, campusCount] = await Promise.all([
    prisma.student.count({ where: { division: divisionName } }),
    prisma.student.count({ where: { division: divisionName, isCalled: true } }),
    prisma.student.count({ where: { division: divisionName, isRegistered: true } }),
    prisma.student.count({ where: { division: divisionName, profsummitStatus: "FROM_CAMPUS" } }),
  ]);

  const completionPercentage = totalStudents > 0 ? Math.round((calledCount / totalStudents) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Main Call to Action */}
        <div className="bg-gradient-to-r from-blue-700 to-violet-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ready for Profsummit'26?</h2>
            <p className="text-blue-100">Start contacting students in {divisionName} and update their status instantly.</p>
          </div>
          <Link 
            href="/division/membership"
            className="group flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-md"
          >
            Call to Profsummit'26
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Real-time Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={totalStudents} subtitle={`In ${divisionName}`} icon={<Users className="text-blue-500" />} />
          <StatCard title="Called" value={calledCount} subtitle={`${completionPercentage}% completion`} icon={<PhoneCall className="text-violet-500" />} />
          <StatCard title="Registered" value={registeredCount} subtitle="For Profsummit" icon={<CheckCircle className="text-emerald-500" />} />
          <StatCard title="From Campus" value={campusCount} subtitle="Attending from campus" icon={<GraduationCap className="text-amber-500" />} />
        </div>

      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-50 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-blue-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}