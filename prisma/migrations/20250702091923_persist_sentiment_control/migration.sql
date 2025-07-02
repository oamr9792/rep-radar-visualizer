/*
  Warnings:

  - Added the required column `keywordId` to the `SerpItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SerpItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshotId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "serpFeature" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "hasControl" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SerpItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SerpItem" ("domain", "hasControl", "id", "rank", "sentiment", "serpFeature", "snapshotId", "title", "url") SELECT "domain", "hasControl", "id", "rank", "sentiment", "serpFeature", "snapshotId", "title", "url" FROM "SerpItem";
DROP TABLE "SerpItem";
ALTER TABLE "new_SerpItem" RENAME TO "SerpItem";
CREATE UNIQUE INDEX "SerpItem_keywordId_url_key" ON "SerpItem"("keywordId", "url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
