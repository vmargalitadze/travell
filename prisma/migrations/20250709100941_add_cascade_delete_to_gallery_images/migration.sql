-- DropForeignKey
ALTER TABLE "GalleryImage" DROP CONSTRAINT "GalleryImage_packageId_fkey";

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
