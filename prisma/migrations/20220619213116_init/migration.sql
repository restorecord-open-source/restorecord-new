-- CreateTable
CREATE TABLE "accounts" (
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
    "userId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
