-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicItemId" TEXT,
    "orderId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "themeId" TEXT NOT NULL,
    "frameColor" TEXT NOT NULL,
    "frameModel" TEXT NOT NULL,
    "paperFinish" TEXT NOT NULL DEFAULT 'glossy',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "revisionUsed" BOOLEAN NOT NULL DEFAULT false,
    "revisionNotes" TEXT,
    "approvedAt" DATETIME,
    "previewReadyAt" DATETIME,
    "productionStartedAt" DATETIME,
    "shippedAt" DATETIME,
    "trackingNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("basePrice", "createdAt", "frameColor", "frameModel", "id", "orderId", "paperFinish", "quantity", "size", "themeId") SELECT "basePrice", "createdAt", "frameColor", "frameModel", "id", "orderId", "paperFinish", "quantity", "size", "themeId" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE UNIQUE INDEX "OrderItem_publicItemId_key" ON "OrderItem"("publicItemId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_publicItemId_idx" ON "OrderItem"("publicItemId");
CREATE INDEX "OrderItem_themeId_idx" ON "OrderItem"("themeId");
CREATE TABLE "new_Upload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Upload_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Upload_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Upload" ("createdAt", "filePath", "id", "orderId", "originalName", "type") SELECT "createdAt", "filePath", "id", "orderId", "originalName", "type" FROM "Upload";
DROP TABLE "Upload";
ALTER TABLE "new_Upload" RENAME TO "Upload";
CREATE INDEX "Upload_orderId_idx" ON "Upload"("orderId");
CREATE INDEX "Upload_orderItemId_idx" ON "Upload"("orderItemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
