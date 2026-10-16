import DashboardLayout from "@/components/DashboardLayout";
import MembershipTable from "@/components/MembershipTable";

export const instant = false;

export default function SyndicateMembershipPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Global Membership Data</h2>
        <p className="text-gray-500">District-wide overview of all student statuses.</p>
      </div>
      <MembershipTable role="DISTRICT" />
    </DashboardLayout>
  );
}