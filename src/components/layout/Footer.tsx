"use client";

import { Mail, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-24 py-12">
      <div className="max-w-screen-2xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">C</div>
          <span className="font-bold text-slate-900">ComponentLib</span>
        </div>
        <p className="text-sm text-slate-400">© 2024 ComponentLib UI System. Built with Next.js and Tailwind CSS.</p>
        <div className="flex justify-center gap-6 mt-6">
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink className="w-4 h-4" /></a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Mail className="w-4 h-4" /></a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Lock className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
}
