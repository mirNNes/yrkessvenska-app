import { Link } from "react-router-dom";
import { moduleRegistry } from "../modules/registry";
import "./ModulesPage.css";

function ModulesPage() {
  return (
    <main className="modules-page">
      <header className="modules-header">
        <Link to="/" className="back-link">
          ← Till startsidan
        </Link>

        <p className="modules-header__tag">Träningsmoduler</p>

        <h1>Vad vill du träna?</h1>

        <p className="modules-header__text">
          Välj en modul och träna din svenska.
        </p>
      </header>

      <section className="module-grid" aria-label="Lista med moduler">
        {moduleRegistry.map((module) => (
          <Link
            key={module.id}
            to={`/module/${module.id}`}
            className="module-card"
          >
            {/* 🖼️ Bild */}
            <div className="module-card__image-wrapper">
              <img
                src={module.image}
                alt={module.title}
                className="module-card__image"
              />

              <span className="module-card__category">
                {module.category}
              </span>
            </div>

            {/* 📦 Innehåll */}
            <div className="module-card__content">
              <h2>{module.title}</h2>
              <p>{module.description}</p>

              <span className="module-card__action">
                Börja träna →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default ModulesPage;
