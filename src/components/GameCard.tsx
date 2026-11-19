import React, { useState } from "react";
import type { Game } from "../types";
import { api } from "../services/api";

interface GameCardProps {
  game: Game;
  onUpdate: (games: Game[]) => void;
}

export function GameCard({ game, onUpdate }: GameCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePlay(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setIsPlaying(true);
    const result = await api.playGame(game);
    setIsPlaying(false);
    
    if (!result.success) {
      alert(result.error || "Erro ao iniciar o jogo.");
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Deseja remover "${game.name}" da biblioteca?`)) {
      const updated = await api.deleteGame(game.id);
      onUpdate(updated);
    }
  }

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    const updated = await api.toggleFavorite(game.id);
    onUpdate(updated);
  }

  async function handleCover(e: React.MouseEvent) {
    e.stopPropagation();
    const updated = await api.selectCover(game.id);
    onUpdate(updated);
  }

  const coverSrc = game.cover_url ? `file://${game.cover_url.replace(/\\/g, "/")}` : null;
  const isInstalled = !!game.install_path;

  return (
    <div className="game-card">
      <div className="game-cover" onClick={() => handlePlay()}>
        {coverSrc ? (
          <img src={coverSrc} alt={game.name} />
        ) : (
          <div className="game-cover-placeholder" onClick={handleCover}>
            <span>+ Adicionar Capa</span>
          </div>
        )}
      </div>

      <div className="game-info">
        <div className="game-header">
          <h3>{game.name}</h3>
          <button
            className={`fav-btn ${game.is_favorite ? "active" : ""}`}
            onClick={handleFavorite}
          >
            ♡
          </button>
        </div>
        <p>{game.platform}</p>
        
        <button 
          className="action-btn play-btn" 
          onClick={handlePlay} 
          disabled={isPlaying}
          style={{ 
            marginTop: '10px', 
            backgroundColor: isInstalled ? '#202532' : '#df303b', 
            color: 'white',
            fontWeight: 'bold',
            padding: '10px'
          }}
        >
          {isPlaying ? "Aguarde..." : isInstalled ? "▶ Jogar" : "☁ Baixar e Jogar"}
        </button>
        
        <div className="game-actions">
          <button className="action-btn" onClick={handleCover}>Capa</button>
          <button className="action-btn danger" onClick={handleDelete}>Excluir</button>
        </div>
      </div>
    </div>
  );
}