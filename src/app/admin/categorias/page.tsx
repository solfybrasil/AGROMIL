"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FolderPlus, Edit, Trash2, FolderOpen, AlertCircle, CheckCircle,
  UploadCloud, ImageIcon, Save, Tag, ArrowUp, ArrowDown, Sparkles,
} from "lucide-react";
import { dbService } from "@/lib/db-service";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-vestidos", name: "Vestidos & Midis", slug: "vestidos", displayOrder: 1, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { id: "cat-tops-blusas", name: "Tops & Croppeds", slug: "tops-blusas", displayOrder: 2, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80" },
  { id: "cat-conjuntos", name: "Conjuntos Alfaiataria", slug: "conjuntos", displayOrder: 3, imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" },
  { id: "cat-calcas-jeans", name: "Calças Wide Leg & Jeans", slug: "calcas-jeans", displayOrder: 4, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80" },
  { id: "cat-acessorios", name: "Bolsas & Acessórios", slug: "acessorios", displayOrder: 5, imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=400&q=80" },
  { id: "cat-casacos-blazers", name: "Casacos & Blazers", slug: "casacos-blazers", displayOrder: 6, imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80" },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const broadcastCategories = (list: Category[]) => {
    try {
      localStorage.setItem("agromil_categories", JSON.stringify(list));
      window.dispatchEvent(new Event("agromil_categories_updated"));
    } catch {}
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const stored = localStorage.getItem("agromil_categories");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
            setLoading(false);
            return;
          }
        }

        const localCats = await dbService.getCategories();
        if (localCats && localCats.length > 0) {
          setCategories(localCats as any);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400;
          let w = img.width, h = img.height;
          if (w > h ? w > MAX_SIZE : h > MAX_SIZE) {
            if (w > h) { h *= MAX_SIZE / w; w = MAX_SIZE; }
            else { w *= MAX_SIZE / h; h = MAX_SIZE; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrMessage("Apenas arquivos de imagem são aceitos.");
      return;
    }
    const compressed = await compressImage(file);
    setImageUrl(compressed);
  };

  const resetForm = () => {
    setName(""); setSlug(""); setImageUrl("");
    setDisplayOrder(categories.length + 1);
    setEditingId(null);
    setMessage(""); setErrMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setErrMessage("");

    if (!name.trim()) { setErrMessage("Nome da categoria é obrigatório."); return; }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      imageUrl: imageUrl || undefined,
      displayOrder: Number(displayOrder || categories.length + 1),
    };

    try {
      let updatedList = [...categories];
      if (editingId) {
        const idx = updatedList.findIndex(c => c.id === editingId);
        if (idx > -1) {
          updatedList[idx] = { ...updatedList[idx], ...payload };
        }
      } else {
        const newCat = { ...payload, id: `cat-${Date.now()}` };
        updatedList.push(newCat);
      }

      updatedList.sort((a, b) => a.displayOrder - b.displayOrder);
      setCategories(updatedList);
      broadcastCategories(updatedList);

      // Attempt API update
      const endpoint = editingId ? `/api/categorias/${editingId}` : "/api/categorias";
      const method = editingId ? "PUT" : "POST";
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setMessage(editingId ? "Categoria atualizada!" : "Categoria cadastrada!");
      resetForm();
    } catch (err: any) {
      setErrMessage(err.message || "Erro ao salvar categoria.");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.imageUrl || "");
    setDisplayOrder(cat.displayOrder);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      const updatedList = categories.filter(c => c.id !== id);
      setCategories(updatedList);
      broadcastCategories(updatedList);
      await fetch(`/api/categorias/${id}`, { method: "DELETE" }).catch(() => {});
      setMessage("Categoria removida com sucesso.");
    } catch {
      setErrMessage("Erro ao remover categoria.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
            Organização do Catálogo
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
            Gestão de Categorias
          </h1>
          <p className="text-xs text-[#7A6F63] font-medium mt-0.5">
            Organize os departamentos do marketplace e ordene o menu principal.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs py-3 px-5 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all uppercase tracking-wider cursor-pointer self-start sm:self-auto"
        >
          <FolderPlus className="h-4 w-4" /> Nova Categoria
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Form Panel */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest border-b border-[#EDE3D3]/60 pb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#8B5E3C]" />
            {editingId ? "Editar Categoria" : "Nova Categoria"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                Nome da Categoria *
              </label>
              <input
                type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Irrigação & Pomares"
                className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                Slug (URL Amigável)
              </label>
              <input
                type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: irrigacao-pomares"
                className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                Ordem de Exibição
              </label>
              <input
                type="number" min={1} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                Imagem da Categoria (Opcional)
              </label>
              <div
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging ? "border-[#8B5E3C] bg-[#EDE3D3]/40" : "border-[#EDE3D3] hover:border-[#8B5E3C] bg-[#F5EFE6]/30"
                }`}
              >
                {imageUrl ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" className="h-24 w-auto mx-auto rounded-xl object-cover shadow-xs" />
                    <span className="text-[9px] font-bold text-[#8B5E3C] uppercase block">Clique para alterar</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-[#7A6F63]">
                    <UploadCloud className="h-6 w-6 mx-auto text-[#8B5E3C]" />
                    <span className="text-xs font-bold block text-[#2B2620]">Arraste ou selecione uma imagem</span>
                    <span className="text-[9px] block">Recomendado: 400x400px</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="flex-1 py-3 px-4 border border-[#EDE3D3] text-[#7A6F63] font-bold text-xs rounded-2xl hover:bg-[#F5EFE6] transition-all">
                  Cancelar
                </button>
              )}
              <button type="submit"
                className="flex-1 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                {editingId ? "Atualizar" : "Salvar Categoria"}
              </button>
            </div>
          </form>
        </div>

        {/* Categories Grid / List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[#8B5E3C]" />
              Categorias Ativas ({categories.length})
            </h3>
            <span className="text-[9px] text-[#7A6F63] font-bold">Ordenadas por prioridade</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#7A6F63] text-xs font-semibold animate-pulse">
              Carregando categorias...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-[#EDE3D3] rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3 hover:border-[#8B5E3C]/40 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 bg-[#F5EFE6] border border-[#EDE3D3] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {cat.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <FolderOpen className="h-5 w-5 text-[#8B5E3C]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-black text-[#8B5E3C] bg-[#8B5E3C]/10 px-2 py-0.5 rounded uppercase">
                        Ordem #{cat.displayOrder}
                      </span>
                      <h4 className="text-xs font-black text-[#2B2620] truncate mt-0.5">{cat.name}</h4>
                      <p className="text-[9px] text-[#7A6F63] font-mono truncate">/{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(cat)}
                      className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-[#8B5E3C] hover:bg-[#F5EFE6] transition-colors cursor-pointer" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
