import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AdminBackButtonProps = {
  href?: string;
  onClick?: () => void;
  label?: string;
};

export default function AdminBackButton({
  href,
  onClick,
  label = "Torna indietro",
}: AdminBackButtonProps) {
  const className =
    "inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted hover:text-foreground hover:bg-surface transition-colors flex-shrink-0";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-label={label}
        onClick={(event) => {
          if (onClick) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        <ArrowLeft size={18} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      <ArrowLeft size={18} />
    </button>
  );
}
