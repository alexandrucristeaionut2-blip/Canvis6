-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "themeId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "frameColor" TEXT NOT NULL,
    "frameModel" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "mockupImage" TEXT NOT NULL DEFAULT '/placeholders/gallery.svg',
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryItem_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GalleryItem" ("createdAt", "frameColor", "frameModel", "id", "imagePath", "size", "themeId", "title") SELECT "createdAt", "frameColor", "frameModel", "id", "imagePath", "size", "themeId", "title" FROM "GalleryItem";
DROP TABLE "GalleryItem";
ALTER TABLE "new_GalleryItem" RENAME TO "GalleryItem";
CREATE INDEX "GalleryItem_themeId_idx" ON "GalleryItem"("themeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
