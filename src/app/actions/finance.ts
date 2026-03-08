"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function addTransaction(formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dateStr = formData.get("date") as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    await prisma.financialTransaction.create({
      data: { type, category, description, amount, date }
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error: "Failed to add transaction" };
  }
}
