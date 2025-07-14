'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

export async function createDiscount(data: {
  code: string;
  amount: number;
  expiresAt: Date;
}) {
  try {
    // Check if discount code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code: data.code },
    });

    if (existingDiscount) {
      return { success: false, error: 'Discount code already exists' };
    }

    const discount = await prisma.discount.create({
      data: {
        code: data.code,
        amount: data.amount,
        expiresAt: data.expiresAt,
      },
    });

    revalidatePath('/admin');
    return { success: true, data: discount };
  } catch (error) {
    console.error('Error creating discount:', error);
    return { success: false, error: 'Failed to create discount' };
  }
}

export async function getDiscounts() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: discounts };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return { success: false, error: 'Failed to fetch discounts' };
  }
}

export async function getDiscount(id: number) {
  try {
    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    return { success: true, data: discount };
  } catch (error) {
    console.error('Error fetching discount:', error);
    return { success: false, error: 'Failed to fetch discount' };
  }
}

export async function updateDiscount(
  id: number,
  data: {
    code?: string;
    amount?: number;
    expiresAt?: Date;
  }
) {
  try {
    const discount = await prisma.discount.update({
      where: { id },
      data,
    });

    revalidatePath('/admin');
    return { success: true, data: discount };
  } catch (error) {
    console.error('Error updating discount:', error);
    return { success: false, error: 'Failed to update discount' };
  }
}

export async function deleteDiscount(id: number) {
  try {
    await prisma.discount.delete({
      where: { id },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting discount:', error);
    return { success: false, error: 'Failed to delete discount' };
  }
} 