"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Zod schemas for validation
const NotIncludedItemSchema = z.object({
  text: z.string().min(1, "Text is required"),
  packageId: z.number().positive("Package ID is required"),
});

const NotIncludedItemUpdateSchema = NotIncludedItemSchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Create a new not included item
export async function createNotIncludedItem(data: z.infer<typeof NotIncludedItemSchema>) {
  try {
    const validatedData = NotIncludedItemSchema.parse(data);
    
    const notIncludedItem = await prisma.notIncludedItem.create({
      data: validatedData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: notIncludedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create not included item" };
  }
}

// Update an existing not included item
export async function updateNotIncludedItem(data: z.infer<typeof NotIncludedItemUpdateSchema>) {
  try {
    const validatedData = NotIncludedItemUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const notIncludedItem = await prisma.notIncludedItem.update({
      where: { id },
      data: updateData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: notIncludedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update not included item" };
  }
}

// Delete a not included item
export async function deleteNotIncludedItem(id: number) {
  try {
    await prisma.notIncludedItem.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete not included item" };
  }
}

// Get all not included items for a package
export async function getNotIncludedItemsByPackage(packageId: number) {
  try {
    const notIncludedItems = await prisma.notIncludedItem.findMany({
      where: { packageId },
      include: {
        package: true,
      },
      orderBy: { id: "asc" },
    });

    return { success: true, data: notIncludedItems };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch not included items" };
  }
} 