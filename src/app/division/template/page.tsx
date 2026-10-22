import DashboardLayout from "@/components/DashboardLayout";
import TemplateEditor from "@/components/TemplateEditor";

export const instant = false;

export default function DivisionTemplatePage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">Text to Send</h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Configure the default WhatsApp message for Profsummit attendees.</p>
      </div>
      <TemplateEditor />
    </DashboardLayout>
  );
}