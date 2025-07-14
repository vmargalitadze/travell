
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { transporter } from "@/lib/email";

// Zod schemas for validation
const BookingSchema = z.object({
  packageId: z.number().positive("Package ID must be positive"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email must be valid"),
  phone: z.string().optional(),
  idNumber: z.string().min(1, "ID number is required"),
  adults: z.number().min(1, "At least 1 adult is required"),
  startDate: z.date(),
  endDate: z.date(),
  totalPrice: z.number().positive("Total price must be positive"),
  discountId: z.number().optional(),
});

const BookingUpdateSchema = BookingSchema.partial().extend({
  id: z.number().positive("ID is required"),
});

// Get availability for a package
export async function getPackageAvailability(packageId: number, startDate?: Date, endDate?: Date) {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        bookings: true,
        dates: true,
      },
    });

    if (!package_) {
      return { success: false, error: "Package not found" };
    }

    // For byBus tours, check availability for specific dates
    if (package_.byBus && startDate && endDate) {
      const packageDate = package_.dates.find(date => 
        date.startDate.getTime() === startDate.getTime() && 
        date.endDate.getTime() === endDate.getTime()
      );

      if (!packageDate) {
        return { success: false, error: "Date not found for this package" };
      }

      // Calculate booked spots for this specific date
      const bookedSpots = package_.bookings
        .filter(booking => 
          booking.startDate.getTime() === startDate.getTime() && 
          booking.endDate.getTime() === endDate.getTime()
        )
        .reduce((total, booking) => total + booking.adults, 0);

      const availableSpots = packageDate.maxPeople - bookedSpots;
      const isFullyBooked = availableSpots <= 0;

      return {
        success: true,
        data: {
          maxPeople: packageDate.maxPeople,
          bookedSpots,
          availableSpots: Math.max(0, availableSpots),
          isFullyBooked,
          packageType: 'byBus'
        }
      };
    }

    // For byPlane tours, check overall availability
    if (package_.byPlane) {
      // Calculate total booked spots for the package
      const bookedSpots = package_.bookings.reduce((total, booking) => total + booking.adults, 0);
      const availableSpots = package_.maxPeople - bookedSpots;
      const isFullyBooked = availableSpots <= 0;

      return {
        success: true,
        data: {
          maxPeople: package_.maxPeople,
          bookedSpots,
          availableSpots: Math.max(0, availableSpots),
          isFullyBooked,
          packageType: 'byPlane'
        }
      };
    }

    // For regular tours (non-bus, non-plane)
    const bookedSpots = package_.bookings.reduce((total, booking) => total + booking.adults, 0);
    const availableSpots = package_.maxPeople - bookedSpots;
    const isFullyBooked = availableSpots <= 0;

    return {
      success: true,
      data: {
        maxPeople: package_.maxPeople,
        bookedSpots,
        availableSpots: Math.max(0, availableSpots),
        isFullyBooked,
        packageType: 'regular'
      }
    };

  } catch (error) {
    console.error("Error getting package availability:", error);
    return { success: false, error: "Failed to get package availability" };
  }
}

// Get availability for all dates of a bus tour
export async function getBusTourAvailability(packageId: number) {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        bookings: true,
        dates: true,
      },
    });

    if (!package_ || !package_.byBus) {
      return { success: false, error: "Package not found or not a bus tour" };
    }

    const dateAvailability = package_.dates.map(date => {
      const bookedSpots = package_.bookings
        .filter(booking => 
          booking.startDate.getTime() === date.startDate.getTime() && 
          booking.endDate.getTime() === date.endDate.getTime()
        )
        .reduce((total, booking) => total + booking.adults, 0);

      const availableSpots = date.maxPeople - bookedSpots;
      const isFullyBooked = availableSpots <= 0;

      return {
        dateId: date.id,
        startDate: date.startDate,
        endDate: date.endDate,
        maxPeople: date.maxPeople,
        bookedSpots,
        availableSpots: Math.max(0, availableSpots),
        isFullyBooked
      };
    });

    return {
      success: true,
      data: dateAvailability
    };

  } catch (error) {
    console.error("Error getting bus tour availability:", error);
    return { success: false, error: "Failed to get bus tour availability" };
  }
}

// Create a new booking
export async function createBooking(data: z.infer<typeof BookingSchema>) {
  try {
    const validatedData = BookingSchema.parse(data);
    
    // Check availability before creating booking
    const availability = await getPackageAvailability(
      validatedData.packageId, 
      validatedData.startDate, 
      validatedData.endDate
    );

    if (!availability.success || !availability.data) {
      return { success: false, error: availability.error || "Failed to check availability" };
    }

    if (availability.data.isFullyBooked) {
      return { success: false, error: "This tour is fully booked" };
    }

    if (validatedData.adults > availability.data.availableSpots) {
      return { 
        success: false, 
        error: `Only ${availability.data.availableSpots} spots available, but trying to book ${validatedData.adults} people` 
      };
    }
    
    const booking = await prisma.booking.create({
      data: validatedData,
      include: {
        package: {
          include: {
            gallery: true,
            location: true,
          },
        },
        discount: true,
      },
    });

    // Send booking receipt email
    try {
      await transporter.sendMail({
        from: `No Reply <no-reply@${process.env.DOMAIN_NAME || 'yourdomain.com'}>`,
        to: booking.email,
        replyTo: 'no-reply@gmail.com',
        subject: `Booking Receipt - ${booking.package.title}`,
        html: `
          <h2>გმადლობთ დაჯავშნისთვის, ${booking.name}! მალე დაგიკავშირდებით</h2>
          <p><strong>ტური:</strong> ${booking.package.title}</p>
          <p><strong>მდებარეობა:</strong> ${booking.package.location?.country}, ${booking.package.location?.city}</p>
          <p><strong>თარიღები:</strong> ${booking.startDate.toDateString()} - ${booking.endDate.toDateString()}</p>
          <p><strong>მოზრდილების რაოდენობა:</strong> ${booking.adults}</p>
          <p><strong>სულ თანხა:</strong> ${booking.totalPrice} ₾</p>
          <p><em>ეს არის ავტომატური შეტყობინება და მისამართი არ კონტროლდება. გთხოვთ, არ უპასუხოთ ამ ელფოსტაზე.</em></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send booking receipt email:", emailError);
    }

    return { success: true, data: booking };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create booking" };
  }
}

// Update an existing booking
export async function updateBooking(data: z.infer<typeof BookingUpdateSchema>) {
  try {
    const validatedData = BookingUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        package: {
          include: {
            gallery: true,
            location: true,
          },
        },
        discount: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: booking };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update booking" };
  }
}

// Delete a booking
export async function deleteBooking(id: number) {
  try {
    await prisma.booking.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return { success: false, error: "Booking not found" };
      }
      if (error.message.includes("Foreign key constraint")) {
        return { success: false, error: "Cannot delete booking due to related data" };
      }
    }
    
    return { success: false, error: "Failed to delete booking" };
  }
}

// Get all bookings
export async function getAllBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        package: {
          include: {
            gallery: true,
            location: true,
          },
        },
        discount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch bookings" };
  }
}

// Get a single booking by ID
export async function getBookingById(id: number) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        package: {
          include: {
            gallery: true,
            location: true,
          },
        },
        discount: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to fetch booking" };
  }
} 