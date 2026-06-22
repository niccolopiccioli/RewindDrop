"use client";

import { Package } from "lucide-react";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";
import SupportPageShell from "@/components/support/support-page-shell";
import SupportStatGrid from "@/components/support/support-stat-grid";
import SupportSteps from "@/components/support/support-steps";
import SupportInfoPanel from "@/components/support/support-info-panel";
import SupportFaq from "@/components/support/support-faq";
import SupportCtaBanner from "@/components/support/support-cta-banner";
import SupportCrossLinks from "@/components/support/support-cross-links";

export default function ShippingPage() {
  const { t } = useI18n();
  const paths = usePaths();
  const p = "support.shipping" as const;

  return (
    <SupportPageShell
      eyebrow={t("support.eyebrow")}
      title={t(`${p}.title`)}
      subtitle={t(`${p}.subtitle`)}
      icon={Package}
    >
      <SupportStatGrid
        stats={[
          { label: t(`${p}.stat1Label`), value: t(`${p}.stat1Value`), hint: t(`${p}.stat1Hint`) },
          { label: t(`${p}.stat2Label`), value: t(`${p}.stat2Value`), hint: t(`${p}.stat2Hint`) },
          { label: t(`${p}.stat3Label`), value: t(`${p}.stat3Value`), hint: t(`${p}.stat3Hint`) },
        ]}
      />

      <SupportSteps
        title={t(`${p}.stepsTitle`)}
        steps={[
          { title: t(`${p}.step1Title`), description: t(`${p}.step1Desc`) },
          { title: t(`${p}.step2Title`), description: t(`${p}.step2Desc`) },
          { title: t(`${p}.step3Title`), description: t(`${p}.step3Desc`) },
          { title: t(`${p}.step4Title`), description: t(`${p}.step4Desc`) },
        ]}
      />

      <SupportInfoPanel
        title={t(`${p}.zonesTitle`)}
        description={t(`${p}.zonesDesc`)}
        note={t(`${p}.zonesNote`)}
      />

      <SupportFaq
        title={t(`${p}.faqTitle`)}
        items={[
          { question: t(`${p}.faq1q`), answer: t(`${p}.faq1a`) },
          { question: t(`${p}.faq2q`), answer: t(`${p}.faq2a`) },
          { question: t(`${p}.faq3q`), answer: t(`${p}.faq3a`) },
          { question: t(`${p}.faq4q`), answer: t(`${p}.faq4a`) },
        ]}
      />

      <SupportCtaBanner
        title={t(`${p}.ctaTitle`)}
        description={t(`${p}.ctaDesc`)}
        href={paths.returns}
        linkLabel={t(`${p}.ctaLink`)}
      />

      <SupportCrossLinks current="shipping" />
    </SupportPageShell>
  );
}
