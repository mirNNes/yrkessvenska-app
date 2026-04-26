import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadModule } from "../modules/loadModule";
import "./ConceptsPage.css";

function ConceptsPage() {
  const { id } = useParams();

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchModule() {
      try {
        setLoading(true);
        setError("");

        const data = await loadModule(id);
        setModuleData(data);
        setCurrentIndex(0);
      } catch {
        setError("Det gick inte att ladda orden.");
      } finally {
        setLoading(false);
      }
    }

    fetchModule();
  }, [id]);

  if (loading) {
    return (
      <main className="concepts-page">
        <p className="status-text">Laddar ord...</p>
      </main>
    );
  }

  if (error || !moduleData?.concepts?.length) {
    return (
      <main className="concepts-page">
        <Link to={`/module/${id}`} className="back-link">
          ← Tillbaka
        </Link>
        <p className="status-text">{error || "Inga ord hittades."}</p>
      </main>
    );
  }

  const concepts = moduleData.concepts;
  const concept = concepts[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === concepts.length - 1;
  const progress = ((currentIndex + 1) / concepts.length) * 100;

  const handlePlayAudio = () => {
    if (!concept.audio) return;

    const audio = new Audio(concept.audio);
    audio.play().catch(() => {
      console.error("Kunde inte spela upp ljudet.");
    });
  };

  return (
    <main className="concepts-page">
      <header className="concepts-header">
        <Link to={`/module/${id}`} className="back-link">
          ← Tillbaka
        </Link>

        <span className="progress-text">
          {currentIndex + 1} av {concepts.length}
        </span>
      </header>

      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="concept-card">
        <div className="concept-image-box">
          {concept.image ? (
            <img src={concept.image} alt={concept.word} />
          ) : (
            <span>Ingen bild</span>
          )}
        </div>

        <div className="concept-content">
          <span className="concept-type">{concept.type}</span>

          <h1>{concept.word}</h1>

          <p>{concept.explanation}</p>

          <button
            className="audio-button"
            onClick={handlePlayAudio}
            disabled={!concept.audio}
          >
            🔊 Lyssna
          </button>
        </div>
      </section>

      <nav className="concept-navigation">
        <button onClick={() => setCurrentIndex((prev) => prev - 1)} disabled={isFirst}>
          ← Föregående
        </button>

        <button onClick={() => setCurrentIndex((prev) => prev + 1)} disabled={isLast}>
          Nästa →
        </button>
      </nav>
    </main>
  );
}

export default ConceptsPage;
