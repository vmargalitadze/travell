import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/actions/bookings';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Use the dates provided in the request body
    const bookingData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate)
    };
    
    const result = await createBooking(bookingData);
    
    if (result.success && result.data) {
      // Return success with booking data and redirect URL
      return NextResponse.json({
        success: true,
        data: result.data,
        redirectUrl: `/confirmation?bookingId=${result.data.id}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error("💥 API: Error creating booking:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 