const { test } = require('node:test');
const assert = require('node:assert/strict');
const CF = require('../public/game.js');

test('une partie neuve a un compteur à zéro et dure 10 s par défaut', () => {
  const game = CF.createGame();
  assert.equal(game.clicks, 0);
  assert.equal(game.durationMs, 10000);
});

test('une durée invalide est refusée', () => {
  assert.throws(() => CF.createGame(0));
  assert.throws(() => CF.createGame(-5));
  assert.throws(() => CF.createGame(NaN));
});

test('un clic avant le départ ne compte pas', () => {
  const game = CF.createGame();
  assert.equal(CF.click(game, 100), false);
  assert.equal(game.clicks, 0);
});

test('les clics pendant la partie sont comptés', () => {
  const game = CF.createGame();
  CF.start(game, 0);
  CF.click(game, 100);
  CF.click(game, 5000);
  CF.click(game, 9999);
  assert.equal(game.clicks, 3);
});

test('un clic après la fin ne compte pas', () => {
  const game = CF.createGame();
  CF.start(game, 0);
  assert.equal(CF.click(game, 10000), false);
  assert.equal(CF.click(game, 15000), false);
  assert.equal(game.clicks, 0);
});

test('redémarrer remet le compteur à zéro', () => {
  const game = CF.createGame();
  CF.start(game, 0);
  CF.click(game, 100);
  CF.start(game, 20000);
  assert.equal(game.clicks, 0);
  assert.equal(CF.click(game, 20100), true);
  assert.equal(game.clicks, 1);
});

test('la partie est finie exactement à la durée, pas avant', () => {
  const game = CF.createGame();
  CF.start(game, 0);
  assert.equal(CF.isOver(game, 9999), false);
  assert.equal(CF.isRunning(game, 9999), true);
  assert.equal(CF.isOver(game, 10000), true);
  assert.equal(CF.isRunning(game, 10000), false);
});

test('le temps restant est plein avant le départ et ne descend jamais sous zéro', () => {
  const game = CF.createGame();
  assert.equal(CF.remainingMs(game, 99999), 10000);
  CF.start(game, 0);
  assert.equal(CF.remainingMs(game, 4000), 6000);
  assert.equal(CF.remainingMs(game, 25000), 0);
});

test('les clics par seconde sont arrondis à 2 décimales', () => {
  assert.equal(CF.cps(25, 10000), 2.5);
  assert.equal(CF.cps(1, 3000), 0.33);
  assert.equal(CF.cps(0, 10000), 0);
});

test('le record ne bouge que si le score le dépasse', () => {
  assert.equal(CF.best(null, 12), 12);
  assert.equal(CF.best(12, 30), 30);
  assert.equal(CF.best(30, 8), 30);
});
