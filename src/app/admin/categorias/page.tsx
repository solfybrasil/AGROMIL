"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Edit, Trash2, FolderOpen, AlertCircle, CheckCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}



export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categorias");
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.warn("Categories API offline.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug
    const generated = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrMessage("");

    if (!name || !slug) {
      setErrMessage("Nome e slug são obrigatórios.");
      return;
    }

    const payload = { name, slug, displayOrder: Number(displayOrder) };

    try {
      if (editingId) {
        // Edit Action
        const res = await fetch(`/api/categorias/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
          const updated = await res.json();
          setCategories(categories.map((c) => (c.id === editingId ? updated : c)));
          setMessage("Categoria atualizada com sucesso.");
          resetForm();
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrMessage(errData.error || "Erro no servidor ao atualizar categoria.");
          return;
        }
      } else {
        // Create Action
        const res = await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          setCategories([...categories, created]);
          setMessage("Categoria cadastrada com sucesso.");
          resetForm();
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrMessage(errData.error || "Erro no servidor ao cadastrar categoria.");
          return;
        }
      }
    } catch (err) {
      console.warn("Could not save to DB via API.", err);
      setErrMessage("Erro de conexão ao salvar. Tente novamente.");
    }
    resetForm();
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDisplayOrder(cat.displayOrder);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;
    setMessage("");
    setErrMessage("");

    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        setMessage("Categoria excluída com sucesso.");
        if (editingId === id) resetForm();
        return;
      } else {
        setErrMessage("Erro ao excluir categoria no servidor.");
      }
    } catch (err) {
      console.warn("Could not delete from DB.", err);
      setErrMessage("Erro de conexão ao excluir. Tente novamente.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDisplayOrder(categories.length + 1);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-[#1c4735] tracking-tight">Categorias</h1>
        <p className="text-xs text-gray-400 font-semibold">
          Gerencie as seções do marketplace da Agromil (ordem de exibição, slugs e nomes).
        </p>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
          <CheckCircle className="h-4.5 w-4.5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {errMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{errMessage}</span>
        </div>
      )}

      {/* Columns: List vs Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Categories List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-3xs p-6 space-y-4 hover:shadow-xs transition-all duration-300">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <FolderOpen className="h-4.5 w-4.5 text-primary" />
            Categorias Ativas
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 font-bold uppercase border-b border-gray-100">
                  <th className="p-4 w-16 text-center">Ordem</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 w-24 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                          {cat.displayOrder}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-855">{cat.name}</td>
                      <td className="p-4 text-gray-500 font-mono font-medium">{cat.slug}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="text-primary hover:text-primary-dark p-2 rounded-xl hover:bg-primary/5 transition-all inline-block hover:scale-105"
                          title="Editar"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition-all inline-block hover:scale-105"
                          title="Excluir"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-3xs p-6 flex flex-col space-y-4 hover:shadow-xs transition-all duration-300">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <FolderPlus className="h-4.5 w-4.5 text-primary" />
            {editingId ? "Editar Categoria" : "Nova Categoria"}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-bold text-gray-700 mb-1.5">
                Nome da Categoria *
              </label>
              <input
                id="cat-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Irrigação"
                className="w-full bg-white border border-gray-250 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-2xs font-semibold"
              />
            </div>

            <div>
              <label htmlFor="cat-slug" className="block text-xs font-bold text-gray-700 mb-1.5">
                Slug (URL Amigável) *
              </label>
              <input
                id="cat-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: irrigacao"
                className="w-full bg-gray-50 border border-gray-250 rounded-xl py-2.5 px-4 text-xs text-gray-500 focus:outline-none font-mono font-semibold"
              />
            </div>

            <div>
              <label htmlFor="cat-order" className="block text-xs font-bold text-gray-700 mb-1.5">
                Ordem de Exibição *
              </label>
              <input
                id="cat-order"
                type="number"
                required
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full bg-white border border-gray-250 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-2xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all hover-lift"
              >
                {editingId ? "Salvar" : "Cadastrar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full border border-gray-250 text-gray-600 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all hover-lift"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
