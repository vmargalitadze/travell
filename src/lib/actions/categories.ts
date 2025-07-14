"use server";


import { prisma } from "@/lib/prisma";

import { CATEGORIES } from "../Validation";

// Category enum values from schema


export type Category = typeof CATEGORIES[number];

// Get all categories (returns the enum values)
export async function getAllCategories() {
  try {
    return { success: true, data: CATEGORIES };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get packages by category
export async function getPackagesByCategory(category: Category) {
  try {
    const packages = await prisma.package.findMany({
      where: { category },
      include: {
        location: true,
        gallery: true,
        tourPlan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: packages };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch packages by category" };
  }
}

// Get category statistics (count of packages per category)
export async function getCategoryStats() {
  try {
    const stats = await prisma.package.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const formattedStats = stats.map(stat => ({
      category: stat.category,
      count: stat._count.category,
    }));

    return { success: true, data: formattedStats };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch category statistics" };
  }
} 