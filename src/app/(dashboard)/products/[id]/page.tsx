import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { EditProductForm } from "./EditProductForm";

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
