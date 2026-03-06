"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavConfig, NavGroup, NavItemContent } from "@/types/nav.types";
import { cn } from "@/lib/utils";
import { useSessionStore, selectUserRole } from "@/stores/session.store";
import {
  ChevronDown,
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  Settings,
  UserCog,
  Building2,
  Banknote,
  CreditCard
} from "lucide-react";

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  LinkIcon,
  Users,
  Settings,
  UserCog,
  Building2,
  Banknote,
  CreditCard
};

interface DynamicSidebarProps {
  items: NavConfig[];
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

function isNavGroup(item: NavConfig): item is NavGroup {
  return (item as NavGroup).items !== undefined;
}

export function DynamicSidebar({ items, className, isOpen, onClose }: DynamicSidebarProps) {
  const pathname = usePathname();
  const role = useSessionStore(selectUserRole);

  /** Returns true if this nav item should be shown for the current role */
  const isVisible = (item: NavItemContent) =>
    !item.preventerUserRoles || !role || !item.preventerUserRoles.includes(role);

  const renderItem = (item: NavItemContent, isSubItem = false) => {
    const isActive = pathname === item.link || pathname.startsWith(item.link + "/");
    const Icon = item.icon ? IconMap[item.icon] : null;

    return (
      <Link
        key={item.link}
        href={item.link}
        onClick={onClose}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
          isSubItem ? "ml-4" : "",
          isActive
            ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />}
        {item.title}
      </Link>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const visibleItems = group.items.filter(isVisible);
    if (visibleItems.length === 0) return null;
    return (
      <div key={group.title} className="space-y-1">
        <h5 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {group.title}
        </h5>
        <div className="flex flex-col gap-1">
          {visibleItems.map(item => renderItem(item, true))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-200 p-6 overflow-y-auto z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b">
          <span className="font-bold text-lg text-slate-900">Navigation</span>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <ChevronDown className="rotate-90 h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-8">
          {items.map((item, index) => {
            if (isNavGroup(item)) {
              return <React.Fragment key={index}>{renderGroup(item)}</React.Fragment>;
            }
            if (!isVisible(item)) return null;
            return <React.Fragment key={index}>{renderItem(item)}</React.Fragment>;
          })}
        </nav>
      </aside>
    </>
  );
}
