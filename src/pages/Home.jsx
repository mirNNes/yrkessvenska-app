import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="welcome">

        <h1>Välkommen!</h1>

        <p className="welcome__text">
          Träna svenska för jobbet i simhallen  i din egen takt.
        </p>

        <img
          src="/images/pool.jpg"
          alt="Arbete i simhall"
          className="welcome__image"
        />

        <div className="welcome__box">
          <p>Välj en modul</p>
          <p>Träna steg för steg</p>
          <p>Gå vidare när du är klar</p>
        </div>

        <p className="welcome__motivation">
          Små steg varje dag gör stor skillnad.
        </p>

        <Link to="/modules" className="start-button">
          Börja träna
        </Link>
      </section>
    </main>
  );
}
export default Home;
