// scenes/Chapter4.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';

export class Chapter4 extends Scene {
  constructor() {
    super("Chapter4");
    this.characterSprites = {};
    this.currentLine = 0;
    this.dialogueUI = null;
    this.hasShaken = false;
  }

  preload() {
    this.load.image('Chapter4scene1', 'assets/Chapter4scene1.png');
    this.load.video('heartbeat', 'assets/heartbeat.mp4');
    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    this.load.image('book', 'assets/book.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.coverImage = this.add.image(0, 0, 'Chapter4scene1')
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.heartVideo = this.add.video(512, 300, 'heartbeat')
      .setOrigin(0.5)
      .setDepth(1)
      .setScale(0.7)
      .setPaused(true);

    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 }
      }
    ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.script = [
      { speaker: "Narrator", text: "Boom... boom... boom... 💓\nCan you feel that?" },
      { speaker: "Narrator", text: "That’s your pulse — the steady rhythm your heart makes as it pumps blood!" },
      { speaker: "Narrator", text: "Every time your heart beats, blood rushes through your arteries.\nIt’s like the body's natural drumbeat 🥁 keeping everything in sync!" },
      { speaker: "Narrator", text: "And guess what?\nYour pulse changes all the time — it speeds up 🏃 when you move, and slows down 🛌 when you rest." },
      { speaker: "Narrator", text: "When you're chillin’ on the couch? 🛌 → Slow pulse.\nWhen you're running from zombies? 🦟‍♂️🚨 → Super fast!" },
      { speaker: "Narrator", text: "Now it’s your mission to match your heartbeat to the activity shown." },
      { speaker: "Narrator", text: "Tap in rhythm — not too fast, not too slow — and keep that heart beating strong! 💪💗" },
    ];

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });

    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });
  }

  startStorySequence() {
    if (!this.dialogueUI) this.dialogueUI = new DialogueUI(this);

    this.nextButton = this.add.text(900, 680, '▶ Next', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.backButton = this.add.text(820, 680, '◀ Back', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: '#333', padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    this.nextButton.on('pointerdown', () => this.dialogueUI.advance());
    this.backButton.on('pointerdown', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-RIGHT', () => this.dialogueUI.advance());
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.currentLine > 0) {
        this.currentLine -= 2;
        if (this.currentLine < 0) this.currentLine = 0;
        this.showCurrentLine();
      }
    });

    this.showCurrentLine();
  }

  showCurrentLine() {
    if (this.currentLine >= this.script.length) {
      this.heartVideo.destroy();
      this.triggerGamePopup();
      return;
    }

    const line = this.script[this.currentLine];

    // Adjust heart playback speed
    if (this.heartVideo) {
      if (line.text.includes("rest") || line.text.includes("chillin")) {
        this.heartVideo.setPaused(false);
        this.heartVideo.setPlaybackRate(0.8);
      } else if (line.text.includes("running") || line.text.includes("zombies")) {
        this.heartVideo.setPaused(false);
        this.heartVideo.setPlaybackRate(1.6);
      } else {
        this.heartVideo.setPaused(false);
        this.heartVideo.setPlaybackRate(1.0);
      }
    }

    this.backButton.setVisible(this.currentLine > 0);

    this.dialogueUI.onLineComplete = () => {
      this.currentLine++;
      this.showCurrentLine();
    };

    this.dialogueUI.startDialogue([line]);
  }

  triggerGamePopup() {
    if (this.hasShaken) return;
    this.hasShaken = true;

    this.cameras.main.shake(900, 0.04);
    this.time.delayedCall(1400, () => {
      const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7)
        .setOrigin(0.5).setInteractive().setDepth(1000);
      const popup = this.add.rectangle(512, 384, 880, 500, 0xffffff, 1)
        .setOrigin(0.5).setDepth(1001);
      const text = this.add.text(512, 350,
        "Quest 4: Match the Pulse!\nTap the screen in rhythm with different activities.\nToo slow or too fast, and you’ll lose points.\n\nStay in sync — keep the heart healthy!",
        {
          fontSize: '22px', color: '#222', align: 'center', wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(1002);

      const startBtn = this.add.text(512, 500, 'Start Game', {
        fontSize: '28px', color: '#FFD700', backgroundColor: '#333',
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      }).setOrigin(0.5).setDepth(1003).setInteractive({ useHandCursor: true });

      startBtn.on('pointerdown', () => {
        this.scene.start('Chapter4game');
      });
    });
  }
}
