const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("systemLauncher", {
  platform: process.platform,
  version: "1.0.0",
  getGames: () => ipcRenderer.invoke("games:get-all"),
  addByUrl: (name, url, platform) => ipcRenderer.invoke("games:add-by-url", { name, url, platform }),
  deleteGame: (id) => ipcRenderer.invoke("games:delete", id),
  toggleFavorite: (id) => ipcRenderer.invoke("games:toggle-favorite", id),
  playGame: (game) => ipcRenderer.invoke("games:play", game),
  selectCover: (id) => ipcRenderer.invoke("games:select-cover", id)
});