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
          finalItemsList.push({ type: "package", id: pkg.id, name: pkg.name, price: pkg.price, quantity: item.quantity });
        }
      }
      
      const profit = total - cost;
      
      // Compute due date if Utang (7 days from now)
      const dueDate = paymentType === "Utang" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
      const status = paymentType === "Cash" ? "Paid" : "Pending";

      const order = await tx.order.create({
        data: {
          customerId,
          paymentType,
          items: finalItemsList,
          total,
          cost,
          profit,
          dueDate,
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
