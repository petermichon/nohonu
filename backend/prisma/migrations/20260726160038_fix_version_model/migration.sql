/*
  Warnings:

  - You are about to drop the column `siteDomain` on the `Version` table. All the data in the column will be lost.
  - You are about to drop the column `siteUser` on the `Version` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "repo" TEXT,
    "branch" TEXT,
    "createdAt" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "Version_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Version" ("branch", "createdAt", "id", "index", "repo", "siteId", "type") SELECT "branch", "createdAt", "id", "index", "repo", "siteId", "type" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
CREATE UNIQUE INDEX "Version_siteId_index_key" ON "Version"("siteId", "index");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
