-- Up
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'free',
    pfp TEXT NOT NULL DEFAULT 'https://i.imgur.com/w65Dpnw.png',
    banned TEXT,
    twofactor TINYINT NOT NULL DEFAULT 0,
    googleAuthCode TEXT,
    darkmode TINYINT NOT NULL DEFAULT 0,
    expiry INTEGER,
    admin TINYINT NOT NULL DEFAULT 0,
    last_ip TEXT,
    userId INTEGER KEY REFERENCES discordAccounts(id)
)

