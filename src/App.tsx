import { useState, useEffect } from "react";
import { api } from "./services/api";
import type { Game } from "./types";
import { Sidebar } from "./components/Sidebar";
import { GameCard } from "./components/GameCard";

const platforms = [
  "Todos", "PC", "PlayStation 1", "PlayStation 2",
  "PlayStation 3", "PlayStation 4", "PSP",
  "Nintendo Wii", "Nintendo Switch"
];

const platformOptions = platforms.filter(p => p !== "Todos");

function App() {
  const [activeMenu, setActiveMenu] = useState("biblioteca");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newGameUrl, setNewGameUrl] = useState("");
  const [newGamePlatform, setNewGamePlatform] = useState("PC");

  useEffect(() => {
    api.getGames().then(setGames).catch(console.error);
  }, []);

  async function handleAddGameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newGameName || !newGameUrl) return;

    try {
      setLoading(true);
      const allGames = await api.addByUrl(newGameName, newGameUrl, newGamePlatform);
      setGames(allGames);
      setIsModalOpen(false);
      setNewGameName("");
      setNewGameUrl("");
      setNewGamePlatform("PC");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar jogo.");
    } finally {
      setLoading(false);
    }
  }

  let filteredGames = games;

  if (activeMenu === "favoritos") {
    filteredGames = filteredGames.filter((g) => g.is_favorite === 1);
  }

  if (activeFilter !== "Todos") {
    filteredGames = filteredGames.filter((g) => g.platform === activeFilter);
  }

  return (
    <div className="app">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">SUA COLEÇÃO /</span>
            <h1>{activeMenu === "favoritos" ? "Meus Favoritos" : "Biblioteca de jogos"}</h1>
          </div>
          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            + Adicionar Jogo
          </button>
        </header>

        <section className="welcome">
          <div>
            <span className="eyebrow">SEU UNIVERSO GAMER</span>
            <h2>Todos os seus jogos.<br />Em um só lugar.</h2>
            <p>Organize sua coleção. Baixe e jogue direto pelo launcher.</p>
          </div>
          <div className="welcome-symbol">S</div>
        </section>

        <section className="library">
          <div className="library-heading">
            <div>
              <h2>Minha coleção</h2>
              <p>Clique no botão de baixar para instalar e jogar.</p>
            </div>
            <span className="game-count">{filteredGames.length} JOGOS</span>
          </div>

          <div className="filters">
            {platforms.map((platform) => (
              <button
                key={platform}
                className={activeFilter === platform ? "filter selected" : "filter"}
                onClick={() => setActiveFilter(platform)}
              >
                {platform}
              </button>
            ))}
          </div>

          {filteredGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <h3>Nenhum jogo encontrado</h3>
              <p>Adicione um jogo via URL para começar.</p>
            </div>
          ) : (
            <div className="game-grid">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} onUpdate={setGames} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE ADICIONAR JOGO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Adicionar novo jogo</h2>
            <form onSubmit={handleAddGameSubmit}>
              <label>
                Nome do jogo:
                <input 
                  type="text" 
                  value={newGameName} 
                  onChange={e => setNewGameName(e.target.value)} 
                  placeholder="Ex: GTA San Andreas" 
                  required 
                />
              </label>
              <label>
                URL do arquivo (.zip):
                <input 
                  type="url" 
                  value={newGameUrl} 
                  onChange={e => setNewGameUrl(e.target.value)} 
                  placeholder="https://github.com/.../jogo.zip" 
                  required 
                />
              </label>
              <label>
                Plataforma:
                <select value={newGamePlatform} onChange={e => setNewGamePlatform(e.target.value)}>
                  {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              
              <div className="modal-actions">
                <button type="button" className="action-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="add-button" disabled={loading}>
                  {loading ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;