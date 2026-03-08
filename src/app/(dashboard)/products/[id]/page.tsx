import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { EditProductForm } from "./EditProductForm";

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
