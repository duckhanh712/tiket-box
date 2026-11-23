-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "check_ins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "checkedInBy" UUID NOT NULL,
    "checkedInAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_ticketId_key" ON "check_ins"("ticketId");

-- CreateIndex
CREATE INDEX "check_ins_eventId_idx" ON "check_ins"("eventId");
