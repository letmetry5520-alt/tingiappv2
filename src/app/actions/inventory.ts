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
    const notes = formData.get("notes") as string;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
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

      if (stock > 0) {
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            change: stock,
            type: "Initial Stock",
            notes: notes || "Initial product creation"
          }
        });
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
    const notes = formData.get("notes") as string;

    await prisma.$transaction(async (tx) => {
      const oldProduct = await tx.product.findUnique({ where: { id } });
      if (!oldProduct) throw new Error("Product not found");

      await tx.product.update({
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

      if (stock !== oldProduct.stock) {
        await tx.inventoryLog.create({
          data: {
            productId: id,
            change: stock - oldProduct.stock,
            type: "Adjustment",
            notes: notes || "Manual stock adjustment"
          }
        });
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

export async function restockProduct(productId: string, amount: number, notes?: string) {
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
          type: "Restock",
          notes: notes || null
        }
      });
    });

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Restock failed:", error);
    return { success: false, error: "Failed to restock" };
  }
}
