import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET package dates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const packageId = parseInt(id);
    
    if (isNaN(packageId)) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    const dates = await prisma.packageDate.findMany({
      where: { packageId },
      orderBy: { startDate: "asc" },
    });
 
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Failed to fetch package dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch package dates" },
      { status: 500 }
    );
  }
}

// POST package dates (create/update)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const packageId = parseInt(id);
    
    if (isNaN(packageId)) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    const body = await request.json();
    const { dates } = body;

    if (!Array.isArray(dates)) {
      return NextResponse.json({ error: "Dates must be an array" }, { status: 400 });
    }

    // Delete existing dates for this package
    await prisma.packageDate.deleteMany({
      where: { packageId },
    });

    // Validate dates before creating
    for (const date of dates) {
      if (!date.startDate || !date.endDate) {
        return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 });
      }
      
      if (date.maxPeople < 1) {
        return NextResponse.json({ error: "Max people must be at least 1" }, { status: 400 });
      }
      
      const startDate = new Date(date.startDate);
      const endDate = new Date(date.endDate);
      
      if (endDate <= startDate) {
        return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
      }
    }

    // Create new dates
    const createdDates = await Promise.all(
      dates.map((date) =>
        prisma.packageDate.create({
          data: {
            packageId,
            startDate: new Date(date.startDate),
            endDate: new Date(date.endDate),
            maxPeople: date.maxPeople || 1,
          },
        })
      )
    );

    return NextResponse.json({ dates: createdDates });
  } catch (error) {
    console.error("Failed to save package dates:", error);
    return NextResponse.json(
      { error: "Failed to save package dates" },
      { status: 500 }
    );
  }
} 