"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface TabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultIndex?: number;
  className?: string;
  onChange?: (index: number) => void;
}

export function Tabs({ tabs, defaultIndex = 0, className, onChange }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <TabGroup defaultIndex={defaultIndex} onChange={onChange}>
        <TabList className="flex space-x-1 rounded-xl bg-muted p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                cn(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-primary focus:outline-none focus:ring-2",
                  selected
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-4">
          {tabs.map((tab) => (
            <TabPanel
              key={tab.id}
              className={cn(
                "rounded-xl bg-background p-3",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-primary focus:outline-none focus:ring-2"
              )}
            >
              {tab.content}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
