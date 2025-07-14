import { z } from "zod";



export const bookingFormSchema = z.object({
  packageId: z.number().positive("Please select a package"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  idNumber: z.string().min(1, "ID number is required"),
  adults: z
    .number()
    .min(1, "At least 1 adult is required")
    .max(20, "Maximum 20 adults allowed")
    .int("Number of adults must be a whole number"),
  totalPrice: z.number().positive("Total price must be positive"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export type BookingFormErrors = {
  [K in keyof BookingFormData]?: string;
};

export const validateBookingForm = (data: Partial<BookingFormData>) => {
  try {
    const validatedData = bookingFormSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: BookingFormErrors = {};
      error.errors.forEach((err) => {
        const field = err.path[0] as keyof BookingFormData;
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: {} };
  }
};

export const validateField = (field: keyof BookingFormData, value: unknown) => {
  try {
    const testData = { [field]: value } as Partial<BookingFormData>;
    bookingFormSchema.parse(testData);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find((err) => err.path[0] === field);
      return { isValid: false, error: fieldError?.message || "Invalid value" };
    }
    return { isValid: false, error: "Invalid value" };
  }
}; 