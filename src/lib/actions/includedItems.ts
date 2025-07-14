"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Zod schemas for validation
const IncludedItemSchema = z.object({
  text: z.string().min(1, "Text is required"),
  packageId: z.number().positive("Package ID is required"),
});

const IncludedItemUpdateSchema = IncludedItemSchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Create a new included item
export async function createIncludedItem(data: z.infer<typeof IncludedItemSchema>) {
  try {
    const validatedData = IncludedItemSchema.parse(data);
    
    const includedItem = await prisma.includedItem.create({
      data: validatedData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: includedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create included item" };
  }
}

// Update an existing included item
export async function updateIncludedItem(data: z.infer<typeof IncludedItemUpdateSchema>) {
  try {
    const validatedData = IncludedItemUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const includedItem = await prisma.includedItem.update({
      where: { id },
      data: updateData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: includedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update included item" };
  }
}

// Delete an included item
export async function deleteIncludedItem(id: number) {
  try {
    await prisma.includedItem.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete included item" };
  }
}

// Get all included items for a package
export async function getIncludedItemsByPackage(packageId: number) {
  try {
    const includedItems = await prisma.includedItem.findMany({
      where: { packageId },
      include: {
        package: true,
      },
      orderBy: { id: "asc" },
    });

    return { success: true, data: includedItems };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch included items" };
  }
} 