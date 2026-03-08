"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
  try {
    const cost = parseFloat(formData.get("cost") as string);
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const minStock = parseInt(formData.get("minStock") as string, 10);

    await prisma.product.create({
      data: {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        unit: formData.get("unit") as string,
        cost,
        price,
        stock,
        minStock,
      }
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const cost = parseFloat(formData.get("cost") as string);
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const minStock = parseInt(formData.get("minStock") as string, 10);

    await prisma.product.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        unit: formData.get("unit") as string,
        cost,
        price,
        stock,
        minStock,
      }
    });

    revalidatePath("/inventory");
    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function createPackage(name: string, price: number, items: Array<{ productId: string, quantity: number }>) {
  try {
    await prisma.package.create({
      data: {
        name,
        price,
        items, // saved as JSON
      }
    });

    revalidatePath("/inventory");
    revalidatePath("/packages");
    return { success: true };
  } catch (error) {
    console.error("Failed to create package:", error);
    return { success: false, error: "Failed to create package" };
  }
}

export async function restockProduct(productId: string, amount: number) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: amount } }
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          change: amount,
          type: "Restock"
        }
      });
    });

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to restock" };
  }
}
