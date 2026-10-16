// src/components/MembershipTable.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Phone, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  School, 
  CheckSquare, 
  Square,
  Smartphone,
  ExternalLink
} from "lucide-react";

export default function MembershipTable({ role }: { role: "DISTRICT" | "DIVISION" }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [division, setDivision] = useState("");
  const [campus, setCampus] = useState("");
  const [isCalled, setIsCalled] = useState("");
  const [status, setStatus] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "50",
      ...(division && { division }),
      ...(campus && { campus }),
      ...(isCalled && { isCalled }),
      ...(status && { profsummitStatus: status }),
    });

    const res = await fetch(`/api/students?${query}`);
    const data = await res.json();
    setStudents(data.data || []);
    setTotalPages(data.meta?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [page, division, campus, isCalled, status]);

  const updateStudent = async (id: string, updates: any) => {
    // Optimistic UI update
    setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));
    await fetch("/api/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
  };

  const copyNumber = (mobile: string) => {
    navigator.clipboard.writeText(mobile);
    alert(`Copied: ${mobile}`);
  };

  const exportToExcel = () => {
    // Basic CSV export
    const headers = ["Name,Mobile,Campus,Division,Type,Called,Registered,Status"];
    const rows = students.map(s => 
      `"${s.name}","${s.mobile}","${s.campus}","${s.division}","${s.type}",${s.isCalled},${s.isRegistered},${s.profsummitStatus}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Filters and Export */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-violet-50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {role === "DISTRICT" && (
            <input 
              type="text" 
              placeholder="Filter by Division" 
              value={division} 
              onChange={(e) => { setDivision(e.target.value); setPage(1); }} 
              className="px-3 py-2 border border-violet-100 bg-white text-gray-700 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          )}
          <input 
            type="text" 
            placeholder="Filter by Campus" 
            value={campus} 
            onChange={(e) => { setCampus(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-violet-100 bg-white text-gray-700 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <select 
            value={isCalled} 
            onChange={(e) => { setIsCalled(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-violet-100 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">Call Status: All</option>
            <option value="true">Called</option>
            <option value="false">Not Called</option>
          </select>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-violet-100 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">Summit Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="FROM_CAMPUS">From Campus</option>
            <option value="FROM_NATIVE">From Native</option>
          </select>
        </div>
        <button 
          onClick={exportToExcel} 
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
        >
          <Download size={16} /> Export View
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading datasets...</div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm border border-violet-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-50/50 text-blue-900 border-b border-violet-100">
                <tr>
                  <th className="p-4 font-semibold text-sm">Name & Mobile</th>
                  <th className="p-4 font-semibold text-sm">Campus & Div</th>
                  <th className="p-4 font-semibold text-sm">Actions</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-violet-50/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-blue-950">{student.name}</div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <Smartphone size={13} className="text-blue-500 shrink-0" />
                        <span>{student.mobile}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-gray-800">
                        <School size={14} className="text-violet-500 shrink-0" />
                        <span>{student.campus}</span>
                      </div>
                      <div className="text-xs text-violet-600 bg-violet-50 inline-block px-2.5 py-0.5 rounded-full mt-1.5 font-medium">
                        {student.division}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a href={`tel:${student.mobile}`} title="Call Now" className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"><Phone size={16} /></a>
                        <button onClick={() => copyNumber(student.mobile)} title="Copy Number" className="p-2 bg-slate-50 text-gray-600 rounded-lg hover:bg-slate-100 transition"><Copy size={16} /></button>
                        <button 
                          onClick={() => updateStudent(student.id, { isCalled: !student.isCalled })} 
                          title="Toggle Called Status"
                          className={`p-2 rounded-lg transition-all ${student.isCalled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-gray-600 border border-transparent hover:bg-slate-100'}`}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 max-w-xs">
                        <button 
                          onClick={() => updateStudent(student.id, { isRegistered: !student.isRegistered })}
                          className={`flex items-center gap-2 text-xs font-semibold py-1 px-2.5 rounded-lg border text-left transition-all ${student.isRegistered ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-transparent text-gray-600 hover:bg-slate-100'}`}
                        >
                          {student.isRegistered ? <CheckSquare size={14} className="text-emerald-600" /> : <Square size={14} className="text-gray-400" />}
                          Registered
                        </button>
                        
                        <select 
                          value={student.profsummitStatus} 
                          onChange={(e) => updateStudent(student.id, { profsummitStatus: e.target.value })} 
                          className="text-xs border border-violet-100 bg-white rounded-lg p-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="FROM_CAMPUS">From Campus</option>
                          <option value="FROM_NATIVE">From Native</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Optimized for handheld interfaces) */}
          <div className="md:hidden space-y-4">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-violet-50 space-y-4 hover:border-violet-100 transition-colors"
              >
                {/* Header: Name and Label badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-blue-950 leading-snug">{student.name}</h3>
                    <span className="inline-block text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                      {student.division}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {student.type}
                  </span>
                </div>
                
                {/* Visual Metadata Fields */}
                <div className="space-y-2.5">
                  {/* Phone Row */}
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <Smartphone size={15} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-700">{student.mobile}</span>
                    </div>
                  </div>

                  {/* Campus Row */}
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600 shrink-0">
                      <School size={15} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 leading-tight">{student.campus}</span>
                  </div>
                </div>
                
                {/* Call-to-actions row */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <a 
                    href={`tel:${student.mobile}`} 
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all active:scale-95"
                  >
                    <Phone size={15} /> Call
                  </a>
                  <button 
                    onClick={() => copyNumber(student.mobile)} 
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-gray-700 font-bold rounded-xl text-sm transition-all hover:bg-slate-200 active:scale-95"
                  >
                    <Copy size={15} /> Copy
                  </button>
                  <button 
                    onClick={() => updateStudent(student.id, { isCalled: !student.isCalled })} 
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                      student.isCalled 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-slate-50 border-transparent text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    <Check size={15} /> {student.isCalled ? "Called" : "Call"}
                  </button>
                </div>

                {/* Sub-actions (Register and Summit Mode) */}
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => updateStudent(student.id, { isRegistered: !student.isRegistered })}
                    className={`flex items-center gap-2.5 text-sm font-bold p-3 rounded-xl border transition-all ${
                      student.isRegistered 
                        ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                        : 'bg-slate-50 border-transparent text-gray-600'
                    }`}
                  >
                    {student.isRegistered ? <CheckSquare size={18} className="text-emerald-600" /> : <Square size={18} className="text-gray-400" />}
                    Registered for Profsummit
                  </button>
                  
                  <div className="relative">
                    <select 
                      value={student.profsummitStatus} 
                      onChange={(e) => updateStudent(student.id, { profsummitStatus: e.target.value })} 
                      className="w-full p-3 border border-violet-100 rounded-xl text-sm font-semibold text-gray-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    >
                      <option value="PENDING">Status: Pending</option>
                      <option value="FROM_CAMPUS">Attending: From Campus</option>
                      <option value="FROM_NATIVE">Attending: From Native</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-violet-50">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-4 py-2 border border-violet-100 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 transition"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs md:text-sm font-bold text-gray-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-violet-100">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="px-4 py-2 border border-violet-100 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}