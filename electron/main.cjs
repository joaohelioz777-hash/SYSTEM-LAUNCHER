const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const https = require("node:https");
const extract = require("extract-zip");
const { execFile } = require("node:child_process");

const {
  initializeDatabase, getAllGames, addGame,
  updateInstallPath, deleteGame, toggleFavorite, updateGameCover
} = require("./database.cjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1000, minHeight: 650,
    backgroundColor: "#090b10", title: "System Launcher", autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });

  if (!app.isPackaged) {
    win.loadURL("http://127.0.0.1:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Função para baixar arquivos (lida com redirecionamento do GitHub)
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Segue o redirecionamento do GitHub para o arquivo real
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// --- IPC HANDLERS ---

ipcMain.handle("games:get-all", () => getAllGames());

ipcMain.handle("games:add-by-url", (_, { name, url, platform }) => {
  addGame({ name, download_url: url, platform });
  return getAllGames();
});

ipcMain.handle("games:delete", (_, id) => {
  deleteGame(id);
  return getAllGames();
});

ipcMain.handle("games:toggle-favorite", (_, id) => {
  toggleFavorite(id);
  return getAllGames();
});

ipcMain.handle("games:play", async (_, game) => {
  const gamesDir = path.join(app.getPath("userData"), "installed_games");
  if (!fs.existsSync(gamesDir)) fs.mkdirSync(gamesDir, { recursive: true });

  const gameFolder = path.join(gamesDir, `game_${game.id}`);
  
  // Se não foi instalado ainda, baixa e extrai
  if (!fs.existsSync(gameFolder)) {
    const zipPath = path.join(gamesDir, `temp_${game.id}.zip`);
    
    try {
      await downloadFile(game.download_url, zipPath);
      await extract(zipPath, { dir: gameFolder });
      fs.unlinkSync(zipPath); // Remove o zip após extrair
      updateInstallPath(game.id, gameFolder);
    } catch (error) {
      console.error("Erro no download/extração:", error);
      return { success: false, error: "Falha ao baixar ou extrair o jogo." };
    }
  }

  // Procura o executável
  let exePath = null;
  const files = fs.readdirSync(gameFolder);
  const exeFile = files.find(f => f.endsWith(".exe"));

  if (exeFile) {
    exePath = path.join(gameFolder, exeFile);
  } else {
    // Se não achou na raiz, procura em subpastas (ex: Jogo/bin/jogo.exe)
    const findExe = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findExe(fullPath);
          if (found) return found;
        } else if (item.endsWith(".exe")) {
          return fullPath;
        }
      }
      return null;
    };
    exePath = findExe(gameFolder);
  }

  if (!exePath) {
    return { success: false, error: "Nenhum arquivo .exe encontrado no jogo." };
  }

  execFile(exePath, (err) => {
    if (err) console.error("Erro ao abrir jogo:", err);
  });

  return { success: true };
});

ipcMain.handle("games:select-cover", async (_, id) => {
  const result = await dialog.showOpenDialog({
    title: "Escolher capa", properties: ["openFile"],
    filters: [{ name: "Imagens", extensions: ["jpg", "png", "jpeg", "webp"] }]
  });

  if (result.canceled || result.filePaths.length === 0) return getAllGames();

  const sourcePath = result.filePaths[0];
  const ext = path.extname(sourcePath);
  const destPath = path.join(app.getPath("userData"), `cover_${id}${ext}`);
  
  fs.copyFileSync(sourcePath, destPath);
  updateGameCover(id, destPath);

  return getAllGames();
});

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });