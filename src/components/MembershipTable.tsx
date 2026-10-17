// src/components/MembershipTable.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Phone, Copy, Check, ChevronLeft, ChevronRight, 
  Download, School, CheckSquare, Square, Smartphone, Loader2, Search
} from "lucide-react";

export default function MembershipTable({ role }: { role: "DISTRICT" | "DIVISION" }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  // Global Search State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Dropdown Options State
  const [options, setOptions] = useState({ divisions: [], campuses: [] });

  // Filters
  const [division, setDivision] = useState("");
  const [campus, setCampus] = useState("");
  const [isCalled, setIsCalled] = useState("");
  const [status, setStatus] = useState("");

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      const res = await fetch("/api/students/options");
      const data = await res.json();
      if (data.campuses) setOptions(data);
    };
    fetchOptions();
  }, []);

  // Debounce the search input so it doesn't spam the API on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Go back to page 1 on a new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch the actual table data
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(division && { division }),
        ...(campus && { campus }),
        ...(isCalled && { isCalled }),
        ...(status && { profsummitStatus: status }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await fetch(`/api/students?${query}`);
      const data = await res.json();
      setStudents(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalMembers(data.meta?.total || 0);
      setLoading(false);
    };

    fetchStudents();
  }, [page, division, campus, isCalled, status, debouncedSearch]);

  const updateStudent = async (id: string, updates: any) => {
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

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const query = new URLSearchParams({
        export: "true",
        ...(division && { division }),
        ...(campus && { campus }),
        ...(isCalled && { isCalled }),
        ...(status && { profsummitStatus: status }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await fetch(`/api/students?${query}`);
      const data = await res.json();
      const allStudents = data.data || [];

      const headers = ["Sl No,Name,Mobile,Campus,Division,Type,Called,Registered,Status"];
      const rows = allStudents.map((s: any, index: number) => 
        `${index + 1},"${s.name}","${s.mobile}","${s.campus}","${s.division}","${s.type}",${s.isCalled},${s.isRegistered},${s.profsummitStatus}`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SSF_Membership_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export data");
    }
    setExporting(false);
  };

  // Dynamically filter available campuses based on the selected division
  const filteredCampuses = options.campuses
    .filter((c: any) => division ? c.division === division : true)
    .map((c: any) => c.campus)
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-violet-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        {/* Mobile Top / PC Right: Search Bar & Export Button */}
        <div className="flex flex-row gap-3 w-full md:w-auto order-1 md:order-2 justify-between md:justify-end">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name/Mobile number/Campus/Division..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 border border-violet-100 bg-white text-gray-700 placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
          </div>
          <button 
            onClick={exportToExcel} 
            disabled={exporting}
            className="flex shrink-0 items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow disabled:opacity-75 disabled:cursor-wait"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden sm:inline">{exporting ? "Exporting..." : "Export View"}</span>
            <span className="sm:hidden">{exporting ? "..." : "Export"}</span>
          </button>
        </div>

        {/* Mobile Bottom / PC Left: Dynamic Dropdown Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto order-2 md:order-1">
          {role === "DISTRICT" && (
            <select 
              value={division} 
              onChange={(e) => { setDivision(e.target.value); setCampus(""); setPage(1); }} 
              className="px-3 py-2 border border-violet-100 bg-white text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px] truncate"
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
            className="px-3 py-2 border border-violet-100 bg-white text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px] truncate"
          >
            <option value="">All Campuses</option>
            {filteredCampuses.map((camp: string) => (
              <option key={camp} value={camp}>{camp}</option>
            ))}
          </select>
          
          <select 
            value={isCalled} 
            onChange={(e) => { setIsCalled(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-violet-100 bg-white text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Call Status: All</option>
            <option value="true">Called</option>
            <option value="false">Not Called</option>
          </select>
          
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
            className="px-3 py-2 border border-violet-100 bg-white text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Summit Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="FROM_CAMPUS">From Campus</option>
            <option value="FROM_NATIVE">From Native</option>
          </select>
        </div>

      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Searching datasets...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-2xl border border-violet-50">No students found matching your criteria.</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm border border-violet-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-50/50 text-blue-900 border-b border-violet-100">
                <tr>
                  <th className="p-4 font-semibold text-sm w-12 text-center">#</th>
                  <th className="p-4 font-semibold text-sm">Name & Mobile</th>
                  <th className="p-4 font-semibold text-sm">Campus & Div</th>
                  <th className="p-4 font-semibold text-sm">Actions</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-violet-50/20 transition-colors">
                    <td className="p-4 text-center font-bold text-violet-400 text-sm">
                      {(page - 1) * 50 + index + 1}
                    </td>
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
                        <button onClick={() => updateStudent(student.id, { isCalled: !student.isCalled })} title="Toggle Called Status" className={`p-2 rounded-lg transition-all ${student.isCalled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-gray-600 border border-transparent hover:bg-slate-100'}`}><Check size={16} /></button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 max-w-xs">
                        <button onClick={() => updateStudent(student.id, { isRegistered: !student.isRegistered })} className={`flex items-center gap-2 text-xs font-semibold py-1 px-2.5 rounded-lg border text-left transition-all ${student.isRegistered ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-transparent text-gray-600 hover:bg-slate-100'}`}>
                          {student.isRegistered ? <CheckSquare size={14} className="text-emerald-600" /> : <Square size={14} className="text-gray-400" />} Registered
                        </button>
                        <select value={student.profsummitStatus} onChange={(e) => updateStudent(student.id, { profsummitStatus: e.target.value })} className="text-xs border border-violet-100 bg-white rounded-lg p-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {students.map((student, index) => (
              <div key={student.id} className="bg-white p-5 rounded-2xl shadow-sm border border-violet-50 space-y-4 hover:border-violet-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-blue-950 leading-snug">
                      <span className="text-violet-500 mr-2">#{(page - 1) * 50 + index + 1}</span>
                      {student.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                      {student.division}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {student.type}
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0"><Smartphone size={15} /></div>
                    <span className="text-sm font-semibold text-gray-700">{student.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600 shrink-0"><School size={15} /></div>
                    <span className="text-sm font-medium text-gray-600 leading-tight">{student.campus}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <a href={`tel:${student.mobile}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl shadow-sm text-sm active:scale-95"><Phone size={15} /> Call</a>
                  <button onClick={() => copyNumber(student.mobile)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-slate-200 active:scale-95"><Copy size={15} /> Copy</button>
                  <button onClick={() => updateStudent(student.id, { isCalled: !student.isCalled })} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold active:scale-95 border ${student.isCalled ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-transparent text-gray-600 hover:bg-slate-100'}`}><Check size={15} /> {student.isCalled ? "Called" : "Call"}</button>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button onClick={() => updateStudent(student.id, { isRegistered: !student.isRegistered })} className={`flex items-center gap-2.5 text-sm font-bold p-3 rounded-xl border transition-all ${student.isRegistered ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-transparent text-gray-600'}`}>{student.isRegistered ? <CheckSquare size={18} className="text-emerald-600" /> : <Square size={18} className="text-gray-400" />} Registered for Profsummit</button>
                  <div className="relative">
                    <select value={student.profsummitStatus} onChange={(e) => updateStudent(student.id, { profsummitStatus: e.target.value })} className="w-full p-3 border border-violet-100 rounded-xl text-sm font-semibold text-gray-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                      <option value="PENDING">Status: Pending</option>
                      <option value="FROM_CAMPUS">Attending: From Campus</option>
                      <option value="FROM_NATIVE">Attending: From Native</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px]">▼</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgraded Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-violet-50">
            <div className="text-sm font-bold text-blue-950 w-full md:w-auto text-center md:text-left">
              Total <span className="text-violet-600 px-1">{totalMembers}</span> Filtered Members
            </div>

            <div className="text-xs md:text-sm font-semibold text-gray-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-violet-100">
              Showing {totalMembers === 0 ? 0 : (page - 1) * 50 + 1} to {Math.min(page * 50, totalMembers)} of {totalMembers}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="px-4 py-2 border border-violet-100 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 transition"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-xs md:text-sm font-bold text-gray-600">
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
          </div>
        </>
      )}
    </div>
  );
}