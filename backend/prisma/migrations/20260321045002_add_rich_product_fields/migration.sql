-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "boxContents" TEXT[],
ADD COLUMN     "compatibility" JSONB,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "specifications" JSONB;
