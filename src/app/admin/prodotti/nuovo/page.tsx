import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="Nuovo prodotto"
        description="Aggiungi un nuovo prodotto al catalogo"
      />
      <ProductForm />
    </div>
  );
}
