export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;
export const FIGURES_NAMES = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];

export const FIGURES = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0 ,0, 0],
  ],
};

/**
 * Генерация случайного элемента массива 
 * @param {Array} array Массив для поиска случайного элемента 
 * @return Случайный элемент массива
 */
export function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Функция для преобразования позиции фигуры в индекс ячейки на игровом поле
 * @param {Number} row Строка фигуры
 * @param {Number} column Столбец фигуры
 * @returns Индекс ячейки
 */
export function convertPositionToIndex (row, column) {
  return row * BOARD_COLS + column;
}

/**
 * Функция для поворота матрицы на 90deg, путем перебора строк и столбцов
 * @param {Array} matrix Матрица
 * @returns Перевернутая матрицы
 */
export function rotatedMatrix (matrix) {
  const rotatedMatrix = [];
  //Перебираем строки и столбцы матрицы
  for (let i = 0; i < matrix.length; i++) {
    rotatedMatrix[i] = [];
    for (let j = 0; j < matrix.length; j++) {
      rotatedMatrix[i][j] = matrix[matrix.length - j -1][i];
    }
  }
  return rotatedMatrix;
}