-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "title" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);
