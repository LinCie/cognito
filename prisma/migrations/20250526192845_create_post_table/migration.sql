-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" JSONB[],

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
