import type { ImageFit } from "@/lib/image-fit";
import { IMAGE_FIT_OPTIONS } from "@/lib/image-fit";

type ImageFitSelectProps = {
  value: ImageFit;
  onChange: (value: ImageFit) => void;
  label?: string;
};

export default function ImageFitSelect({
  value,
  onChange,
  label = "Adattamento",
}: ImageFitSelectProps) {
  return (
    <div>
      <p className="block text-[11px] font-medium uppercase tracking-widest text-muted mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {IMAGE_FIT_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              title={option.description}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                active
                  ? "bg-foreground text-white border-foreground"
                  : "bg-white text-foreground border-border hover:border-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
