// Точка входа: получение canvas и запуск игры
import {Game} from './core/game.ts';
import './style.css'

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const game = new Game(canvas);
game.start();