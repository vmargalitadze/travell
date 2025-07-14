"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CATEGORIES } from "@/lib/Validation";

// Zod schemas for validation
const PackageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  salePrice: z.number().optional(),
  duration: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxPeople: z.number().min(0, "Max people cannot be negative"),
  popular: z.boolean().default(false),
  byBus: z.boolean().default(false),
  byPlane: z.boolean().default(false),
  category: z.enum(CATEGORIES),
  locationId: z.number().positive("Location is required"),
  gallery: z.array(z.string().url("Please enter valid image URLs")).optional(),
});

const PackageUpdateSchema = PackageSchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Create a new package with validation
export async function createPackage(data: z.infer<typeof PackageSchema>) {
  try {
    // Validate the data with custom refinement
    const validatedData = PackageSchema.refine((data) => {
      // Duration is required for non-bus tours
      if (!data.byBus && (!data.duration || data.duration.trim() === "")) {
        return false;
      }
      return true;
    }, {
      message: "Duration is required for non-bus tours",
      path: ["duration"]
    }).refine((data) => {
      // Max people must be positive for non-bus tours
      if (!data.byBus && data.maxPeople <= 0) {
        return false;
      }
      return true;
    }, {
      message: "Max people must be positive for non-bus tours",
      path: ["maxPeople"]
    }).parse(data);
    
    // Remove gallery from validatedData since we handle it separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gallery, ...packageData } = validatedData;
    
    // Convert date strings to Date objects or null
    const processedData = {
      ...packageData,
      duration: packageData.duration || "", // Ensure duration is always a string
      startDate: packageData.startDate ? new Date(packageData.startDate) : null,
      endDate: packageData.endDate ? new Date(packageData.endDate) : null,
    };
    
    const package_ = await prisma.package.create({
      data: processedData,
      include: {
        location: true,
        tourPlan: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: package_ };
  } catch (error) {
    console.error("Package creation error:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create package" };
  }
}

// Update an existing package
export async function updatePackage(data: z.infer<typeof PackageUpdateSchema>) {
  try {
    const validatedData = PackageUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    // Apply the same validation for updates
    if (updateData.byBus !== undefined || updateData.duration !== undefined || updateData.maxPeople !== undefined) {
      const validationSchema = PackageSchema.refine((data) => {
        // Duration is required for non-bus tours
        if (!data.byBus && (!data.duration || data.duration.trim() === "")) {
          return false;
        }
        return true;
      }, {
        message: "Duration is required for non-bus tours",
        path: ["duration"]
      }).refine((data) => {
        // Max people must be positive for non-bus tours
        if (!data.byBus && data.maxPeople <= 0) {
          return false;
        }
        return true;
      }, {
        message: "Max people must be positive for non-bus tours",
        path: ["maxPeople"]
      });
      
      // Validate the update data
      validationSchema.parse(updateData);
    }

    // Remove gallery from updateData since we handle it separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gallery, ...packageUpdateData } = updateData;
    
    // Convert date strings to Date objects or null
    const processedUpdateData = {
      ...packageUpdateData,
      startDate: packageUpdateData.startDate ? new Date(packageUpdateData.startDate) : null,
      endDate: packageUpdateData.endDate ? new Date(packageUpdateData.endDate) : null,
    };
    
    const package_ = await prisma.package.update({
      where: { id },
      data: processedUpdateData,
      include: {
        location: true,
        tourPlan: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: package_ };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update package" };
  }
}

// Delete a package
export async function deletePackage(id: number) {
  try {
    await prisma.package.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to delete package" };
  }
}

// Get all packages
export async function getAllPackages() {
  try {
    const packages = await prisma.package.findMany({
      include: {
        location: true,
        bookings: true,
        tourPlan: true,
        gallery: true,
        dates: true,
        rules: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: packages };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch packages" };
  }
}

// Get a single package by ID
export async function getPackageById(id: number) {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id },
      include: {
        location: true,
        bookings: true,
        gallery: true,
        tourPlan: true,
        includedItems: true,
        notIncludedItems: true,
        dates: true,
        rules: true,
      } as Parameters<typeof prisma.package.findUnique>[0]['include'],
    });

    if (!package_) {
      return { success: false, error: "Package not found" };
    }

    return { success: true, data: package_ };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch package" };
  }
}

// Get popular packages

// Get unique countries from packages
export async function getUniqueCountries() {
  try {
    const packages = await prisma.package.findMany({
      include: {
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract unique countries
    const uniqueCountries = [...new Set(
      packages
        .filter(pkg => pkg.location?.country)
        .map(pkg => pkg.location.country)
    )].sort();

    return { success: true, data: uniqueCountries };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch countries" };
  }
}
