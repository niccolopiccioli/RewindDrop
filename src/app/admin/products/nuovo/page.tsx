"use client";

import { useRef, useState } from "react";
import PageHeader from "@/components/admin/page-header";
import ProductForm, {
  type ProductFormHandle,
  type ProductFormStatus,
} from "@/components/admin/product-form";
import AdminSaveActions from "@/components/admin/admin-save-actions";
import UnsavedChangesDialog from "@/components/admin/unsaved-changes-dialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useAdminT } from "@/components/admin/admin-locale-provider";

export default function NewProductPage() {
  const formRef = useRef<ProductFormHandle>(null);
  const t = useAdminT();
  const pt = (k: string) => t(`admin.products.${k}`);
  const [formStatus, setFormStatus] = useState<ProductFormStatus>({
    loading: false,
    saveFeedback: null,
    saveLabel: pt("create"),
    isDirty: false,
  });
  const guard = useUnsavedChangesGuard(formStatus.isDirty);

  return (
    <div>
      <PageHeader
        title={pt("newProduct")}
        description={pt("description")}
        onBack={() => guard.confirmHref("/admin/products")}
        action={
          <AdminSaveActions
            size="lg"
            saveLabel={formStatus.saveLabel}
            saving={formStatus.loading}
            saveFeedback={formStatus.saveFeedback}
            onSave={() => formRef.current?.submit()}
          />
        }
      />
      <ProductForm
        ref={formRef}
        hideSaveActions
        onStatusChange={setFormStatus}
      />
      <UnsavedChangesDialog
        open={guard.open}
        onStay={guard.stayOnPage}
        onLeave={guard.leaveWithoutSaving}
      />
    </div>
  );
}