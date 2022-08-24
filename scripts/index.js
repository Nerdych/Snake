const $canvas = document.querySelector('#canvas');
const $start = document.querySelector('.start');
const $pause = document.querySelector('.pause');
const $help = document.querySelector('.help');
const $score = document.querySelector('.score');
const $endWrapper = document.querySelector('.end-wrapper');
const $replay = $endWrapper.querySelector('.replay');
const $helpWrapper = document.querySelector('.help-wrapper');
const ctx = $canvas.getContext('2d');

const sizePart = 50;
const speed = 150;
let isStop = true;
let isEnd = false;
let score = 0;
let interval;
let food;
const size = {
	x: Math.floor($canvas.width / sizePart),
	y: Math.floor($canvas.height / sizePart),
};

const headImg = new Image();
headImg.src = 'pictures/Head.svg';
const foodImg = new Image();
foodImg.src = 'pictures/apple.svg';
const eatAppleAudio = new Audio('sound/eatApple.mp3');
const gameOverAudio = new Audio('sound/gameOver.mp3');

const directions = {
	left: 'left',
	right: 'right',
	top: 'top',
	bottom: 'bottom',
};

const buttonsKeyboard = {
	arrowLeft: 'ArrowLeft',
	arrowRight: 'ArrowRight',
	arrowTop: 'ArrowUp',
	arrowBottom: 'ArrowDown',
	space: 'Space',
};

class Cell {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

let snake = {
	direction: directions.bottom,
	body: [new Cell(4, 4, true)],
};

const getRandomInt = max => {
	return Math.floor(Math.random() * max);
};

const drawSnake = () => {
	snake.body.forEach((part, index) => {
		if (index) {
			ctx.fillStyle = '#81A381';
			ctx.fillRect(part.x * sizePart, part.y * sizePart, sizePart, sizePart);
		} else {
			ctx.drawImage(headImg, part.x * sizePart, part.y * sizePart);
		}
	});
};

const drawFood = () => {
	ctx.drawImage(foodImg, food.x * sizePart, food.y * sizePart);
};

const drawTable = () => {
	ctx.strokeStyle = '#375F34';
	ctx.lineWidth = 1;

	for (let i = 1; i < size.x; i++) {
		ctx.beginPath();
		ctx.moveTo(i * sizePart, 0);
		ctx.lineTo(i * sizePart, $canvas.height);
		ctx.stroke();
	}

	for (let i = 0; i < size.y; i++) {
		ctx.beginPath();
		ctx.moveTo(0, i * sizePart);
		ctx.lineTo($canvas.width, i * sizePart);
		ctx.stroke();
	}
};

const nextCoord = (x, y) => {
	switch (snake.direction) {
		case directions.right:
			x += 1;
			if (x === size.x) {
				x = 0;
			}
			break;
		case directions.left:
			x -= 1;
			if (x < 0) {
				x = size.x - 1;
			}
			break;
		case directions.top:
			y -= 1;
			if (y < 0) {
				y = size.y - 1;
			}
			break;
		case directions.bottom:
			y += 1;
			if (y === size.y) {
				y = 0;
			}
			break;
		default:
			return [x, y];
	}

	return [x, y];
};

const checkNewCoord = (x, y) => {
	let isSnakeCoord = false;

	snake.body.forEach(part => {
		if (part.x === x && part.y === y) {
			isSnakeCoord = true;
		}
	});

	return isSnakeCoord;
};

const addFood = () => {
	let x, y;

	do {
		x = getRandomInt(size.x);
		y = getRandomInt(size.y);
	} while (checkNewCoord(x, y));

	food = new Cell(x, y);
};

const checkFood = () => {
	if (snake.body[0].x === food.x && snake.body[0].y === food.y) {
		addFood();
		score++;
		$score.innerHTML = score;
		eatAppleAudio.play();
		return true;
	}
	return false;
};

const moveSnake = () => {
	const isEat = checkFood();
	snake.body.unshift(new Cell(...nextCoord(snake.body[0].x, snake.body[0].y), true));
	if (!isEat) snake.body.pop();
};

const endGame = () => {
	gameOverAudio.play();
	isEnd = true;
	clearInterval(interval);
	$endWrapper.classList.add('visible');
};

const checkEndGame = () => {
	const headPart = snake.body[0];

	for (let i = 1; i < snake.body.length; i++) {
		const currentPart = snake.body[i];
		if (headPart.x === currentPart.x && headPart.y === currentPart.y) {
			endGame();
			return;
		}
	}
};

const engine = () => {
	ctx.clearRect(0, 0, $canvas.width, $canvas.height);
	drawTable();
	moveSnake();
	checkEndGame();
	drawFood();
	drawSnake();
};

const replay = () => {
	snake = {
		direction: directions.bottom,
		body: [new Cell(4, 4, true)],
	};
	isEnd = false;
	score = 0;
	$score.innerHTML = 0;
	$endWrapper.classList.remove('visible');
	startGame();
};

const startGame = () => {
	interval = setInterval(() => {
		engine();
	}, speed);
};

drawTable();
addFood();

document.addEventListener('keydown', e => {
	switch (e.code) {
		case buttonsKeyboard.arrowRight:
			if ((snake.direction != directions.left && !isStop) || snake.body.length === 1)
				snake.direction = directions.right;
			break;
		case buttonsKeyboard.arrowLeft:
			if ((snake.direction != directions.right && !isStop) || snake.body.length === 1)
				snake.direction = directions.left;
			break;
		case buttonsKeyboard.arrowTop:
			if ((snake.direction != directions.bottom && !isStop) || snake.body.length === 1)
				snake.direction = directions.top;
			break;
		case buttonsKeyboard.arrowBottom:
			if ((snake.direction != directions.top && !isStop) || snake.body.length === 1)
				snake.direction = directions.bottom;
			break;
		case buttonsKeyboard.space:
			if (!isEnd) {
				if (!isStop) {
					clearInterval(interval);
					$pause.classList.add('visible');
					isStop = true;
				} else {
					$pause.classList.remove('visible');
					isStop = false;
					startGame();
				}
			}
		default:
			return;
	}
});

$start.addEventListener('click', () => {
	if (!isEnd) {
		startGame();
		$start.classList.add('invisible');
		isStop = false;
	}
});

$replay.addEventListener('click', () => {
	replay();
});

$help.addEventListener('click', () => {
	$helpWrapper.classList.toggle('visible');
});
