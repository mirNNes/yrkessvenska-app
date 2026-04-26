import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { loadModule } from "../modules/loadModule";
import { moduleRegistry } from "../modules/registry";
import "./ModulePage.css";

function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const [flippedCards, setFlippedCards] = useState({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState({});
  const [fillBlankChecks, setFillBlankChecks] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [situationProgress, setSituationProgress] = useState({});
  const [shuffledSituationWords, setShuffledSituationWords] = useState({});

  const steps = ["concepts", "phrases", "fillBlanks", "quiz", "situations"];

  useEffect(() => {
    async function fetchModule() {
      try {
        setLoading(true);
        setError("");

        const data = await loadModule(id);

        setModuleData(data);
        setStepIndex(0);
        resetInteractiveState(data);
      } catch (err) {
        setError("Kan inte ladda modulen.");
      } finally {
        setLoading(false);
      }
    }

    fetchModule();
  }, [id]);

  const currentModuleIndex = moduleRegistry.findIndex(
    (module) => module.id === id
  );

  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < moduleRegistry.length - 1
      ? moduleRegistry[currentModuleIndex + 1]
      : null;

  const currentStep = steps[stepIndex];

  const concepts = moduleData?.concepts || [];
  const phrases = moduleData?.phrases || [];
  const fillBlanks = moduleData?.fillBlanks || [];
  const quiz = moduleData?.quiz || [];
  const situations = moduleData?.situations || [];

  const stepTitle = useMemo(() => {
    if (currentStep === "concepts") return "Ord";
    if (currentStep === "phrases") return "Fraser";
    if (currentStep === "fillBlanks") return "Fyll i";
    if (currentStep === "quiz") return "Frågor";
    if (currentStep === "situations") return "Situationer";
    return "";
  }, [currentStep]);

  function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function buildShuffledSituationWords(data) {
    const shuffled = {};

    (data?.situations || []).forEach((situation) => {
      shuffled[situation.id] = shuffleArray(situation.wordBank || []);
    });

    return shuffled;
  }

  function resetInteractiveState(data = moduleData) {
    setFlippedCards({});
    setFillBlankAnswers({});
    setFillBlankChecks({});
    setQuizAnswers({});
    setSituationProgress({});
    setShuffledSituationWords(buildShuffledSituationWords(data));
  }

  function toggleCard(cardKey) {
    setFlippedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  }

  function handleFillBlankChange(itemId, value) {
    setFillBlankAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  function handleFillBlankCheck(item) {
    const userAnswer = (fillBlankAnswers[item.id] || "").trim().toLowerCase();
    const correctAnswer = (item.answer || "").trim().toLowerCase();

    setFillBlankChecks((prev) => ({
      ...prev,
      [item.id]: userAnswer === correctAnswer,
    }));
  }

  function handleQuizSelect(questionId, option, correctAnswer) {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: option,
        isCorrect: option === correctAnswer,
      },
    }));
  }

  function getQuizOptionClass(questionId, option, correctAnswer) {
    const answerState = quizAnswers[questionId];
    const hasAnswered = !!answerState;
    const isSelected = answerState?.selected === option;
    const isCorrect = option === correctAnswer;

    let className = "content-card__option";

    if (hasAnswered) {
      if (isCorrect) className += " is-correct";
      else if (isSelected) className += " is-wrong";
    }

    return className;
  }

  function getSituationBuiltSentence(selectedWords) {
    if (!selectedWords?.length) return "";
    return selectedWords.join(" ");
  }

  function handleSituationWordClick(situationId, wordIndex, targetSentence) {
    const clickedWord = shuffledSituationWords[situationId]?.[wordIndex];

    if (!clickedWord) return;

    setSituationProgress((prev) => {
      const current = prev[situationId] || {
        selectedWords: [],
        usedIndexes: [],
        lastWrongIndex: null,
      };

      const nextSelectedWords = [...current.selectedWords, clickedWord];
      const nextBuiltSentence = getSituationBuiltSentence(nextSelectedWords);
      const isCorrectSoFar = targetSentence.startsWith(nextBuiltSentence);

      if (!isCorrectSoFar) {
        return {
          ...prev,
          [situationId]: {
            ...current,
            lastWrongIndex: wordIndex,
          },
        };
      }

      return {
        ...prev,
        [situationId]: {
          selectedWords: nextSelectedWords,
          usedIndexes: [...current.usedIndexes, wordIndex],
          lastWrongIndex: null,
        },
      };
    });
  }

  function handleSituationReset(situationId) {
    setSituationProgress((prev) => ({
      ...prev,
      [situationId]: {
        selectedWords: [],
        usedIndexes: [],
        lastWrongIndex: null,
      },
    }));

    setShuffledSituationWords((prev) => ({
      ...prev,
      [situationId]: shuffleArray(
        moduleData?.situations?.find((s) => s.id === situationId)?.wordBank || []
      ),
    }));
  }

  function isSituationComplete(situationId, targetSentence) {
    const selectedWords = situationProgress[situationId]?.selectedWords || [];
    const builtSentence = getSituationBuiltSentence(selectedWords);

    return builtSentence === targetSentence;
  }

  function formatInflections(concept) {
    if (!concept.inflections?.length) return "";

    return `(${concept.inflections.join(", ")})`;
  }

  function goNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      resetInteractiveState();
    } else if (nextModule) {
      navigate(`/module/${nextModule.id}`);
    } else {
      navigate("/");
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      resetInteractiveState();
    } else {
      navigate("/");
    }
  }

  if (loading) {
    return (
      <main className="module-page">
        <p>Laddar...</p>
      </main>
    );
  }

  if (error || !moduleData) {
    return (
      <main className="module-page">
        <p>{error || "Modulen finns inte."}</p>
      </main>
    );
  }

  return (
    <main className="module-page">
      <Link to="/" className="module-page__back">
        ← Tillbaka
      </Link>

      <p className="module-page__eyebrow">Modul</p>
      <h1>{moduleData.title}</h1>
      <p className="module-page__description">{moduleData.description}</p>

      <div className="module-page__progress">
        <span>
          Del {stepIndex + 1} av {steps.length}
        </span>
        <strong>{stepTitle}</strong>
      </div>

      <section className="module-page__section">
        <h2>{stepTitle}</h2>

        {currentStep === "concepts" && (
          <div className="module-page__grid">
            {concepts.map((concept) => {
              const cardKey = `concept-${concept.id}`;
              const isFlipped = !!flippedCards[cardKey];
              const displayWord = concept.word || concept.text || concept.name;

              return (
                <button
                  key={concept.id}
                  type="button"
                  className={`flip-card ${isFlipped ? "is-flipped" : ""}`}
                  onClick={() => toggleCard(cardKey)}
                >
                  <div className="flip-card__inner">
                    <div className="flip-card__face flip-card__face--front">
                      {concept.image ? (
                        <img
                          src={concept.image}
                          alt={displayWord}
                          className="flip-card__image"
                        />
                      ) : (
                        <div className="flip-card__placeholder">
                          Klicka för att se ordet
                        </div>
                      )}
                    </div>

                    <div className="flip-card__face flip-card__face--back">
                      <h3>
                        {displayWord}{" "}
                        {concept.inflections?.length > 0 && (
                          <span className="content-card__inflections">
                            {formatInflections(concept)}
                          </span>
                        )}
                      </h3>

                      <p>{concept.explanation}</p>

                      {concept.audio && <audio controls src={concept.audio} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {currentStep === "phrases" && (
          <div className="module-page__grid">
            {phrases.map((phrase) => {
              const cardKey = `phrase-${phrase.id}`;
              const isFlipped = !!flippedCards[cardKey];

              return (
                <button
                  key={phrase.id}
                  type="button"
                  className={`flip-card ${isFlipped ? "is-flipped" : ""}`}
                  onClick={() => toggleCard(cardKey)}
                >
                  <div className="flip-card__inner">
                    <div className="flip-card__face flip-card__face--front">
                      <img
                      src={import.meta.env.BASE_URL + "images/card-front.png"}
                      alt="Kort framsida"
                      className="flip-card__image"
                      />

                      <p>{phrase.explanation}</p>
                    </div>

                    <div className="flip-card__face flip-card__face--back">
                      <img
                        src={import.meta.env.BASE_URL + "images/card-back.png"}
                        alt="Kort baksida"
                        className="flip-card__image"
                      />

                      <h3>{phrase.text}</h3>

                      {phrase.audio && <audio controls src={phrase.audio} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {currentStep === "fillBlanks" && (
          <div className="module-page__grid">
            {fillBlanks.map((item) => {
              const currentValue = fillBlankAnswers[item.id] || "";

              return (
                <div key={item.id} className="content-card">
                  <h3>{item.sentence}</h3>

                  <input
                    type="text"
                    className="content-card__input"
                    value={currentValue}
                    onChange={(e) =>
                      handleFillBlankChange(item.id, e.target.value)
                    }
                    placeholder="Skriv ditt svar här"
                  />

                  <div className="content-card__options">
                    {(item.options || []).map((option, index) => {
                      const isSelected = currentValue === option;

                      return (
                        <button
                          key={index}
                          type="button"
                          className={`content-card__option ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleFillBlankChange(item.id, option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="content-card__check-button"
                    onClick={() => handleFillBlankCheck(item)}
                    disabled={!currentValue.trim()}
                  >
                    Kolla svar
                  </button>

                  {fillBlankChecks[item.id] === true && (
                    <p className="content-card__feedback content-card__feedback--correct">
                      Rätt!
                    </p>
                  )}

                  {fillBlankChecks[item.id] === false && (
                    <p className="content-card__feedback content-card__feedback--wrong">
                      Fel. Rätt svar är: {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {currentStep === "quiz" && (
          <div className="module-page__grid">
            {quiz.map((q) => {
              const hasAnswered = !!quizAnswers[q.id];

              return (
                <div key={q.id} className="content-card">
                  <h3>{q.question}</h3>

                  <div className="content-card__options">
                    {(q.options || []).map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        className={getQuizOptionClass(
                          q.id,
                          option,
                          q.correctAnswer
                        )}
                        onClick={() =>
                          handleQuizSelect(q.id, option, q.correctAnswer)
                        }
                        disabled={hasAnswered}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentStep === "situations" && (
          <div className="module-page__grid">
            {situations.map((s) => {
              const progress = situationProgress[s.id] || {
                selectedWords: [],
                usedIndexes: [],
                lastWrongIndex: null,
              };

              const selectedWords = progress.selectedWords;
              const usedIndexes = progress.usedIndexes;
              const lastWrongIndex = progress.lastWrongIndex;

              const builtSentence = getSituationBuiltSentence(selectedWords);
              const isComplete = isSituationComplete(s.id, s.targetSentence);
              const shuffledWords = shuffledSituationWords[s.id] || [];

              return (
                <div key={s.id} className="content-card">
                  <h3>{s.prompt}</h3>

                  <div className="content-card__answer-box">
                    {builtSentence || "Klicka på orden i rätt ordning"}
                  </div>

                  <div className="content-card__options">
                    {shuffledWords.map((word, index) => {
                      const isUsed = usedIndexes.includes(index);

                      let className = "content-card__option";
                      if (isUsed) className += " is-selected";
                      if (lastWrongIndex === index) className += " is-wrong";

                      return (
                        <button
                          key={`${word}-${index}`}
                          type="button"
                          className={className}
                          onClick={() =>
                            handleSituationWordClick(
                              s.id,
                              index,
                              s.targetSentence
                            )
                          }
                          disabled={isUsed || isComplete}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {lastWrongIndex !== null && !isComplete && (
                    <p className="content-card__feedback content-card__feedback--wrong">
                      Försök igen.
                    </p>
                  )}

                  {isComplete && (
                    <p className="content-card__feedback content-card__feedback--correct">
                      Rätt!
                    </p>
                  )}

                  {selectedWords.length > 0 && !isComplete && (
                    <button
                      type="button"
                      className="content-card__check-button"
                      onClick={() => handleSituationReset(s.id)}
                    >
                      Rensa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="module-page__navigation">
        <button
          onClick={goBack}
          className="module-page__nav-button module-page__nav-button--secondary"
        >
          {stepIndex === 0 ? "Till start" : "Tillbaka"}
        </button>

        <button onClick={goNext} className="module-page__nav-button">
          {stepIndex === steps.length - 1
            ? nextModule
              ? "Nästa modul"
              : "Till start"
            : "Nästa"}
        </button>
      </div>
    </main>
  );
}

export default ModulePage;
