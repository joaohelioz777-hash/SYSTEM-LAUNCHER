interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">S</div>
        <div>
          <h2>SYSTEM</h2>
          <span>GAMING CENTER</span>
        </div>
      </div>

      <p className="section-label">MENU PRINCIPAL</p>
      <button className={`nav ${activeMenu === "biblioteca" ? "active" : ""}`} onClick={() => setActiveMenu("biblioteca")}>
        ▦ Biblioteca
      </button>
      <button className={`nav ${activeMenu === "favoritos" ? "active" : ""}`} onClick={() => setActiveMenu("favoritos")}>
        ♡ Favoritos
      </button>
      <button className="nav">◷ Histórico</button>

      <p className="section-label">SISTEMA</p>
      <button className="nav">🎮 Emuladores</button>
      <button className="nav">⚙ Configurações</button>

      <div className="sidebar-bottom">
        <span>SYSTEM LAUNCHER</span>
        <small>Versão 1.0.0</small>
      </div>
    </aside>
  );
}