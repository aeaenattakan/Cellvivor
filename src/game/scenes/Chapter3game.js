// Chapter3game.js
import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';

export class Chapter3game extends Phaser.Scene {
  constructor() {
    super('Chapter3game');
    this.timer = 60;
    this.score = 0;
    this.hearts = 3;
    this.heartIcons = [];
    this.fallingItems = [];
    this.currentItem = null;
    this.isCatching = false;
  }

  preload() {
    this.load.video('bloodflow', 'assets/bloodflow.mp4');
    this.load.image('player', 'assets/player.png');
    this.load.image('star', 'assets/star.png');
    const items = ['bloodclot', 'hormone', 'food', 'waste', 'bacteria', 'poison', 'oxygen'];
    items.forEach(item => this.load.image(item, `assets/${item}.png`));
    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    this.load.image('book', 'assets/book.png');
  }

  create() {
    this.add.video(0, 0, 'bloodflow').setOrigin(0, 0).play(true).setLoop(true);

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Settings', { fontSize: '24px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Book', { fontSize: '24px', color: '#222' }).setOrigin(0.5).setDepth(201)
    });

    this.player = this.physics.add.sprite(512, 560, 'player').setCollideWorldBounds(true).setDisplaySize(64, 64);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.dropKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Target boxes at bottom
    this.targetBoxes = this.physics.add.staticGroup();
    const labels = ['RBC', 'WBC', 'Platelets', 'Plasma'];
    labels.forEach((label, i) => {
      const x = 180 + i * 220;
      const y = 650;
      const box = this.add.rectangle(x, y, 160, 80, 0xffffff, 0.3).setStrokeStyle(2, 0xffffff);
      const text = this.add.text(x, y + 40, label, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
      this.targetBoxes.add(box);
      box.label = label;
    });

    // Stars (hearts) top-left

    for (let i = 0; i < this.hearts; i++) {
      const star = this.add.image(100 + i * 40, 70, 'star').setScrollFactor(0).setDisplaySize(32, 32).setDepth(10);
      this.heartIcons.push(star);
    }


    // HP and Timer
    this.hpText = this.add.text(100, 100, 'HP: 3', { fontSize: '24px', color: '#fff' }).setScrollFactor(0).setDepth(11);
    this.timerText = this.add.text(512, 92, 'Time: 60', { fontSize: '32px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);

    this.startCountdown(() => this.startGame());
  }

  startCountdown(onComplete) {
    const countdownText = this.add.text(512, 384, '', {
      fontSize: '80px',
      color: '#fff'
    }).setOrigin(0.5);

    const numbers = ['3', '2', '1', 'GO!'];
    let index = 0;

    this.time.addEvent({
      delay: 1000,
      repeat: numbers.length - 1,
      callback: () => {
        countdownText.setText(numbers[index]);
        index++;
        if (index === numbers.length) {
          countdownText.destroy();
          onComplete();
        }
      }
    });
  }

  startGame() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timer--;
        this.timerText.setText('Time: ' + this.timer);
        if (this.timer <= 0) this.endGame(true);
      }
    });

    this.time.addEvent({
      delay: 1200,
      loop: true,
      callback: () => this.spawnItem()
    });
  }

  spawnItem() {
    if (this.currentItem) return;
    const itemData = Phaser.Utils.Array.GetRandom([
      { key: 'bloodclot', target: 'Platelets' },
      { key: 'hormone', target: 'Plasma' },
      { key: 'food', target: 'Plasma' },
      { key: 'waste', target: 'Plasma' },
      { key: 'bacteria', target: 'WBC' },
      { key: 'poison', target: 'WBC' },
      { key: 'oxygen', target: 'RBC' },
    ]);

    this.currentItem = this.physics.add.sprite(Phaser.Math.Between(100, 924), 0, itemData.key);
    this.currentItem.setData('target', itemData.target);
    this.currentItem.setVelocityY(100);
  }

  update() {
    if (!this.player || this.timer <= 0) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.dropKey.isDown && this.currentItem && !this.isCatching) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.currentItem.x, this.currentItem.y
      );
      if (dist < 60) {
        this.isCatching = true;
        this.handleDrop();
      }
    }

    if (this.currentItem && this.currentItem.y > 700) {
      this.currentItem.destroy();
      this.currentItem = null;
    }
  }

  handleDrop() {
    const targetBox = this.targetBoxes.getChildren().find(box => {
      return Phaser.Geom.Rectangle.Contains(box.getBounds(), this.player.x, this.player.y);
    });

    const correctTarget = this.currentItem.getData('target');
    const matched = targetBox && targetBox.label === correctTarget;

    if (matched) {
      this.score += 10;
      if (this.hearts < 3) {
        const heart = this.heartIcons[this.hearts];
        heart.setAlpha(1).setVisible(true);
        this.tweens.add({
          targets: heart,
          scale: { from: 0.5, to: 1.2 },
          yoyo: true,
          duration: 300,
          ease: 'Sine.easeInOut'
        });
        this.hearts++;
      }

      const burst = this.add.circle(this.player.x, this.player.y, 10, 0xffffff, 0.5).setDepth(9);
      this.tweens.add({
        targets: burst,
        radius: 60,
        alpha: 0,
        duration: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => burst.destroy()
      });

      const scoreText = this.add.text(this.player.x, this.player.y - 80, '+10', {
        fontSize: '28px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(10);

      this.tweens.add({
        targets: scoreText,
        y: this.player.y - 120,
        alpha: 0,
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => scoreText.destroy()
      });
    } else {
      if (this.hearts > 0) {
        this.hearts--;
        this.tweens.add({
          targets: this.heartIcons[this.hearts],
          alpha: 0,
          duration: 300
        });
      }
    }

    this.hpText.setText('HP: ' + this.hearts);
    this.currentItem.destroy();
    this.currentItem = null;
    this.isCatching = false;

    if (this.hearts <= 0) {
      this.endGame(false);
    }
  }

  endGame(didWin) {
    this.physics.pause();
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7).setDepth(10);
    const msg = didWin ? 'You Win!' : 'Game Over';
    this.add.text(512, 300, msg, {
      fontSize: '48px',
      color: '#fff'
    }).setOrigin(0.5).setDepth(11);

    const btn = this.add.text(512, 400, 'Next', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#333',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      this.scene.start('Chapter4');
    });
  }
}
