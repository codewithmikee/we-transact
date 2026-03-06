"use client";

import * as React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cn } from "@/lib/utils";

const Tabs = ({ 
  children, 
  className,
  selectedIndex,
  onChange,
  defaultIndex
}: { 
  children: React.ReactNode; 
  className?: string;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  defaultIndex?: number;
}) => (
  <TabGroup 
    className={cn("space-y-4", className)}
    selectedIndex={selectedIndex}
    onChange={onChange}
    defaultIndex={defaultIndex}
  >
    {children}
  </TabGroup>
);

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
    <TabList className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 min-w-max", className)}>
      {children}
    </TabList>
  </div>
);

const TabsTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <Tab
    className={({ selected }) => cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      selected ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-700 text-slate-500",
      className
    )}
  >
    {children}
  </Tab>
);

const TabsContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <TabPanels className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)}>
    {children}
  </TabPanels>
);

const TabsPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <TabPanel className={cn("focus-visible:outline-none", className)}>
    {children}
  </TabPanel>
);

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPanel };
