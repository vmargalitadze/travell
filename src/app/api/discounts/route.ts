import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, amount, expiresAt } = await request.json();

    if (!code || !amount || !expiresAt) {
      return NextResponse.json(
        { error: 'Code, amount, and expiresAt are required' },
        { status: 400 }
      );
    }

    // Check if discount code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code },
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        code,
        amount: parseFloat(amount),
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
} 