"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  activeTab?: string;
  onChange?: (id: any) => void;
  className?: string;
  variant?: "solid" | "underline";
}

export function Tabs({ 
  tabs, 
  defaultIndex = 0, 
  activeTab,
  onChange,
  className,
  variant = "solid"
}: TabsProps) {
  const selectedIndex = React.useMemo(() => {
    if (activeTab === undefined) return undefined;
    const idx = tabs.findIndex(t => t.id === activeTab);
    return idx === -1 ? 0 : idx;
  }, [activeTab, tabs]);

  const handleChange = (index: number) => {
    if (onChange) {
      if (activeTab !== undefined) {
        onChange(tabs[index].id);
      } else {
        onChange(index);
      }
    }
  };

  const hasContent = tabs.some(t => !!t.content);

  return (
    <div className={cn("w-full", className)}>
      <TabGroup 
        selectedIndex={selectedIndex} 
        defaultIndex={defaultIndex} 
        onChange={handleChange}
      >
        <TabList className={cn(
          "flex space-x-1 p-1",
          variant === "solid" ? "rounded-xl bg-muted" : "border-b border-border space-x-8 bg-transparent"
        )}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                cn(
                  "rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none",
                  variant === "solid" 
                    ? [
                        "w-full px-3",
                        selected
                          ? "bg-background text-foreground shadow"
                          : "text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                      ]
                    : [
                        "relative px-1 rounded-none border-b-2 transition-colors",
                        selected
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      ]
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        
        {hasContent && (
          <TabPanels className="mt-4">
            {tabs.map((tab) => (
              <TabPanel
                key={tab.id}
                className={cn(
                  "rounded-xl bg-background p-3 focus:outline-none"
                )}
              >
                {tab.content}
              </TabPanel>
            ))}
          </TabPanels>
        )}
      </TabGroup>
    </div>
  );
}
