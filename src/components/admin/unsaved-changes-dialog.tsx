"use client";

import Button from "@/components/ui/button";
import { useAdminT } from "./admin-locale-provider";

type UnsavedChangesDialogProps = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

export default function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: UnsavedChangesDialogProps) {
  const t = useAdminT();
  const ct = (k: string) => t(`admin.common.${k}`);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={ct("close")}
        onClick={onStay}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        className="relative w-full max-w-md border border-border bg-white p-6 shadow-xl"
      >
        <h2
          id="unsaved-changes-title"
          className="text-lg font-semibold text-foreground"
        >
          {ct("unsavedTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {ct("unsavedMessage")}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onStay}>
            {ct("unsavedStay")}
          </Button>
          <Button type="button" onClick={onLeave}>
            {ct("unsavedLeave")}
          </Button>
        </div>
      </div>
    </div>
  );
}