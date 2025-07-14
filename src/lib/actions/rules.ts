"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Zod schemas for validation
const RuleSchema = z.object({
  text: z.string().min(1, "Text is required"),
  packageId: z.number().positive("Package ID is required"),
});

const RuleUpdateSchema = RuleSchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Create a new rule
export async function createRule(data: z.infer<typeof RuleSchema>) {
  try {
    const validatedData = RuleSchema.parse(data);
    
    const rule = await prisma.rule.create({
      data: validatedData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: rule };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create rule" };
  }
}

// Update an existing rule
export async function updateRule(data: z.infer<typeof RuleUpdateSchema>) {
  try {
    const validatedData = RuleUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const rule = await prisma.rule.update({
      where: { id },
      data: updateData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: rule };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update rule" };
  }
}

// Delete a rule
export async function deleteRule(id: number) {
  try {
    await prisma.rule.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete rule" };
  }
}

// Get all rules for a package
export async function getRulesByPackage(packageId: number) {
  try {
    const rules = await prisma.rule.findMany({
      where: { packageId },
      include: {
        package: true,
      },
      orderBy: { id: "asc" },
    });

    return { success: true, data: rules };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch rules" };
  }
} 