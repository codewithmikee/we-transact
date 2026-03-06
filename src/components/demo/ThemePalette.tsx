import { Badge } from "@/components/ui/Badge";

export function ThemePalette() {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Theme Palette:</span>
      <div className="flex gap-2">
        <Badge variant="default" className="bg-indigo-600 ring-2 ring-indigo-200 ring-offset-2">Brand (Indigo)</Badge>
        <Badge variant="secondary" className="bg-slate-800 text-white">Neutral (Slate)</Badge>
        <Badge variant="success" className="bg-emerald-600 text-white">Accent (Emerald)</Badge>
      </div>
    </div>
  );
}
