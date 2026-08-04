// Logique pure du jeu : aucun accès au DOM, aucune dépendance.
// Le module s'exporte pour Node (les tests) ET pour le navigateur (window.ClickFast).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ClickFast = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULT_DURATION_MS = 10000;

  function createGame(durationMs = DEFAULT_DURATION_MS) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      throw new Error('durationMs doit être un nombre positif');
    }
    return { durationMs, clicks: 0, startedAt: null };
  }

  function start(game, now) {
    game.startedAt = now;
    game.clicks = 0;
    return game;
  }

  function isRunning(game, now) {
    return game.startedAt !== null && now - game.startedAt < game.durationMs;
  }

  function isOver(game, now) {
    return game.startedAt !== null && now - game.startedAt >= game.durationMs;
  }

  // Un clic ne compte que pendant la partie : ni avant le départ, ni après la fin.
  function click(game, now) {
    if (!isRunning(game, now)) return false;
    game.clicks += 1;
    return true;
  }

  function remainingMs(game, now) {
    if (game.startedAt === null) return game.durationMs;
    return Math.max(0, game.durationMs - (now - game.startedAt));
  }

  // Clics par seconde, arrondi à 2 décimales.
  function cps(clicks, durationMs) {
    return Math.round((clicks / (durationMs / 1000)) * 100) / 100;
  }

  function best(previousBest, score) {
    return previousBest === null || score > previousBest ? score : previousBest;
  }

  return { createGame, start, click, isRunning, isOver, remainingMs, cps, best, DEFAULT_DURATION_MS };
});
