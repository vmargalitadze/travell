'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

export async function createGalleryImage(data: {
  url: string;
  packageId: number;
}) {
  try {
    const galleryImage = await prisma.galleryImage.create({
      data: {
        url: data.url,
        packageId: data.packageId,
      },
    });

    revalidatePath('/admin');
    return { success: true, data: galleryImage };
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return { success: false, error: 'Failed to create gallery image' };
  }
}

export async function getGalleryImages(packageId: number) {
  try {
    const galleryImages = await prisma.galleryImage.findMany({
      where: {
        packageId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return { success: true, data: galleryImages };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return { success: false, error: 'Failed to fetch gallery images' };
  }
}

export async function deleteGalleryImage(id: number) {
  try {
    await prisma.galleryImage.delete({
      where: { id },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return { success: false, error: 'Failed to delete gallery image' };
  }
} 