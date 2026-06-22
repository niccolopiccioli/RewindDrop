"use client";

import { hexForColorInput, normalizeHex } from "@/lib/colors";

interface ColorHexFieldProps {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  placeholder?: string;
}

export default function ColorHexField({
  label,
  value,
  onChange,
  placeholder = "#000000",
}: ColorHexFieldProps) {
  const normalized = normalizeHex(value);
  const displayHex = normalized ?? "#E5E7EB";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-medium uppercase tracking-widest text-muted mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center">
        <label
          className="relative shrink-0 w-11 h-11 rounded-lg border border-border overflow-hidden cursor-pointer"
          title="Seleziona colore"
        >
          <input
            type="color"
            value={hexForColorInput(value)}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <span
            className="block w-full h-full"
            style={{ backgroundColor: displayHex }}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-4 py-3 border border-border rounded-lg bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-300"
        />
      </div>
    </div>
  );
}
