"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function OrderDetailPageRedirect() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/pedidos/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
    </div>
  );
}
