"use client";

import { RotateCcw } from "lucide-react";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";
import SupportPageShell from "@/components/support/support-page-shell";
import SupportHighlightBanner from "@/components/support/support-highlight-banner";
import SupportSteps from "@/components/support/support-steps";
import SupportPolicyList from "@/components/support/support-policy-list";
import SupportFaq from "@/components/support/support-faq";
import SupportCtaBanner from "@/components/support/support-cta-banner";
import SupportCrossLinks from "@/components/support/support-cross-links";

export default function ReturnsPage() {
  const { t } = useI18n();
  const paths = usePaths();
  const p = "support.returns" as const;

  return (
    <SupportPageShell
      eyebrow={t("support.eyebrow")}
      title={t(`${p}.title`)}
      subtitle={t(`${p}.subtitle`)}
      icon={RotateCcw}
    >
      <SupportHighlightBanner
        title={t(`${p}.highlightTitle`)}
        description={t(`${p}.highlightDesc`)}
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

      <SupportPolicyList
        title={t(`${p}.policyTitle`)}
        items={[
          t(`${p}.policy1`),
          t(`${p}.policy2`),
          t(`${p}.policy3`),
          t(`${p}.policy4`),
        ]}
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
        href={paths.shipping}
        linkLabel={t(`${p}.ctaLink`)}
      />

      <SupportCrossLinks current="returns" />
    </SupportPageShell>
  );
}
