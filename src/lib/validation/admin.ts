import { z } from "zod";

// Base validation schemas
export const locationSchema = z.object({
  name: z
    .string()
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name must be less than 100 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country name must be at least 2 characters")
    .max(50, "Country name must be less than 50 characters")
    .trim(),
  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name must be less than 50 characters")
    .trim(),
  image: z
    .string()
    .url("Please enter a valid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .trim(),
});

export const discountSchema = z.object({
  code: z
    .string()
    .min(2, "Discount code must be at least 2 characters")
    .max(50, "Discount code must be less than 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Discount code can only contain uppercase letters, numbers, hyphens, and underscores")
    .trim(),
  amount: z
    .number()
    .min(0.01, "Discount amount must be at least 0.01")
    .positive("Discount amount must be positive"),
  expiresAt: z
    .string()
    .min(1, "Expiration date is required")
    .refine((date) => {
      const expiryDate = new Date(date);
      const now = new Date();
      return expiryDate > now;
    }, {
      message: "Expiration date must be in the future"
    }),
});

export const galleryImageSchema = z.object({
  title: z
    .string()
    .min(2, "Image title must be at least 2 characters")
    .max(100, "Image title must be less than 100 characters")
    .trim(),
  url: z
    .string()
    .url("Please enter a valid image URL")
    .min(1, "Image URL is required"),
});

export const tourDaySchema = z.object({
  dayNumber: z
    .number()
    .min(1, "Day number must be at least 1")
    .max(365, "Day number cannot exceed 365"),
  title: z
    .string()
    .min(2, "Day title must be at least 2 characters")
    .max(200, "Day title must be less than 200 characters")
    .trim(),
  activities: z
    .array(z.string().min(1, "Activity cannot be empty"))
    .min(1, "At least one activity is required")
    .max(20, "Maximum 20 activities allowed"),
});

export const packageDateSchema = z.object({
  startDate: z
    .string()
    .min(1, "Start date is required"),
  endDate: z
    .string()
    .min(1, "End date is required"),
  maxPeople: z
    .number()
    .min(1, "Maximum people must be at least 1")
    .max(100, "Maximum people cannot exceed 100")
    .int("Maximum people must be a whole number"),
});

export const includedItemSchema = z.object({
  description: z
    .string()
    .min(2, "Item description must be at least 2 characters")
    .max(200, "Item description must be less than 200 characters")
    .trim(),
});

export const notIncludedItemSchema = z.object({
  description: z
    .string()
    .min(2, "Item description must be at least 2 characters")
    .max(200, "Item description must be less than 200 characters")
    .trim(),
});

export const packageSchema = z.object({
  title: z
    .string()
    .min(2, "Package title must be at least 2 characters")
    .max(200, "Package title must be less than 200 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .positive("Price must be positive"),
  salePrice: z
    .number()
    .min(0, "Sale price cannot be negative")
    .optional()
    .nullable(),
  duration: z
    .string()
    .max(50, "Duration must be less than 50 characters")
    .trim()
    .optional(),
  maxPeople: z
    .number()
    .min(0, "Maximum people cannot be negative")
    .max(100, "Maximum people cannot exceed 100")
    .int("Maximum people must be a whole number"),
  category: z
    .string()
    .min(1, "Category is required"),
  popular: z
    .boolean(),
  byBus: z
    .boolean(),
  byPlane: z
    .boolean(),
  locationId: z
    .number()
    .min(1, "Location is required")
    .positive("Location ID must be positive"),
  gallery: z
    .array(z.string().url("Please enter valid image URLs"))
    .max(20, "Maximum 20 gallery images allowed")
    .optional(),
}).refine((data) => {
  // Sale price must be less than regular price if provided
  if (data.salePrice && data.salePrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "Sale price must be less than regular price",
  path: ["salePrice"]
}).refine((data) => {
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

// Form data types
export type LocationFormData = z.infer<typeof locationSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type DiscountFormData = z.infer<typeof discountSchema>;
export type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
export type TourDayFormData = z.infer<typeof tourDaySchema>;
export type PackageDateFormData = z.infer<typeof packageDateSchema>;
export type IncludedItemFormData = z.infer<typeof includedItemSchema>;
export type NotIncludedItemFormData = z.infer<typeof notIncludedItemSchema>;
export type PackageFormData = z.infer<typeof packageSchema>;

// Error types
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Validation helper functions
export const validateForm = <T>(schema: z.ZodSchema<T>, data: Partial<T>) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormErrors<T> = {};
      error.errors.forEach((err) => {
        const field = err.path[0] as keyof T;
        errors[field] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: "Validation failed" } as FormErrors<T> };
  }
};

export const validateField = <T>(schema: z.ZodSchema<T>, field: keyof T, value: unknown) => {
  try {
    // Create a partial object with just the field we want to validate
    const partialData = { [field]: value } as Partial<T>;
    schema.parse(partialData);
    return { isValid: true, error: "" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === field);
      return { isValid: false, error: fieldError?.message || "Invalid field" };
    }
    return { isValid: false, error: "Invalid field" };
  }
};

// Specific validation functions for each form
export const validateLocationForm = (data: Partial<LocationFormData>) => 
  validateForm(locationSchema, data);

export const validateCategoryForm = (data: Partial<CategoryFormData>) => 
  validateForm(categorySchema, data);

export const validateDiscountForm = (data: Partial<DiscountFormData>) => 
  validateForm(discountSchema, data);

export const validateGalleryImageForm = (data: Partial<GalleryImageFormData>) => 
  validateForm(galleryImageSchema, data);

export const validateTourDayForm = (data: Partial<TourDayFormData>) => 
  validateForm(tourDaySchema, data);

export const validatePackageDateForm = (data: Partial<PackageDateFormData>) => 
  validateForm(packageDateSchema, data);

export const validateIncludedItemForm = (data: Partial<IncludedItemFormData>) => 
  validateForm(includedItemSchema, data);

export const validateNotIncludedItemForm = (data: Partial<NotIncludedItemFormData>) => 
  validateForm(notIncludedItemSchema, data);

export const validatePackageForm = (data: Partial<PackageFormData>) => 
  validateForm(packageSchema, data); 