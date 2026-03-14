"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createCustomer(formData: FormData) {
  try {
    const lat = formData.get("latitude") as string;
    const lng = formData.get("longitude") as string;
    
    await prisma.customer.create({
      data: {
        storeName: formData.get("storeName") as string,
        ownerName: formData.get("ownerName") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        zoneName: (formData.get("zoneName") as string) || null,
        routeDay: (formData.get("routeDay") as string) || null,
        expectedOrderCycle: (formData.get("expectedOrderCycle") as string) || null,
        notes: (formData.get("notes") as string) || null,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
        image: (formData.get("image") as string) || null,
        gallery: formData.getAll("gallery") as string[],
        facebook: (formData.get("facebook") as string) || null,
        isBanned: formData.get("isBanned") === "true",
      } as any
    });

    revalidatePath("/customers");
    revalidatePath("/route");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const lat = formData.get("latitude") as string;
    const lng = formData.get("longitude") as string;

    await prisma.customer.update({
      where: { id },
      data: {
        storeName: formData.get("storeName") as string,
        ownerName: formData.get("ownerName") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        zoneName: (formData.get("zoneName") as string) || null,
        routeDay: (formData.get("routeDay") as string) || null,
        expectedOrderCycle: (formData.get("expectedOrderCycle") as string) || null,
        notes: (formData.get("notes") as string) || null,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
        image: (formData.get("image") as string) || null,
        gallery: (formData.getAll("gallery") as string[]).filter(Boolean),
        facebook: (formData.get("facebook") as string) || null,
        isBanned: formData.get("isBanned") === "true",
      } as any
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath("/route");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update customer:", error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}
