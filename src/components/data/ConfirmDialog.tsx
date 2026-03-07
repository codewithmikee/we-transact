"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import AppDialog from "@/components/ui/AppDialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  /** When true the confirm button renders as destructive (red) */
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  isLoading = false,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      open={isOpen}
      onClose={onClose}
      canClose={!isLoading}
      maxWidth="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div className={`p-3 rounded-full ${destructive ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertTriangle className={`h-6 w-6 ${destructive ? "text-red-500" : "text-amber-500"}`} />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className={`flex-1 ${destructive ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </AppDialog>
  );
}
