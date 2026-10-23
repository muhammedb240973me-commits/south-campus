// src/app/syndicate/page.tsx
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowRight, PhoneCall, CheckCircle, GraduationCap, Users, MessageCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { connection } from "next/server"; // <-- New import
import prisma from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const instant = false;

export default async function SyndicateDashboard() {
  // Explicitly tell Next.js to render this dynamically at request time
  await connection();
  await getServerSession(authOptions);

  // Global queries (no division filter)
  const [totalStudents, calledCount, registeredCount, campusCount] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isCalled: true } }),
    prisma.student.count({ where: { isRegistered: true } }),
    prisma.student.count({ where: { profsummitStatus: "FROM_CAMPUS" } }),
  ]);

  // Fetch Profsummit Analytics
  // Fetch Profsummit Analytics (District Global)
  const totalProfsummit = await prisma.profsummitStudent.count();
  
  const sentProfsummit = await prisma.profsummitStudent.count({
    where: { 
      isMessageSent: true 
    }
  });
  

  const completionPercentage = totalStudents > 0 ? Math.round((calledCount / totalStudents) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Main Call to Action */}
        <div className="bg-gradient-to-r from-blue-700 to-violet-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">District Overview</h2>
            <p className="text-blue-100">Access the global master database for all 10 divisions.</p>
          </div>
          <Link 
            href="/syndicate/membership"
            className="group flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-md"
          >
            Open Master Database
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Global Real-time Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={totalStudents} subtitle="Across all divisions" icon={<Users className="text-blue-500" />} />
          <StatCard title="Total Called" value={calledCount} subtitle={`${completionPercentage}% district completion`} icon={<PhoneCall className="text-violet-500" />} />
          <StatCard title="Total Registered" value={registeredCount} subtitle="For Profsummit" icon={<CheckCircle className="text-emerald-500" />} />
          <StatCard title="From Campus" value={campusCount} subtitle="Attending from campus" icon={<GraduationCap className="text-amber-500" />} />
        </div>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-gray-500 text-sm font-semibold mb-1 tracking-wide">Profsummit Messages</h3>
          <div className="text-2xl font-extrabold text-blue-950">
            {sentProfsummit} <span className="text-sm font-medium text-gray-400">/ {totalProfsummit} Sent</span>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          {/* Make sure MessageCircle is imported from lucide-react at the top of the file */}
          <MessageCircle size={24} />
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