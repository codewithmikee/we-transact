"use client";

import { Toggle } from "@/components/ui/Toggle";
import * as React from "react";

export function FormElements() {
  const [isToggled, setIsToggled] = React.useState(true);
  
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <input type="checkbox" id="check1" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1" />
        <label htmlFor="check1" className="text-sm text-slate-600">Checkbox item with a label. Provides a multi-select capability.</label>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input type="radio" id="r1" name="radio-grp" className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="r1" className="text-sm text-slate-600">Option A</label>
        </div>
        <div className="flex items-center gap-3">
          <input type="radio" id="r2" name="radio-grp" className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="r2" className="text-sm text-slate-600">Option B</label>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
        <span className="text-sm font-medium text-slate-700">Toggle Feature</span>
        <Toggle checked={isToggled} onChange={setIsToggled} />
      </div>
    </div>
  );
}
