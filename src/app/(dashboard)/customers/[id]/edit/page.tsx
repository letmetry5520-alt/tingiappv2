import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "./EditCustomerForm";

const prisma = new PrismaClient();

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) return notFound();

  return <EditCustomerForm customer={customer} />;
}
