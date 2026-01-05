-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "heroImage" TEXT,
    "mockupImage" TEXT NOT NULL DEFAULT '/placeholders/gallery.svg',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Theme" ("createdAt", "description", "heroImage", "id", "name", "slug", "tags") SELECT "createdAt", "description", "heroImage", "id", "name", "slug", "tags" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
