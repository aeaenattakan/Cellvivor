import Phaser from 'phaser';
import Chapter1 from './scenes/Chapter1';
import Chapter2 from './scenes/Chapter2';
import Chapter3 from './scenes/Chapter3';
import Chapter4 from './scenes/Chapter4';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: [Chapter1, Chapter2, Chapter3, Chapter4],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

export default game;