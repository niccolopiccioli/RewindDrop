"use client";

import AccountNav from "@/components/account/account-nav";
import { useI18n } from "@/components/layout/locale-provider";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="container-wide py-8 md:py-12">
      <h1 className="text-display text-2xl font-semibold mb-8">{t("account.myAccount")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
