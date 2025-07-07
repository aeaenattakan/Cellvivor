// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';

export class Chapter1 extends Scene{
  constructor() {
    super("Chapter1");
  }

  preload() {
    this.load.image('bg', 'assets/Chapter1scene1.png');
    // In Preloader.js or Chapter1.js preload()
    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    this.load.image('skipafter', 'assets/skipafter.png');
    this.load.image('skipbefore', 'assets/skipbefore.png');
    this.load.image('book', 'assets/book.png');
    this.load.image('5.png', 'assets/5.png');
    this.load.image('6.png', 'assets/6.png');
    this.load.image('7.png', 'assets/7.png');
    this.load.image('8.png', 'assets/8.png');
    this.load.image('9.png', 'assets/9.png');
    // other assets
  }
//   width: 1024, height: 768,
  create() {
    const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;
    //bg.setScale(0.7).getCenter; // Adjust the scale as needed (e.g., 0.5 for half size)
    
    // Add dialogue, choices, animations here
    // this.input.once('pointerdown', () => {
    //   this.scene.start("Chapter2"); // move to next chapter
    // });

    addStoryModeUI(this, {
      //onHowToPlay: (scene, box) => scene.add.text(box.x, box.y, 'Custom How to Play', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    // Save progress when entering Chapter1
    this.saveProgress("Chapter1");
  }

  saveProgress(currentScene) {
    const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));
    if (!user?._id) return;
    fetch('/progress/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, scene: currentScene })
    });
  }
}
