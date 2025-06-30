/*
  Warnings:

  - Added the required column `domain` to the `SerpItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SerpItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshotId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "serpFeature" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "hasControl" BOOLEAN NOT NULL,
    CONSTRAINT "SerpItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SerpItem" ("hasControl", "id", "rank", "sentiment", "serpFeature", "snapshotId", "title", "url") SELECT "hasControl", "id", "rank", "sentiment", "serpFeature", "snapshotId", "title", "url" FROM "SerpItem";
DROP TABLE "SerpItem";
ALTER TABLE "new_SerpItem" RENAME TO "SerpItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
