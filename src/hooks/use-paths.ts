"use client";

import { useMemo } from "react";
import { getPaths } from "@/lib/paths";
import { useI18n } from "@/components/layout/locale-provider";

export function usePaths() {
  const { locale } = useI18n();
  return useMemo(() => getPaths(locale), [locale]);
}
