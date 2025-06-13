-- CreateTable
CREATE TABLE "Presence" (
    "id" SERIAL NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "kelasId" INTEGER NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PresenceToStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PresenceToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PresenceToStudent_B_index" ON "_PresenceToStudent"("B");

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PresenceToStudent" ADD CONSTRAINT "_PresenceToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Presence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PresenceToStudent" ADD CONSTRAINT "_PresenceToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
