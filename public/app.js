// Câblage DOM : tout ce qui touche à la page vit ici,
// la logique du jeu vit dans game.js (testée par npm test).
(function () {
  const game = ClickFast.createGame();

  const clickBtn = document.getElementById('click-btn');
  const startBtn = document.getElementById('start-btn');
  const timeEl = document.getElementById('time');
  const countEl = document.getElementById('count');
  const resultEl = document.getElementById('result');
  const bestEl = document.getElementById('best');

  let timer = null;
  let bestScore = Number(localStorage.getItem('clickfast-best')) || null;
  renderBest();

  function renderBest() {
    bestEl.textContent = bestScore === null ? '—' : `${bestScore} clics`;
  }

  function render() {
    const now = Date.now();
    timeEl.textContent = (ClickFast.remainingMs(game, now) / 1000).toFixed(1);
    countEl.textContent = game.clicks;

    if (ClickFast.isOver(game, now)) {
      clearInterval(timer);
      clickBtn.disabled = true;
      startBtn.disabled = false;
      startBtn.textContent = 'Rejouer';
      const perSecond = ClickFast.cps(game.clicks, game.durationMs);
      resultEl.textContent = `Fini ! ${game.clicks} clics, soit ${perSecond} clics/s`;
      bestScore = ClickFast.best(bestScore, game.clicks);
      localStorage.setItem('clickfast-best', bestScore);
      renderBest();
    }
  }

  startBtn.addEventListener('click', () => {
    ClickFast.start(game, Date.now());
    resultEl.textContent = '';
    clickBtn.disabled = false;
    startBtn.disabled = true;
    timer = setInterval(render, 100);
    render();
  });

  clickBtn.addEventListener('click', () => {
    ClickFast.click(game, Date.now());
    countEl.textContent = game.clicks;
  });
})();
