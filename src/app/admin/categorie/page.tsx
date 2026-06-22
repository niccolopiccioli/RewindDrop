"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import MediaImage from "@/components/ui/media-image";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import AdminSaveActions, {
  CREATE_SUCCESS,
  SAVE_SUCCESS,
  type SaveFeedback,
} from "@/components/admin/admin-save-actions";
import AdminBackButton from "@/components/admin/admin-back-button";
import AdminImageField from "@/components/admin/admin-image-field";
import { slugify } from "@/lib/slug";
import type { ImageFit } from "@/lib/image-fit";
import { normalizeImageFit } from "@/lib/image-fit";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  objectFit?: string | null;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [objectFit, setObjectFit] = useState<ImageFit>("cover");
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setImageAlt("");
    setObjectFit("cover");
    setEditingId(null);
    setShowForm(false);
    setSaveFeedback(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setImageAlt(cat.imageAlt || cat.name);
    setObjectFit(normalizeImageFit(cat.objectFit));
    setSaveFeedback(null);
    setShowForm(true);
  };

  const saveCategory = async () => {
    setSaving(true);
    setSaveFeedback(null);

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          image: image.trim() === "" ? "" : image,
          imageAlt: imageAlt.trim() === "" ? "" : imageAlt,
          objectFit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const wasCreate = !editingId;
      if (wasCreate && data.id) {
        setEditingId(data.id);
      }
      setSaveFeedback({
        type: "success",
        text: wasCreate ? CREATE_SUCCESS : SAVE_SUCCESS,
      });
      await fetchCategories();
    } catch (err) {
      setSaveFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Errore",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void saveCategory();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questa categoria?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    fetchCategories();
  };

  return (
    <div>
      <PageHeader
        title="Categorie"
        description="Gestisci le categorie del catalogo"
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={18} className="mr-1" />
            Nuova categoria
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 border border-gray-200 rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <AdminBackButton onClick={resetForm} label="Torna alle categorie" />
            <h2 className="text-lg font-bold">
              {editingId ? "Modifica categoria" : "Nuova categoria"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
                if (!imageAlt || imageAlt === name) setImageAlt(e.target.value);
              }}
              required
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <Input
            label="Descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <section className="border border-border bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-lg font-bold">Immagine</h3>
              <AdminSaveActions
                saveLabel={editingId ? "Salva" : "Crea"}
                saving={saving}
                saveFeedback={saveFeedback}
                onSave={() => void saveCategory()}
              />
            </div>
            <AdminImageField
              values={{ image, imageAlt, objectFit }}
              onChange={({ image: nextImage, imageAlt: nextAlt, objectFit: nextFit }) => {
                setImage(nextImage);
                setImageAlt(nextAlt);
                setObjectFit(nextFit);
              }}
              altPlaceholder={name || "Nome categoria"}
            />
          </section>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Immagine</DataTableHeaderCell>
              <DataTableHeaderCell>Nome</DataTableHeaderCell>
              <DataTableHeaderCell>Slug</DataTableHeaderCell>
              <DataTableHeaderCell>Prodotti</DataTableHeaderCell>
              <DataTableHeaderCell>Azioni</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {categories.map((cat) => (
                <DataTableRow key={cat.id}>
                  <DataTableCell>
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-surface border border-border">
                      <MediaImage
                        src={cat.image}
                        alt={cat.imageAlt || cat.name}
                        fill
                        fit={normalizeImageFit(cat.objectFit)}
                        sizes="40px"
                        iconClassName="w-4 h-4"
                      />
                    </div>
                  </DataTableCell>
                  <DataTableCell className="font-medium">{cat.name}</DataTableCell>
                  <DataTableCell>{cat.slug}</DataTableCell>
                  <DataTableCell>{cat._count.products}</DataTableCell>
                  <DataTableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
                        disabled={cat._count.products > 0}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      )}
    </div>
  );
}
