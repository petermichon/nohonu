-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "userUsername" TEXT NOT NULL,
    "nextIndex" INTEGER NOT NULL DEFAULT 1,
    "currentIndex" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "account" TEXT,
    "displayName" TEXT,
    "subdomain" TEXT,
    "coverImage" TEXT,
    "lastDeployedAt" INTEGER,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "extracted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Site_userUsername_fkey" FOREIGN KEY ("userUsername") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("account", "coverImage", "currentIndex", "displayName", "enabled", "extracted", "id", "lastDeployedAt", "nextIndex", "siteId", "starCount", "subdomain", "userUsername") SELECT "account", "coverImage", "currentIndex", "displayName", "enabled", "extracted", "id", "lastDeployedAt", "nextIndex", "siteId", "starCount", "subdomain", "userUsername" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE UNIQUE INDEX "Site_userUsername_siteId_key" ON "Site"("userUsername", "siteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

