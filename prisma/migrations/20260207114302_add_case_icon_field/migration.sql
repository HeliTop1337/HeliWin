/*
  Warnings:

  - You are about to drop the `ArthuntGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `arthuntCharges` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `arthuntLastCharge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `arthuntTrophies` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ArthuntGame_isCompleted_idx";

-- DropIndex
DROP INDEX "ArthuntGame_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ArthuntGame";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "balance", "banReason", "createdAt", "email", "id", "isBanned", "password", "role", "updatedAt", "username") SELECT "avatar", "balance", "banReason", "createdAt", "email", "id", "isBanned", "password", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
