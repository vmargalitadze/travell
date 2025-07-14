"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Zod schemas for validation
const TourDaySchema = z.object({
  dayNumber: z.number().positive("Day number must be positive"),
  title: z.string().min(1, "Title is required"),
  activities: z.array(z.string()).min(1, "At least one activity is required"),
  packageId: z.number().positive("Package ID is required"),
});

const TourDayUpdateSchema = TourDaySchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Create a new tour day
export async function createTourDay(data: z.infer<typeof TourDaySchema>) {
  try {
    const validatedData = TourDaySchema.parse(data);
    
   
    const tourDay = await prisma.tourDay.create({
      data: validatedData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: tourDay };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create tour day" };
  }
}

// Update an existing tour day
export async function updateTourDay(data: z.infer<typeof TourDayUpdateSchema>) {
  try {
    const validatedData = TourDayUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

   
    const tourDay = await prisma.tourDay.update({
      where: { id },
      data: updateData,
      include: {
        package: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: tourDay };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update tour day" };
  }
}

// Delete a tour day
export async function deleteTourDay(id: number) {
  try {

    await prisma.tourDay.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete tour day" };
  }
}

// Get all tour days for a package
export async function getTourDaysByPackage(packageId: number) {
  try {
  
    const tourDays = await prisma.tourDay.findMany({
      where: { packageId },
      include: {
        package: true,
      },
      orderBy: { dayNumber: "asc" },
    });

    return { success: true, data: tourDays };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch tour days" };
  }
}

// Get a single tour day by ID
export async function getTourDayById(id: number) {
  try {
    
    const tourDay = await prisma.tourDay.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    if (!tourDay) {
      return { success: false, error: "Tour day not found" };
    }

    return { success: true, data: tourDay };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch tour day" };
  }
} 