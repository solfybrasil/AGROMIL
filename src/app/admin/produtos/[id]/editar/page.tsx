"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { dbService } from "@/lib/db-service";
import { MOCK_PRODUCTS } from "@/lib/mocks";

export default function EditProductPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);

    async function loadProduct() {
      let foundProduct: any = null;

      try {
        const dbProduct = await dbService.getProductById(id);

        if (dbProduct) {
          foundProduct = {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description,
            shortDesc: dbProduct.shortDesc || "",
            price: dbProduct.price,
            promoPrice: dbProduct.promoPrice ? Number(dbProduct.promoPrice) : "",
            stock: dbProduct.stock,
            unit: dbProduct.unit,
            sku: dbProduct.sku || "",
            categoryId: dbProduct.categoryId,
            active: dbProduct.active,
            featured: dbProduct.featured,
          };
        }
      } catch (err) {
        console.warn("DB Lookup failed for Product Edit, checking mocks.", err);
      }

      if (!foundProduct) {
        const mock = MOCK_PRODUCTS.find((p) => p.id === id);
        if (mock) {
          foundProduct = {
            id: mock.id,
            name: mock.name,
            description: mock.description,
            shortDesc: mock.shortDesc || "",
            price: mock.price,
            promoPrice: mock.promoPrice || "",
            stock: mock.stock,
            unit: mock.unit,
            sku: mock.sku || "",
            categoryId: mock.categoryId,
            active: mock.active,
            featured: mock.featured,
          };
        }
      }

      if (active) {
        setProduct(foundProduct);
        setLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  if (!product) {
    return (
      <div className="p-6 text-center select-none">
        <span className="text-4xl">🌾</span>
        <h2 className="text-lg font-bold text-gray-800 mt-4">Produto não encontrado</h2>
        <p className="text-xs text-gray-500 mt-2">O produto selecionado não pôde ser localizado ou foi excluído.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-[#1b4332]">Editar Produto</h1>
        <p className="text-xs text-gray-500 mt-1">Ajuste os preços, descrição e nível de estoque do produto.</p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
