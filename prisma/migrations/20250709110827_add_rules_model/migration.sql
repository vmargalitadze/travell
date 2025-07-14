-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "packageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
