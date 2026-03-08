import { PrismaClient } from "@prisma/client";
import { PackageForm } from "./PackageForm";

const prisma = new PrismaClient();

export default async function NewPackagePage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, price: true, cost: true }
  });

  return <PackageForm products={products} />;
}
