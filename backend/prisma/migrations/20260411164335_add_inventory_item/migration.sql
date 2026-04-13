-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('IN_TRANSIT', 'IN_STORAGE', 'PROCESSING', 'PROCESSED', 'DELIVERED');

-- AlterTable
ALTER TABLE "supply_chain_events" ADD COLUMN     "inventory_item_id" TEXT;

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "volume_kg" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'IN_STORAGE',
    "owner_id" TEXT NOT NULL,
    "certifications" TEXT,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_owner_id_idx" ON "inventory_items"("owner_id");

-- CreateIndex
CREATE INDEX "inventory_items_sku_idx" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "supply_chain_events_inventory_item_id_idx" ON "supply_chain_events"("inventory_item_id");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_chain_events" ADD CONSTRAINT "supply_chain_events_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
