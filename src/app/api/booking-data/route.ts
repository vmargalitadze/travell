import { NextRequest, NextResponse } from 'next/server';
import { getPackageById } from '@/lib/actions/packages';

export async function POST(request: NextRequest) {
  try {
    const { packageId, adults, selectedDateId } = await request.json();
    
    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: "Package ID is required"
      }, { status: 400 });
    }

    // Get package details
    const packageResult = await getPackageById(packageId);
    
    if (!packageResult.success || !packageResult.data) {
      return NextResponse.json({
        success: false,
        error: "Package not found"
      }, { status: 404 });
    }

    const packageData = packageResult.data;
    const totalPrice = packageData.price * (adults || 1);

    // Prepare booking data
    const bookingData = {
      packageId: packageData.id,
      packageTitle: packageData.title,
      adults: adults || 1,
      totalPrice,
      price: packageData.price,
      selectedDateId
    };

    return NextResponse.json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    console.error("Error processing booking data:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 