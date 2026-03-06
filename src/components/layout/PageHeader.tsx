"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string; isCurrent?: boolean }[];
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
