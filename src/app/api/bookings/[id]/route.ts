import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid booking ID"
      }, { status: 400 });
    }
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: {
          include: {
            location: true,
            gallery: true
          }
        }
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("💥 API: Error fetching booking:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 