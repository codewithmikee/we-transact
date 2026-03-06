"use client";

import * as React from "react";
import { 
  Menu, 
  X,
  LayoutDashboard, 
  Building2,
  Users,
  Banknote
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { NotificationBell } from "./NotificationBell";
import { ProfilePopover } from "./ProfilePopover";
import { DynamicSidebar } from "./DynamicSidebar";
import { SYSTEM_ADMIN_NAV_ITEMS } from "@/lib/nav-configs/nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  Users,
  Banknote,
};

export function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <AppLogo />
          <nav className="hidden lg:flex items-center gap-1">
            {SYSTEM_ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.link || pathname.startsWith(item.link + "/");
              const Icon = item.icon ? IconMap[item.icon] : null;

              return (
                <Link
                  key={item.link}
                  href={item.link}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />}
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />
          <ProfilePopover role="System Admin" />
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar only for mobile/tablet in System Admin view, as desktop has nav in header */}
        <DynamicSidebar 
          items={SYSTEM_ADMIN_NAV_ITEMS} 
          className="lg:hidden" 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 md:p-8 lg:p-12 min-w-0 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
