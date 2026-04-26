export async function loadModule(moduleId) {
  const basePath = `/modules/${moduleId}`;

  const loadJson = async (path, fallback = null) => {
    const res = await fetch(path);

    if (!res.ok) {
      if (fallback !== null) return fallback;
      throw new Error(`Kunde inte läsa fil: ${path}`);
    }

    return res.json();
  };

  const [moduleData, concepts, phrases, fillBlanks, quiz, situations] =
    await Promise.all([
      loadJson(`${basePath}/module.json`),
      loadJson(`${basePath}/concepts.json`, []),
      loadJson(`${basePath}/phrases.json`, []),
      loadJson(`${basePath}/fill-blanks.json`, []),
      loadJson(`${basePath}/quiz.json`, []),
      loadJson(`${basePath}/situations.json`, []),
    ]);

  return {
    ...moduleData,
    concepts,
    phrases,
    fillBlanks,
    quiz,
    situations,
  };
}
