// src/components/TemplateEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, MessageSquare, Info } from "lucide-react";

export default function TemplateEditor() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      const res = await fetch("/api/template");
      const data = await res.json();
      if (data.content) setContent(data.content);
      setLoading(false);
    };
    fetchTemplate();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    await fetch("/api/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 animate-pulse">Loading template...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-blue-950 flex items-center gap-2">
              <MessageSquare size={20} className="text-violet-600" />
              WhatsApp Message Template
            </h3>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-75"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
          
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg border border-emerald-100">
              Message template saved successfully!
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] p-4 bg-slate-50 border border-violet-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none leading-relaxed"
            placeholder="Type your message template here..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-sm text-blue-900">
          <h4 className="font-bold text-base flex items-center gap-2 mb-3">
            <Info size={18} /> Dynamic Variables
          </h4>
          <p className="mb-4 text-blue-800/80 leading-relaxed">
            Use these exact variables (including the brackets) in your message. They will automatically be replaced with the student and division data before sending.
          </p>
          <ul className="space-y-3 font-mono text-xs">
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{name}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Student's Name</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{ameer name}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Mapped from busData.ts</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                <span className="font-bold text-violet-600">{`{ameer number}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Mapped from busData.ts</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{bus coordinator name}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Mapped from busData.ts</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{bus coordinator number}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Mapped from busData.ts</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{bus code}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Mapped from busData.ts</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <span className="font-bold text-violet-600">{`{division}`}</span> <br/><span className="text-gray-500 font-sans mt-1 inline-block">Student's Division Name</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}