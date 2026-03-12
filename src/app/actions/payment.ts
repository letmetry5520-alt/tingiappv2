"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function processPayment(orderId: string, amount: number, method: string = "Cash") {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
      });

      if (!order) throw new Error("Order not found");

      // Calculate how much has been paid so far
      const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = order.total - alreadyPaid;
      
      if (amount > remainingBalance + 0.01) {
        throw new Error("Payment exceeds remaining balance");
      }

      // Create payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          customerId: order.customerId,
          amount,
          method
        }
      });

      // Add to Financial Ledger
      await tx.financialTransaction.create({
        data: {
          type: "Income",
          category: "Payment Collection",
          description: `Payment for Order #${order.id.slice(-5).toUpperCase()} (${method})`,
          amount,
          date: new Date()
        }
      });

      // Update Order Status
      const newTotalPaid = alreadyPaid + amount;
      const isPaid = Math.abs(order.total - newTotalPaid) < 0.01;

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: isPaid ? "Paid" : "Partially Paid"
        }
      });

      revalidatePath("/receivables");
      revalidatePath("/route");
      revalidatePath(`/customers/${order.customerId}`);
      
      return { success: true };
    });
  } catch (error: any) {
    console.error("Payment failed:", error);
    return { success: false, error: error.message || "Failed to process payment" };
  }
}
