"use client";

import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

export default function DemoNotice() {
  const { t } = useI18n();
  const paths = usePaths();

  return (
    <div
      className="border-y border-border bg-surface/80"
      role="note"
      aria-label={t("common.demo")}
    >
      <div className="container-wide py-3">
        <p className="text-center text-[11px] sm:text-xs text-muted leading-relaxed max-w-3xl mx-auto">
          {t("common.demo")}{" "}
          <a
            href={`${paths.privacy}#demo`}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {t("common.readMore")}
          </a>
        </p>
      </div>
    </div>
  );
}
