import { SITE_NAME } from "@/lib/site";

interface SiteLogoProps {
  className?: string;
  size?: "default" | "nav" | "compact" | "hero";
}

export default function SiteLogo({
  className = "",
  size = "default",
}: SiteLogoProps) {
  const sizeClass =
    size === "hero"
      ? "text-3xl sm:text-4xl"
      : size === "nav"
        ? "text-[1.65rem] sm:text-[1.85rem] lg:text-[2.35rem] xl:text-[2.55rem] tracking-[-0.045em]"
        : size === "compact"
          ? "text-base sm:text-lg"
          : "text-2xl sm:text-[1.85rem] md:text-3xl tracking-[-0.04em]";

  return (
    <span
      className={`font-display inline-flex items-baseline gap-0 font-bold leading-none tracking-[-0.03em] ${sizeClass} ${className}`}
      aria-label={SITE_NAME}
    >
      <span>Rewind</span>
      <span className="font-normal italic tracking-[-0.04em] opacity-90">
        Drop
      </span>
    </span>
  );
}
