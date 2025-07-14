import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { url, packageId } = await request.json();

    if (!url || !packageId) {
      return NextResponse.json(
        { error: 'URL and packageId are required' },
        { status: 400 }
      );
    }

    const galleryImage = await prisma.galleryImage.create({
      data: {
        url,
        packageId: parseInt(packageId),
      },
    });

    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');

    if (!packageId) {
      return NextResponse.json(
        { error: 'packageId is required' },
        { status: 400 }
      );
    }

    const galleryImages = await prisma.galleryImage.findMany({
      where: {
        packageId: parseInt(packageId),
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(galleryImages);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    await prisma.galleryImage.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
} 