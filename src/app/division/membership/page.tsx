// src/app/division/membership/page.tsx
import DashboardLayout from "@/components/DashboardLayout";
import MembershipTable from "@/components/MembershipTable";

export default function DivisionMembershipPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">
          Membership Data
        </h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Manage your division's student database and update statuses for Profsummit'26.
        </p>
      </div>
      
      {/* 
        This renders the complex table we built earlier. 
        Passing role="DIVISION" ensures it hides the Division filter input.
      */}
      <MembershipTable role="DIVISION" />
    </DashboardLayout>
  );
}