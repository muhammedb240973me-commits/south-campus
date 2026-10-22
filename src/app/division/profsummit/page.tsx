import DashboardLayout from "@/components/DashboardLayout";
import ProfsummitTable from "@/components/ProfsummitTable";

export const instant = false;

export default function DivisionProfsummitPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">Profsummit Registration</h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Manage registered attendees and coordinate transport communication.</p>
      </div>
      <ProfsummitTable role="DIVISION" />
    </DashboardLayout>
  );
}