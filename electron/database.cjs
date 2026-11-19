const Database = require("better-sqlite3");
const path = require("node:path");
const { app } = require("electron");

let db;

function initializeDatabase() {
  const databasePath = path.join(app.getPath("userData"), "system-launcher.db");
  db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Tabela adaptada para jogos via URL (Cloud/GitHub)
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      download_url TEXT NOT NULL UNIQUE,
      install_path TEXT,
      platform TEXT NOT NULL DEFAULT 'Não identificado',
      cover_url TEXT,
      is_favorite INTEGER DEFAULT 0,
      added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

function getDatabase() {
  if (!db) throw new Error("Banco de dados não inicializado.");
  return db;
}

function getAllGames() {
  return getDatabase().prepare("SELECT * FROM games ORDER BY added_at DESC").all();
}

function addGame(game) {
  const result = getDatabase().prepare(`
    INSERT OR IGNORE INTO games (name, download_url, platform)
    VALUES (@name, @download_url, @platform)
  `).run({
    name: game.name,
    download_url: game.download_url,
    platform: game.platform
  });
  return result.changes > 0;
}

function updateInstallPath(id, installPath) {
  getDatabase().prepare("UPDATE games SET install_path = ? WHERE id = ?").run(installPath, id);
}

function deleteGame(id) {
  return getDatabase().prepare("DELETE FROM games WHERE id = ?").run(id).changes > 0;
}

function toggleFavorite(id) {
  getDatabase().prepare("UPDATE games SET is_favorite = NOT is_favorite WHERE id = ?").run(id);
  return getDatabase().prepare("SELECT * FROM games WHERE id = ?").get(id);
}

function updateGameCover(id, cover_url) {
  getDatabase().prepare("UPDATE games SET cover_url = ? WHERE id = ?").run(cover_url, id);
  return getDatabase().prepare("SELECT * FROM games WHERE id = ?").get(id);
}

module.exports = {
  initializeDatabase, getAllGames, addGame,
  updateInstallPath, deleteGame, toggleFavorite, updateGameCover
};