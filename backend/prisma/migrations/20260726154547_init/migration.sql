-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "profilePicture" TEXT
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "createdAt" INTEGER NOT NULL,
    "lastActive" INTEGER NOT NULL,
    CONSTRAINT "Session_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "repo" TEXT,
    "branch" TEXT,
    "createdAt" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    "siteUser" TEXT NOT NULL,
    "siteDomain" TEXT NOT NULL,
    CONSTRAINT "Version_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "CustomDomain_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepoHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repo" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "lastUsed" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "RepoHistory_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StarredBy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    CONSTRAINT "StarredBy_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Site_userUsername_domain_key" ON "Site"("userUsername", "domain");

-- CreateIndex
CREATE INDEX "Version_siteId_idx" ON "Version"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_siteId_domain_key" ON "CustomDomain"("siteId", "domain");

-- CreateIndex
CREATE INDEX "RepoHistory_siteId_idx" ON "RepoHistory"("siteId");

-- CreateIndex
CREATE INDEX "StarredBy_siteId_idx" ON "StarredBy"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "StarredBy_siteId_username_key" ON "StarredBy"("siteId", "username");
