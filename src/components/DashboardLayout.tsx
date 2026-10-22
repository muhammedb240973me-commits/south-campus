// src/components/DashboardLayout.tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, LogOut, Tent, Ticket, Calendar, MessageSquare } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determine routing and display names dynamically based on user role
  const basePath = session?.user?.role === "DISTRICT" ? "/syndicate" : "/division";
  const displayName = session?.user?.role === "DISTRICT" ? "Syndicate" : session?.user?.divisionName;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-blue-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Width decreased to w-56 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-violet-100 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Mobile Header for Sidebar - Height decreased */}
        <div className="h-14 flex items-center justify-between px-4 md:hidden border-b border-violet-100">
          <span className="font-bold text-blue-900 text-sm">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-4 overflow-y-auto">
          {/* Nav links font sizes, icons, and padding decreased */}
          <nav className="flex-1 px-3 space-y-1">
            <Link 
              href={basePath} 
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${pathname === basePath ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              href={`${basePath}/membership`} 
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${pathname.includes("/membership") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"}`}
            >
              <Users size={18} /> Membership Data
            </Link>
            <Link 
              href={`${basePath}/profsummit`} 
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${pathname.includes("/profsummit") ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
            >
              <Tent size={18} /> Profsummit Data
            </Link>
            <Link 
              href={`${basePath}/template`} 
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${pathname.includes("/template") ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"}`}
            >
              <MessageSquare size={18} /> Text to Send
            </Link>
          </nav>
          
          <div className="p-3 border-t border-gray-100 mt-auto">
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Window */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header - Height decreased to h-14 */}
        <header className="bg-white border-b border-violet-100 shadow-sm px-4 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="p-1.5 -ml-1 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Logo and Titles - Adjusted font sizes */}
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="Logo" className="w-8 h-8 object-contain hidden sm:block" />
              <div className="leading-tight">
                <h1 className="font-bold text-blue-900 text-base">Campus Syndicate</h1>
                <p className="text-[10px] md:text-xs font-semibold text-violet-600">SSF Kozhikode South</p>
              </div>
            </div>
          </div>

          {/* User Profile Info - Adjusted font sizes */}
          <div className="text-right border-l border-gray-200 pl-3">
            <div className="font-bold text-blue-900 text-sm capitalize">
              {displayName}
            </div>
            <div className="text-[10px] font-medium text-violet-500 uppercase tracking-wider mt-0.5">
              {session?.user?.role}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}