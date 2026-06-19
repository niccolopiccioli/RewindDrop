import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({
  title,
  href,
  linkLabel = "Vedi tutti",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-8 md:mb-10">
      <h2 className="text-display text-xl md:text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors duration-300"
        >
          {linkLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
