import {
  BOARD_ROWS, BOARD_COLS, FIGURES, FIGURES_NAMES, 
  getRandomElement, rotatedMatrix, convertPositionToIndex
} from "./utils.mjs";
import {openModal, closeModal} from './modal.mjs'

//Получаем элементы из DOM
let gameBoard = document.querySelector('.board');
const buttonReset = document.querySelector('.button');
const buttonNewGame = document.getElementById('button-yes');
const buttonCloseModal = document.getElementById('button-no');
const score = document.getElementById('score');

//Начальные состояния
let requestId, timeoutId;
let touchX, touchY;
const stepTouch = 25;

//Объект с методами игры
const Tetris = {
  /**
   * Инициализация игры
   */
  init () {
    Tetris.score = 0;
    Tetris.cells = document.querySelectorAll('.board>div');
    Tetris.board;
    Tetris.figure;
    Tetris.isGameOver = false;
    Tetris.generateBoard();
    Tetris.generateFigure();
    Tetris.addEventListeners();
  },

  /**
   * Слушатели событий
   */
  addEventListeners () {
    //Инициализация игры на ПК с клавиатуры
    document.addEventListener('keydown', onKeyDown);

    //Инициализация игры для мобильной версии
    //Если устройство сенсорное
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      gameBoard.addEventListener('click', () => moveRotate());
    }
    //Определяем стартовые координаты прикосновения 
    gameBoard.addEventListener('touchstart', event => {
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    })
    //Определяем направления движения касания и присваиваем соответствующее движение фигуры
    gameBoard.addEventListener('touchmove', event => {
      event.preventDefault();
      let differenceX = touchX - event.touches[0].clientX;
      let differenceY = touchY - event.touches[0].clientY;

      if (Math.abs(differenceX) >= stepTouch) {
        if (differenceX > 0) { 
          moveLeft();
        } else { 
          moveRight();
        }
        touchX = event.touches[0].clientX;
      }

      if (Math.abs(differenceY) >= stepTouch) {
        if (differenceY < 0) { 
          moveDown();
        }
        touchY = event.touches[0].clientY;
      }
    })
  },

  removeEventListeners () {
    
  },

  /**
   * Начало игры
   */
  newGame () {
    this.init();
    score.innerHTML = this.score;
    moveDown();
  },

  /**
   * Генерация игрового поля (0 - пустая клетка, 1 - клетка с фигурой)
   */
  generateBoard () {
    this.board = new Array(BOARD_ROWS).fill().map(() => new Array(BOARD_COLS).fill(0));
  },

  /**
   * Генерация фигур
   */
  generateFigure () {
    const name  = getRandomElement(FIGURES_NAMES);
    const matrix = FIGURES[name];
    //Центр стобцов для отрисовки фигуры при движении вниз
    const column = BOARD_COLS / 2 - Math.floor(matrix.length / 2);
    //Смещение при отрисовка (на сколько строк спрятать фигуру за полем)
    const row = -2;
    this.figure = { name, matrix, row, column};
  },

  /**
   * Перемещение фигуры вниз
   */
  moveDownFigure () {
    this.figure.row += 1;
    if (!this.isValid()) {
      this.figure.row -= 1;
      this.placeFigure();
    }
  },

  /**
   * Перемещение фигуры влево
   */
  moveLeftFigure () {
    this.figure.column -= 1;
    if (!this.isValid()) {
      this.figure.column += 1;
    }
  },

  /**
   * Перемещение фигуры вправо
   */
  moveRightFigure () {
    this.figure.column += 1;
    if (!this.isValid()) {
      this.figure.column -= 1;
    } 
  },

  /**
   * Вращение фигуры 
   */
  rotateFigure () {
    const oldMatrix = this.figure.matrix;
    const rotateMatrix = rotatedMatrix(this.figure.matrix);
    this.figure.matrix = rotateMatrix;
    if (!this.isValid()) {
      this.figure.matrix = oldMatrix;
    } 
  },

  /**
   * Метод для размещения фигур на игровом поле
   */
  placeFigure () {
    for (let row = 0; row < this.figure.matrix.length; row++) {
      for (let column = 0; column < this.figure.matrix.length; column++) {
        //Если проверяемый элемент мартицы не часть фигуры (0)
        if (!this.figure.matrix[row][column]) continue;
        //Проверем что часть фигуры не вышла за поле сверху
        if (this.isOutsideOfTopBoard(row)) {
          this.isGameOver = true;
          return;
        };
        //Записываем координаты верхнего левого угла фигуры на игровом полу
        this.board[this.figure.row + row][this.figure.column + column] = this.figure.name;
      }
    }
    this.processFilledRows();
    this.generateFigure();
    this.score += 1;
    score.innerHTML = this.score;
  },

  /**
   * Метод для проверки нахождения части фигуры за верхними пределами игрового поля
   * @param {Number} row Строка матрицы фигуры
   * @returns Булевое значение
   */
  isOutsideOfTopBoard (row) {
    return this.figure.row + row < 0;
  },

  /**
   * Процесс удаления заполненных строк
   */
  processFilledRows () {
    const filledLines = this.findFilledRows();
    this.deleteFilledRows(filledLines);
  },

  /**
   * Метод для определения заполненных строк
   * @returns Массив номеров заполненных строк
   */
  findFilledRows () {
    const filledRows = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (this.board[row].every(cell => Boolean(cell))) {
        filledRows.push(row);
      }
    }
    return filledRows;
  },

  /**
   * Метод для удаления заполненных строк
   * @param {Array} filledRows Массив с номерами заполненных строк
   */
  deleteFilledRows (filledRows) {
    filledRows.forEach(row => this.dropRowsAbove(row))
  },

  /**
   * Метод для смещения всех строк выше - вниз, на одну клетку
   * @param {Number} rowToDelete Номер строки для удаления
   */
  dropRowsAbove (rowToDelete) {
    this.score += 10;
    for (let row = rowToDelete; row > 0; row--) {
      this.board[row] = this.board[row - 1]
    }
    this.board[0] = new Array(BOARD_COLS).fill(0);
  },

  /**
   * Метод для проверки доступности текущего расположения фигуры на игровом поле
   * @returns Булевое значение
   */
  isValid () {
    for (let row = 0; row < this.figure.matrix.length; row++) {
      for (let column = 0; column < this.figure.matrix.length; column++) {
        //Если проверяемый элемент мартицы не часть фигуры (0)
        if (!this.figure.matrix[row][column]) continue;
        //Проверяем что он часть фигуры (1) не за пределами поля
        if (this.isOutsideOfGameBoard(row, column)) return false;
        //Если проверяемый элемент матрицы не накладывается на уже лежащие фигуры на поле
        if (this.isCollides(row, column)) return false;
      }
    }
    return true;
  },

  /**
   * Метод для проверки нахождения части фигуры в пределах игрового поля
   * @param {Number} row Строка матрицы фигуры
   * @param {Number} column Столбец матрицы фигуры
   * @returns Булевое значение
   */
  isOutsideOfGameBoard (row, column) {
    return this.figure.column + column < 0 ||
      this.figure.column + column >= BOARD_COLS ||
      this.figure.row + row >= this.board.length;
  },

  /**
   * Метод для проверки что фигура ничего не касается на игровом поле
   * @param {Number} row Строка матрицы фигуры
   * @param {Number} column Столбец матрицы фигуры
   * @returns Булевое значение элемента поля, там же где и фигура
   */
  isCollides (row, column) {
    return this.board[this.figure.row + row]?.[this.figure.column + column];
  },
}

