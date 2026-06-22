"use client";

import AdminBackButton from "@/components/admin/admin-back-button";
import { useAdminT } from "./admin-locale-provider";

export default function PageHeader({
  title,
  description,
  action,
  backHref,
  onBack,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
}) {
  const t = useAdminT();
  const showBack = Boolean(backHref || onBack);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex items-start gap-3 min-w-0">
        {showBack && (
          <AdminBackButton
            href={backHref}
            onClick={onBack}
            label={t("admin.common.backToList")}
          />
        )}
        <div className="min-w-0">
          <h1 className="text-display text-xl md:text-2xl font-semibold break-words">{title}</h1>
          {description && (
            <p className="text-xs text-muted mt-1 uppercase tracking-widest break-words">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}