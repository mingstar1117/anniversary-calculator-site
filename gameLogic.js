export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function createInitialState(width = 16, height = 16) {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  const food = spawnFood(width, height, snake, () => 0.5);

  return {
    width,
    height,
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food,
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function canTurn(currentDirection, requestedDirection) {
  if (!DIRECTIONS[requestedDirection]) return false;

  const current = DIRECTIONS[currentDirection];
  const requested = DIRECTIONS[requestedDirection];

  return !(current.x + requested.x === 0 && current.y + requested.y === 0);
}

export function setDirection(state, requestedDirection) {
  if (state.gameOver) return state;
  if (!canTurn(state.direction, requestedDirection)) return state;

  return { ...state, nextDirection: requestedDirection };
}

export function togglePause(state) {
  if (state.gameOver) return state;
  return { ...state, paused: !state.paused };
}

export function step(state, randomFn = Math.random) {
  if (state.gameOver || state.paused) return state;

  const direction = state.nextDirection;
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const newHead = { x: head.x + vector.x, y: head.y + vector.y };

  const hitWall =
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= state.width ||
    newHead.y >= state.height;

  if (hitWall) {
    return { ...state, direction, gameOver: true };
  }

  const grows = newHead.x === state.food.x && newHead.y === state.food.y;
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);

  const hitSelf = bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y);

  if (hitSelf) {
    return { ...state, direction, gameOver: true };
  }

  const newSnake = [newHead, ...state.snake];
  if (!grows) {
    newSnake.pop();
  }

  const nextFood = grows ? spawnFood(state.width, state.height, newSnake, randomFn) : state.food;

  return {
    ...state,
    snake: newSnake,
    direction,
    food: nextFood,
    score: grows ? state.score + 1 : state.score,
    gameOver: false,
  };
}

export function spawnFood(width, height, snake, randomFn = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) freeCells.push({ x, y });
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[Math.max(0, Math.min(index, freeCells.length - 1))];
}
