"use client";

import { Shield } from "lucide-react";
import { useI18n } from "@/components/layout/locale-provider";
import SupportPageShell from "@/components/support/support-page-shell";
import SupportPrivacySections from "@/components/support/support-privacy-sections";
import SupportCrossLinks from "@/components/support/support-cross-links";

export default function PrivacyPage() {
  const { t } = useI18n();
  const p = "support.privacy" as const;

  return (
    <SupportPageShell
      eyebrow={t("support.eyebrow")}
      title={t(`${p}.title`)}
      subtitle={t(`${p}.subtitle`)}
      icon={Shield}
    >
      <SupportPrivacySections
        demoTitle={t(`${p}.demoTitle`)}
        demoBody={t(`${p}.demoBody`)}
        demoProducts={t(`${p}.demoProducts`)}
        gdprTitle={t(`${p}.gdprTitle`)}
        gdprBody={t(`${p}.gdprBody`)}
        collectTitle={t(`${p}.collectTitle`)}
        collectItems={[
          { label: t(`${p}.collect1Label`), description: t(`${p}.collect1Desc`) },
          { label: t(`${p}.collect2Label`), description: t(`${p}.collect2Desc`) },
          { label: t(`${p}.collect3Label`), description: t(`${p}.collect3Desc`) },
          { label: t(`${p}.collect4Label`), description: t(`${p}.collect4Desc`) },
        ]}
        rightsTitle={t(`${p}.rightsTitle`)}
        rightsBody={t(`${p}.rightsBody`)}
        contactTitle={t(`${p}.contactTitle`)}
        contactBody={t(`${p}.contactBody`)}
        cookiesTitle={t(`${p}.cookiesTitle`)}
        cookiesBody={t(`${p}.cookiesBody`)}
      />

      <SupportCrossLinks current="privacy" />
    </SupportPageShell>
  );
}
