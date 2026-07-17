import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-[#1b4332]">Cadastrar Produto</h1>
        <p className="text-xs text-gray-500 mt-1">Insira as informações do novo item para exibi-lo no marketplace.</p>
      </div>
      
      <ProductForm />
    </div>
  );
}
