"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// orderItems: { id, type: "product" | "package", quantity }
export async function createOrder(
  customerId: string, 
  paymentType: "Cash" | "Utang", 
  orderItems: Array<{ id: string, type: "product" | "package", quantity: number }>
) {
  try {
    return await prisma.$transaction(async (tx) => {
      let total = 0;
      let cost = 0;
      const finalItemsList: any[] = [];
      
      // Calculate totals and deduct stock
      for (const item of orderItems) {
        if (item.type === "product") {
          const product = await tx.product.findUnique({ where: { id: item.id } });
          if (!product) throw new Error(`Product ${item.id} not found`);
          if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
          
          total += product.price * item.quantity;
          cost += product.cost * item.quantity;
          
          finalItemsList.push({ type: "product", id: product.id, name: product.name, price: product.price, quantity: item.quantity });
          
          // Deduct stock
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } }
          });
          
          await tx.inventoryLog.create({
            data: { productId: product.id, change: -item.quantity, type: "Sale" }
          });
        } else if (item.type === "package") {
          const pkg = await tx.package.findUnique({ where: { id: item.id } });
          if (!pkg) throw new Error(`Package ${item.id} not found`);
          
          total += pkg.price * item.quantity;
          
          // Package cost is sum of item costs
          let pkgCost = 0;
          const pkgItems = pkg.items as Array<{productId: string, quantity: number}>;
          
          for (const pItem of pkgItems) {
            const product = await tx.product.findUnique({ where: { id: pItem.productId } });
            if (!product) throw new Error(`Product ${pItem.productId} in package not found`);
            if (product.stock < (pItem.quantity * item.quantity)) throw new Error(`Insufficient stock for ${product.name} (in package)`);
            
            pkgCost += product.cost * pItem.quantity;
            
            // Deduct stock for each package content
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: pItem.quantity * item.quantity } }
            });
            
            await tx.inventoryLog.create({
              data: { productId: product.id, change: -(pItem.quantity * item.quantity), type: "Sale" }
            });
          }
          
          cost += pkgCost * item.quantity;
          
          // Get product names for the manifest breakdown
          const pkgManifestItems = [];
          for (const pItem of pkgItems) {
            const p = await tx.product.findUnique({ where: { id: pItem.productId }, select: { name: true } });
            pkgManifestItems.push({ name: p?.name || "Unknown Product", quantity: pItem.quantity });
          }

          finalItemsList.push({ 
            type: "package", 
            id: pkg.id, 
            name: pkg.name, 
            price: pkg.price, 
            quantity: item.quantity,
            packageItems: pkgManifestItems // Snapshot of what's inside for the manifest
          });
        }
      }
      
      const profit = total - cost;
      
      // Due date remains null until the order is delivered
      const status = paymentType === "Cash" ? "Paid" : "Pending";

      const order = await tx.order.create({
        data: {
          customerId,
          paymentType,
          items: finalItemsList,
          total,
          cost,
          profit,
          dueDate: null,
          status,
        }
      });
      
      // Create payment record instantly if Cash
      if (paymentType === "Cash") {
        await tx.payment.create({
          data: {
            orderId: order.id,
            customerId,
            amount: total,
            method: "Cash"
          }
        });

        // Add to Financial Ledger
        await tx.financialTransaction.create({
          data: {
            type: "Income",
            category: "Sales",
            description: `Payment for Order #${order.id.slice(-5).toUpperCase()}`,
            amount: total,
            date: new Date()
          }
        });
      }

      revalidatePath("/route");
      revalidatePath("/inventory");
      revalidatePath("/orders");
      revalidatePath("/receivables");
      revalidatePath(`/customers/${customerId}`);
      
      return { success: true, orderId: order.id };
    });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

export async function updateDeliveryStatus(orderId: string, deliveryStatus: string) {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentType: true, deliveryStatus: true }
    });

    let dueDateUpdate = {};
    if (deliveryStatus === "Delivered" && existingOrder?.paymentType === "Utang") {
      // Countdown starts only when delivered
      dueDateUpdate = { dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        deliveryStatus,
        ...dueDateUpdate
      }
    });

    revalidatePath("/orders");
    revalidatePath("/route");
    revalidatePath("/receivables");
    revalidatePath(`/customers/${order.customerId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Delivery status update failed:", error);
    return { success: false, error: error.message || "Failed to update delivery status" };
  }
}
