"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAdminT } from "./admin-locale-provider";

type AdminBackButtonProps = {
  href?: string;
  onClick?: () => void;
  label?: string;
};

export default function AdminBackButton({
  href,
  onClick,
  label,
}: AdminBackButtonProps) {
  const t = useAdminT();

  const resolvedLabel = label || t("admin.common.backToList");

  const className =
    "inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted hover:text-foreground hover:bg-surface transition-colors flex-shrink-0";

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-label={resolvedLabel}
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
      aria-label={resolvedLabel}
    >
      <ArrowLeft size={18} />
    </button>
  );
}