//Начало игры
Tetris.newGame();

//Сброс игры
buttonReset.addEventListener('click', () => Tetris.newGame());

//Модальное окно
buttonNewGame.addEventListener('click', () => {
  closeModal('modal-new-game');
  Tetris.newGame();
});

buttonCloseModal.addEventListener('click', () => closeModal('modal-new-game'));

/**
 * Перемещение и отрисовка фигур по нажатия на стрелка
 * @param {Event} event Событие
 */
function onKeyDown (event) {
  switch (event.key) {
      case 'ArrowUp':
        moveRotate();
        break;
      case 'ArrowDown':
        moveDown();
        break;
      case 'ArrowLeft': 
        moveLeft();
        break;
      case 'ArrowRight': 
        moveRight();
        break;
      default: break;
    }
}

/**
 * Движение фигуры вниз
 */
function moveDown () {
  Tetris.moveDownFigure();
  updateGameBoard();
  cancelAnimationDown();
  startAnimationDown();

  if (Tetris.isGameOver) {
    gameOver();
  }
}

/**
 * Движение фигуры влево
 */
function moveLeft () {
  Tetris.moveLeftFigure();
  updateGameBoard();
}

/**
 * Движение фигуры вправо
 */
function moveRight () {
  Tetris.moveRightFigure();
  updateGameBoard();
}

/**
 * Вращение фигуры
 */
function moveRotate () {
  Tetris.rotateFigure();
  updateGameBoard();
}

/**
 * Старт анимации падения фигур вниз
 */
function startAnimationDown () {
  timeoutId = setTimeout(() => {
    requestId = requestAnimationFrame(moveDown)
  }, 700);
}

/**
 * Сброс анимации падения
 */
function cancelAnimationDown () {
  cancelAnimationFrame(requestId);
  clearTimeout(timeoutId);
}

/**
 * Отрисовка игры на каждом кадре
 */
function updateGameBoard () {
  Tetris.cells.forEach(cell => cell.removeAttribute('class'));
  buildBoard();
  buildFigure();
}

/**
 * Отрисовка поля
 */
function buildBoard () {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let column = 0; column < BOARD_COLS; column++) {
      //Если проверяемая ячейка поля пустая
      if (!Tetris.board[row][column]) continue;
      const name = Tetris.board[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      Tetris.cells[cellIndex].classList.add(name);
    }
  }
}

/**
 * Отрисовка фигур
 */
function buildFigure () {
  const name = Tetris.figure.name;
  const figureMatrixSize = Tetris.figure.matrix.length;
  //Перебор матрицы фигура двойным циклом
  for (let row = 0; row < figureMatrixSize; row++) {
    for (let column = 0; column < figureMatrixSize; column++) {
      //Если проверяемый элемент мартицы не часть фигуры (0)
      if (!Tetris.figure.matrix[row][column]) continue;
      //Если фигура выходит за пределы игровой матрицы, то такая фигура не нужна для отрисовки
      if (Tetris.figure.row + row < 0) continue;
      //Рассчитываем строку/столбец на которых нужно отрисовать фигуру
      const cellIndex = convertPositionToIndex(Tetris.figure.row + row, Tetris.figure.column + column);
      Tetris.cells[cellIndex].classList.add(name);
    }
  }
}

/**
 * Завершение игры
 */
function gameOver () {
  cancelAnimationDown();
  document.removeEventListener('keydown', onKeyDown);
  gameBoard = gameBoard.cloneNode(true);
  gameOverAnimation();
  openModal('modal-new-game');
}

/**
 * Анимация завершение игры
*/
function gameOverAnimation () {
  const filledCells = [...Tetris.cells].filter(cell => cell.classList.length > 0);
  filledCells.forEach((cell, index) => {
    setTimeout(() => cell.classList.add('hide'), index * 10);
    setTimeout(() => cell.removeAttribute('class'), index * 100 + 500);
  })
}