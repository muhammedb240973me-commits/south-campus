// src/components/ProfsummitTable.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { busConfig } from "@/lib/busData";

export default function ProfsummitTable({ role }: { role: "DISTRICT" | "DIVISION" }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateStr, setTemplateStr] = useState("");
  
  // Pagination & Metadata
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [messageStatus, setMessageStatus] = useState("");
  const [analytics, setAnalytics] = useState({ sent: 0, total: 0 });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [division, setDivision] = useState("");
  const [campus, setCampus] = useState("");
  const [options, setOptions] = useState({ divisions: [], campuses: [] });

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await fetch("/api/profsummit/options");
      const data = await res.json();
      if (data.campuses) setOptions(data);
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(division && { division }),
        ...(campus && { campus }),
        ...(messageStatus && { isMessageSent: messageStatus }), // Add this line
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      
      const [studentsRes, templateRes] = await Promise.all([
        fetch(`/api/profsummit?${query}`),
        fetch("/api/template")
      ]);

      const studentsData = await studentsRes.json();
      const templateData = await templateRes.json();

      setStudents(studentsData.data || []);
      setTotalPages(studentsData.meta?.totalPages || 1);
      setTotalMembers(studentsData.meta?.total || 0);
      
      // Add this line to update the analytics banner
      setAnalytics({ 
        sent: studentsData.meta?.totalSent || 0, 
        total: studentsData.meta?.totalBase || 0 
      });
      
      if (templateData.content) setTemplateStr(templateData.content);
      
      setLoading(false);
    };
    fetchData();
  }, [page, division, campus, messageStatus, debouncedSearch]); // Add messageStatus to dependency array

  const updateMessageStatus = async (id: string, isMessageSent: boolean) => {
    setStudents(students.map(s => s.id === id ? { ...s, isMessageSent } : s));
    await fetch("/api/profsummit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isMessageSent }),
    });
  };

  const handleWhatsApp = (student: any) => {
    const normalizedDiv = student.division.trim().toLowerCase();
    const matchedKey = Object.keys(busConfig).find(
      key => key.toLowerCase() === normalizedDiv
    );
    const divisionData = matchedKey 
      ? busConfig[matchedKey] 
      : { code: "TBA", coordName: "TBA", coordPhone: "TBA" };
    
    const message = templateStr
      .replace(/{name}/g, student.name)
      .replace(/{bus coordinator name}/g, divisionData.coordName)
      .replace(/{bus coordinator number}/g, divisionData.coordPhone)
      .replace(/{bus code}/g, divisionData.code)
      .replace(/{division}/g, student.division);
    
    let cleanMobile = student.mobile.replace(/\D/g, "");
    if (cleanMobile.length === 10) cleanMobile = `91${cleanMobile}`;

    window.open(`https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`, "_blank");
    updateMessageStatus(student.id, true);
  };

  const filteredCampuses = options.campuses
    .filter((c: any) => division ? c.division === division : true)
    .map((c: any) => c.campus)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        {/* Analytics Header */}
        <div className="flex flex-col order-3 md:order-1 w-full md:w-auto">
          <div className="text-emerald-800 font-extrabold text-sm md:text-base flex items-center gap-2">
            <MessageCircle size={18} className="text-emerald-500" />
            {analytics.sent} of {analytics.total} Messages Sent
          </div>
          <div className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mt-0.5">
            Active Filter: {totalMembers} Attendees
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto order-2">
          {role === "DISTRICT" && (
            <select 
              value={division} 
              onChange={(e) => { setDivision(e.target.value); setCampus(""); setPage(1); }} 
              className="px-3 py-2 border border-emerald-100 bg-emerald-50/30 text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[130px] truncate"
            >
              <option value="">All Divisions</option>
              {options.divisions.map((div: string) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          )}
          
          <select 
            value={campus} 
            onChange={(e) => { setCampus(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-emerald-100 bg-emerald-50/30 text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[130px] truncate"
          >
            <option value="">All Campuses</option>
            {filteredCampuses.map((camp: string) => (
              <option key={camp} value={camp}>{camp}</option>
            ))}
          </select>

          {/* NEW MESSAGE STATUS FILTER */}
          <select 
            value={messageStatus} 
            onChange={(e) => { setMessageStatus(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-emerald-100 bg-emerald-50/30 text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[130px]"
          >
            <option value="">All Messages</option>
            <option value="true">Sent Only</option>
            <option value="false">Pending Only</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-56 order-1 md:order-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search attendees..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 border border-emerald-100 bg-white text-gray-700 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-emerald-600 font-medium animate-pulse flex justify-center items-center gap-2">
          <Loader2 className="animate-spin" /> Loading registrations...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-2xl border border-emerald-50">
          No registered attendees found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, index) => {
            const normalizedDiv = student.division.trim().toLowerCase();
            const matchedKey = Object.keys(busConfig).find(key => key.toLowerCase() === normalizedDiv);
            const busInfo = matchedKey ? busConfig[matchedKey] : { code: "TBA" };
            
            return (
              <div key={student.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-colors ${student.isMessageSent ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100 hover:border-emerald-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-blue-950 leading-tight">
                      <span className="text-emerald-500 mr-2">#{(page - 1) * 50 + index + 1}</span>
                      {student.name}
                    </h3>
                    <div className="text-xs font-semibold text-gray-500 mt-1">{student.campus}</div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                    {busInfo.code}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleWhatsApp(student)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle size={16} /> Share Info
                  </button>
                  
                  <button 
                    onClick={() => updateMessageStatus(student.id, !student.isMessageSent)} 
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 border ${student.isMessageSent ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-transparent text-gray-500 hover:bg-slate-100'}`}
                  >
                    <Check size={16} /> {student.isMessageSent ? "Sent" : "Pending"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && students.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-emerald-50 mt-4">
          <div className="text-sm font-bold text-emerald-950 w-full md:w-auto text-center md:text-left">
            Total <span className="text-emerald-600 px-1">{totalMembers}</span> Attendees
          </div>

          <div className="text-xs md:text-sm font-semibold text-gray-500 bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100">
            Showing {totalMembers === 0 ? 0 : (page - 1) * 50 + 1} to {Math.min(page * 50, totalMembers)} of {totalMembers}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-4 py-2 border border-emerald-100 bg-white rounded-lg hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 transition"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs md:text-sm font-bold text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="px-4 py-2 border border-emerald-100 bg-white rounded-lg hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}