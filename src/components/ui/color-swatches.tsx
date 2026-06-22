"use client";

import type { ColorOption } from "@/lib/colors";

interface ColorSwatchesProps {
  colors: ColorOption[];
  selectedHex?: string | null;
  onSelect: (color: ColorOption) => void;
  label?: string;
  selectedLabel?: string | null;
}

export default function ColorSwatches({
  colors,
  selectedHex,
  onSelect,
  label = "Colore",
  selectedLabel,
}: ColorSwatchesProps) {
  if (colors.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
        {label} — {selectedLabel || "Seleziona"}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.colorHex}
            type="button"
            onClick={() => onSelect(color)}
            title={color.color ?? undefined}
            className={`w-9 h-9 rounded-full border-2 transition-all ${
              selectedHex === color.colorHex
                ? "border-foreground scale-110"
                : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color.colorHex }}
          />
        ))}
      </div>
    </div>
  );
}
