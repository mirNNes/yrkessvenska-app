import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ModulesPage from "./pages/ModulesPage";
import ModulePage from "./pages/ModulePage";
import ConceptsPage from "./pages/ConceptsPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-logo">
            Svenska för badvärdar
          </Link>

          <nav className="site-nav">
            <Link to="/">Hem</Link>
            <Link to="/modules">Moduler</Link>
            <button className="site-login">Logga in</button>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/module/:id/concepts" element={<ConceptsPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>© 2026 Yrkessvenska</p>
          <p>Utvecklad av Mirnes Mrso</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
