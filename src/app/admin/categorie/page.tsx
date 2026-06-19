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
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { slugify } from "@/lib/slug";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description: description || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setSaving(false);
    }
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
          className="mb-8 border border-gray-200 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold">
            {editingId ? "Modifica categoria" : "Nuova categoria"}
          </h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
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
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? "Salva" : "Crea"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annulla
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Nome</DataTableHeaderCell>
              <DataTableHeaderCell>Slug</DataTableHeaderCell>
              <DataTableHeaderCell>Prodotti</DataTableHeaderCell>
              <DataTableHeaderCell>Azioni</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {categories.map((cat) => (
                <DataTableRow key={cat.id}>
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
