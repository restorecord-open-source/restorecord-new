-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'free',
    "pfp" TEXT NOT NULL DEFAULT 'https://i.imgur.com/w65Dpnw.png',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,
    "googleAuthCode" TEXT,
    "darkmode" BOOLEAN NOT NULL DEFAULT true,
    "expiry" DATETIME,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "lastIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER
);
INSERT INTO "new_accounts" ("admin", "banned", "darkmode", "email", "expiry", "googleAuthCode", "id", "lastIp", "password", "pfp", "role", "twoFactor", "userId", "username") SELECT "admin", "banned", "darkmode", "email", "expiry", "googleAuthCode", "id", "lastIp", "password", "pfp", "role", "twoFactor", "userId", "username" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
