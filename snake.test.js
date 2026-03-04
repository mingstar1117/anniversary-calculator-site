import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  setDirection,
  step,
  spawnFood,
} from './gameLogic.js';

test('snake moves one step in current direction', () => {
  const state = createInitialState(8, 8);
  const next = step(state, () => 0);

  assert.deepEqual(next.snake[0], { x: state.snake[0].x + 1, y: state.snake[0].y });
  assert.equal(next.score, 0);
});

test('snake grows and score increments after eating food', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 3, y: 2 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = step(state, () => 0);

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, { x: 3, y: 2 });
});

test('wall collision sets gameOver', () => {
  const state = {
    ...createInitialState(4, 4),
    snake: [{ x: 3, y: 1 }],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
  };

  const next = step(state, () => 0);
  assert.equal(next.gameOver, true);
});

test('self collision sets gameOver', () => {
  const state = {
    width: 5,
    height: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
    ],
    direction: 'UP',
    nextDirection: 'DOWN',
    food: { x: 4, y: 4 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = step(state, () => 0);
  assert.equal(next.gameOver, true);
});

test('cannot reverse direction in one turn', () => {
  const state = createInitialState(8, 8);
  const next = setDirection(state, 'LEFT');
  assert.equal(next.nextDirection, 'RIGHT');
});

test('food spawn never uses occupied cell', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = spawnFood(4, 2, snake, () => 0);
  assert.deepEqual(food, { x: 3, y: 0 });
});
