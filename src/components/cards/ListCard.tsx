import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface ListItem {
  title: string;
  sub: string;
  amount: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface ListCardProps {
  title: string;
  items: ListItem[];
}

export function ListCard({ title, items }: ListCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <div className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <div key={i} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", item.bg, item.color)}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">{item.amount}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
