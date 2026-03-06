"use client";

import * as React from "react";

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 h-[calc(100vh-64px)] sticky top-16 border-r border-slate-200 p-6 overflow-y-auto">
      <div className="space-y-8">
        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Foundation</h5>
          <nav className="flex flex-col gap-1">
            <a href="#typography" className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700">Typography</a>
            <a href="#buttons" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Buttons</a>
            <a href="#forms" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Forms</a>
          </nav>
        </div>
        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation & Feedback</h5>
          <nav className="flex flex-col gap-1">
            <a href="#navigation" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Nav Components</a>
            <a href="#loaders" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Loaders</a>
          </nav>
        </div>
        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Application UI</h5>
          <nav className="flex flex-col gap-1">
            <a href="#cards" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cards & Layouts</a>
          </nav>
        </div>
      </div>
    </aside>
  );
}
