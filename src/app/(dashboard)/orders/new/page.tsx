import { PrismaClient } from "@prisma/client";
import { OrderForm } from "./OrderForm";

const prisma = new PrismaClient();

export default async function NewOrderPage({ searchParams }: { searchParams: { customer?: string } }) {
  const customers = await prisma.customer.findMany({
    orderBy: { storeName: "asc" },
    select: { id: true, storeName: true, ownerName: true, address: true }
  });

  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, price: true, stock: true }
  });

  const packages = await prisma.package.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true }
  });

  return (
    <OrderForm 
      customers={customers} 
      products={products} 
      packages={packages} 
      defaultCustomerId={searchParams?.customer} 
    />
  );
}
