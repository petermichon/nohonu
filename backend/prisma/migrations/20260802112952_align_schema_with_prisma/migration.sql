/*
  Warnings:

  - The primary key for the `CustomDomain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CustomDomain` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `RepoHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RepoHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `StarredBy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `StarredBy` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "CustomDomain_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CustomDomain" ("domain", "id", "siteId", "verified") SELECT "domain", "id", "siteId", "verified" FROM "CustomDomain";
DROP TABLE "CustomDomain";
ALTER TABLE "new_CustomDomain" RENAME TO "CustomDomain";
CREATE UNIQUE INDEX "CustomDomain_siteId_domain_key" ON "CustomDomain"("siteId", "domain");
CREATE TABLE "new_RepoHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repo" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "lastUsed" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "RepoHistory_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RepoHistory" ("branch", "id", "lastUsed", "repo", "siteId") SELECT "branch", "id", "lastUsed", "repo", "siteId" FROM "RepoHistory";
DROP TABLE "RepoHistory";
ALTER TABLE "new_RepoHistory" RENAME TO "RepoHistory";
CREATE INDEX "RepoHistory_siteId_idx" ON "RepoHistory"("siteId");
CREATE TABLE "new_StarredBy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "StarredBy_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StarredBy" ("id", "siteId", "username") SELECT "id", "siteId", "username" FROM "StarredBy";
DROP TABLE "StarredBy";
ALTER TABLE "new_StarredBy" RENAME TO "StarredBy";
CREATE INDEX "StarredBy_siteId_idx" ON "StarredBy"("siteId");
CREATE UNIQUE INDEX "StarredBy_siteId_username_key" ON "StarredBy"("siteId", "username");
CREATE TABLE "new_User" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "profilePicture" TEXT
);
INSERT INTO "new_User" ("createdAt", "displayName", "passwordHash", "profilePicture", "username") SELECT "createdAt", "displayName", "passwordHash", "profilePicture", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
