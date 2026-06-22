"use client";

import Button from "@/components/ui/button";
import { useAdminT } from "./admin-locale-provider";

export type SaveFeedback = {
  type: "success" | "error";
  text: string;
} | null;

type AdminSaveActionsProps = {
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  saving?: boolean;
  saveFeedback?: SaveFeedback;
  onSave?: () => void;
  size?: "sm" | "md" | "lg";
};

export default function AdminSaveActions({
  saveLabel,
  cancelLabel,
  onCancel,
  saving = false,
  saveFeedback = null,
  onSave,
  size = "sm",
}: AdminSaveActionsProps) {
  const t = useAdminT();
  const ct = (k: string) => t(`admin.common.${k}`);

  const resolvedSave = saveLabel || ct("save");
  const resolvedCancel = cancelLabel || ct("cancel");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {saveFeedback && (
        <span
          className={`text-sm ${
            saveFeedback.type === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {saveFeedback.text}
        </span>
      )}
      {onSave ? (
        <Button type="button" size={size} loading={saving} onClick={() => void onSave()}>
          {resolvedSave}
        </Button>
      ) : (
        <Button type="submit" size={size} loading={saving}>
          {resolvedSave}
        </Button>
      )}
      {onCancel && (
        <Button type="button" variant="outline" size={size} onClick={onCancel}>
          {resolvedCancel}
        </Button>
      )}
    </div>
  );
}

export const SAVE_SUCCESS = "Salvato.";
export const CREATE_SUCCESS = "Creato.";