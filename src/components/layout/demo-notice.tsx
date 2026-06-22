import { DEMO_DISCLAIMER_SHORT } from "@/lib/site";

export default function DemoNotice() {
  return (
    <div
      className="border-y border-border bg-surface/80"
      role="note"
      aria-label="Avviso sito dimostrativo"
    >
      <div className="container-wide py-3">
        <p className="text-center text-[11px] sm:text-xs text-muted leading-relaxed max-w-3xl mx-auto">
          {DEMO_DISCLAIMER_SHORT}{" "}
          <a
            href="/privacy#demo"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Leggi l&apos;informativa
          </a>
        </p>
      </div>
    </div>
  );
}
