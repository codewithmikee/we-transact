"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiPaginatedMeta } from "@/types/api.types";

interface PaginationBarProps {
  meta: ApiPaginatedMeta | undefined;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationBar({ meta, onPageChange, className }: PaginationBarProps) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, total, per_page } = meta;
  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  // Show up to 5 page numbers centered around current page
  const pages: number[] = [];
  const delta = 2;
  for (
    let i = Math.max(1, current_page - delta);
    i <= Math.min(last_page, current_page + delta);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-1 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>
        {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageBtn>

        {pages[0] > 1 && (
          <>
            <PageBtn onClick={() => onPageChange(1)}>1</PageBtn>
            {pages[0] > 2 && <span className="px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <PageBtn
            key={p}
            onClick={() => onPageChange(p)}
            active={p === current_page}
          >
            {p}
          </PageBtn>
        ))}

        {pages[pages.length - 1] < last_page && (
          <>
            {pages[pages.length - 1] < last_page - 1 && (
              <span className="px-1">…</span>
            )}
            <PageBtn onClick={() => onPageChange(last_page)}>
              {last_page}
            </PageBtn>
          </>
        )}

        <PageBtn
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}
