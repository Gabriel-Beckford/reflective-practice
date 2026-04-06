(() => {
  const runtime = window.DeckAppRuntime;
  if (!runtime || typeof runtime.bootstrap !== "function") {
    throw new Error("Deck runtime is unavailable. Ensure js/deck/app-runtime.js is loaded before deck.js.");
  }
  runtime.bootstrap();
})();
