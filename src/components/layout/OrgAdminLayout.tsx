"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { NotificationBell } from "./NotificationBell";
import { ProfilePopover } from "./ProfilePopover";
import { DynamicSidebar } from "./DynamicSidebar";
import { ORGANiZATION_USER_NAV_ITEMS } from "@/lib/nav-configs/nav-items";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrgAdminLayoutProps {
  children: React.ReactNode;
  orgName?: string;
  isNestedInSystem?: boolean;
}

export function OrgAdminLayout({ children, orgName = "Acme Corp", isNestedInSystem = false }: OrgAdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const params = useParams();
  const pathname = usePathname();
  
  // If slug is in params, use it or format it
  const displayOrgName = params.slug 
    ? (params.slug as string).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    : orgName;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
             <button 
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            <AppLogo className="hidden md:flex" />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />
            <span className="font-bold text-lg text-slate-900 truncate max-w-[150px] md:max-w-none">
              {displayOrgName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />
          <ProfilePopover role="Org Admin" />
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        <DynamicSidebar 
          items={ORGANiZATION_USER_NAV_ITEMS} 
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
