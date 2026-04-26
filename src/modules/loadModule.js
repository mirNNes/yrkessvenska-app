export async function loadModule(moduleId) {
  const basePath = `${import.meta.env.BASE_URL}modules/${moduleId}`;

  const withBasePath = (path, folder) => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return import.meta.env.BASE_URL + path.slice(1);
    return `${basePath}/${folder}/${path}`;
  };

  const normalizeItem = (item) => ({
    ...item,
    image: withBasePath(item.image, "images"),
    audio: withBasePath(item.audio, "audio"),
  });

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
    image: withBasePath(moduleData.image, "images"),
    cover: withBasePath(moduleData.cover, "images"),
    coverImage: withBasePath(moduleData.coverImage, "images"),
    concepts: concepts.map(normalizeItem),
    phrases: phrases.map(normalizeItem),
    fillBlanks,
    quiz,
    situations,
  };
}
