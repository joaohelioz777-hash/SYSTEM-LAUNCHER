export interface Game {
  id: number;
  name: string;
  download_url: string;
  install_path: string | null;
  platform: string;
  added_at: string;
  cover_url: string | null;
  is_favorite: number;
}

export interface SystemLauncherAPI {
  platform: string;
  version: string;
  getGames: () => Promise<Game[]>;
  addByUrl: (name: string, url: string, platform: string) => Promise<Game[]>;
  deleteGame: (id: number) => Promise<Game[]>;
  toggleFavorite: (id: number) => Promise<Game[]>;
  playGame: (game: Game) => Promise<{ success: boolean; error?: string }>;
  selectCover: (id: number) => Promise<Game[]>;
}

declare global {
  interface Window {
    systemLauncher: SystemLauncherAPI;
  }
}