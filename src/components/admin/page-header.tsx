import AdminBackButton from "@/components/admin/admin-back-button";

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
  const showBack = Boolean(backHref || onBack);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-start gap-3 min-w-0">
        {showBack && (
          <AdminBackButton
            href={backHref}
            onClick={onBack}
            label="Torna indietro"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-display text-xl md:text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-xs text-muted mt-1 uppercase tracking-widest">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
