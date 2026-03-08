"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { AlertCircle, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  isAction?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeletonRows?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  onRetry,
  emptyTitle = "No results found",
  emptyDescription = "There is nothing here yet.",
  emptyAction,
  skeletonRows = 5,
  className,
}: DataTableProps<T>) {
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null);

  const hasHiddenColumns = columns.some((col) => col.hideOnMobile);
  const visibleColumns = columns.filter((col) => !col.hideOnMobile);
  const hiddenColumns = columns.filter((col) => col.hideOnMobile && !col.isAction);
  const actionColumn = columns.find((col) => col.isAction);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm leading-6">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/90",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
              {hasHiddenColumns && (
                <th className="w-10 px-4 py-4 md:hidden">
                  <span className="sr-only">Details</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <>
                {Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-4 py-4">
                        <Skeleton className="h-4 w-full max-w-[140px] rounded-full" />
                      </td>
                    ))}
                    {hasHiddenColumns && <td className="px-4 py-4 md:hidden" />}
                  </tr>
                ))}
              </>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={visibleColumns.length + (hasHiddenColumns ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="mx-auto flex max-w-[300px] flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Unable to load data</p>
                      <p className="text-xs text-muted-foreground">Please check your connection and try again.</p>
                    </div>
                    {onRetry && (
                      <Button variant="outline" onClick={onRetry} size="sm">
                        Try again
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && (!data || data.length === 0) && (
              <tr>
                <td colSpan={visibleColumns.length + (hasHiddenColumns ? 1 : 0)} className="px-4 py-16">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data?.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="group transition-all hover:bg-muted/30"
                  onClick={() => hasHiddenColumns && window.innerWidth < 768 && setSelectedRow(row)}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-4 text-foreground/90 group-hover:text-foreground transition-colors",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                  {hasHiddenColumns && (
                    <td className="px-4 py-4 text-right md:hidden">
                      <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Detail Modal */}
      <Transition show={!!selectedRow} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedRow(null)}>
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
              <TransitionChild
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative w-full transform rounded-t-2xl bg-background p-6 text-left shadow-xl transition-all sm:max-w-lg sm:rounded-2xl">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <DialogTitle as="h3" className="text-lg font-bold leading-6 text-foreground">
                      Row Details
                    </DialogTitle>
                    <button
                      type="button"
                      className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setSelectedRow(null)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4 py-2">
                    {/* Show everything in the modal on mobile */}
                    {columns
                      .filter((col) => !col.isAction)
                      .map((col) => (
                        <div key={col.key} className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                            {col.header}
                          </p>
                          <div className="text-sm font-medium text-foreground">
                            {selectedRow && col.cell(selectedRow)}
                          </div>
                        </div>
                      ))}
                  </div>

                  {actionColumn && (
                    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Available Actions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRow && actionColumn.cell(selectedRow)}
                      </div>
                    </div>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
