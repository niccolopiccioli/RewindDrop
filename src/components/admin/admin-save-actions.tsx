import Button from "@/components/ui/button";

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
  saveLabel = "Salva",
  cancelLabel = "Annulla",
  onCancel,
  saving = false,
  saveFeedback = null,
  onSave,
  size = "sm",
}: AdminSaveActionsProps) {
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
          {saveLabel}
        </Button>
      ) : (
        <Button type="submit" size={size} loading={saving}>
          {saveLabel}
        </Button>
      )}
      {onCancel && (
        <Button type="button" variant="outline" size={size} onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}

export const SAVE_SUCCESS = "Salvato.";
export const CREATE_SUCCESS = "Creato.";
