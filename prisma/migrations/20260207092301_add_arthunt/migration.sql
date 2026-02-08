-- CreateTable
CREATE TABLE "ArthuntGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "currentRow" INTEGER NOT NULL,
    "livesRemaining" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "isWon" BOOLEAN NOT NULL,
    "visitedCells" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArthuntGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "updatedAt" DATETIME NOT NULL,
    "arthuntCharges" INTEGER NOT NULL DEFAULT 0,
    "arthuntTrophies" INTEGER NOT NULL DEFAULT 0,
    "arthuntLastCharge" DATETIME
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

-- CreateIndex
CREATE INDEX "ArthuntGame_userId_idx" ON "ArthuntGame"("userId");

-- CreateIndex
CREATE INDEX "ArthuntGame_isCompleted_idx" ON "ArthuntGame"("isCompleted");
