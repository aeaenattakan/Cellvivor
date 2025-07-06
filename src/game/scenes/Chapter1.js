// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
//import { Chapter2 } from './Chapter2'; // Import next chapter

export class Chapter1 extends Scene{
  constructor() {
    super("Chapter1");
  }

  preload() {
    this.load.image('bg', 'assets/Chapter1scene1.png');
    // other assets
  }

  create() {
    this.add.image(400, 300, 'bg');
    // Add dialogue, choices, animations here
    // this.input.once('pointerdown', () => {
    //   this.scene.start("Chapter2"); // move to next chapter
    // });

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
