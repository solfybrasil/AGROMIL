"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPageRedirect({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/pedidos/${id}`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
    </div>
  );
}
