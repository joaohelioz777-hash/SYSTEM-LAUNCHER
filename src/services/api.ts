import type { Game } from "../types";

export const api = {
  getGames: () => window.systemLauncher.getGames(),
  addByUrl: (name: string, url: string, platform: string) => window.systemLauncher.addByUrl(name, url, platform),
  deleteGame: (id: number) => window.systemLauncher.deleteGame(id),
  toggleFavorite: (id: number) => window.systemLauncher.toggleFavorite(id),
  playGame: (game: Game) => window.systemLauncher.playGame(game),
  selectCover: (id: number) => window.systemLauncher.selectCover(id),
};