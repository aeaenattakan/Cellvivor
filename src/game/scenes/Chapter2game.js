import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';

export class Chapter2game extends Phaser.Scene {
  constructor() {
    super('Chapter2game');
    this.player = null;
    this.cursors = null;
    this.score = 0;
    this.hearts = 3;
    this.questionIndex = 0;
    this.questions = [];
    this.answeredRooms = new Set();
    this.enemies = [];
    this.zones = {};
    this.canCheckZone = false;
  }

  preload() {
    this.load.image('map', 'assets/map.jpg');
    this.load.image('player', 'noobynooby.png');
    this.load.image('enemy', 'assets/star.png');
  }

  create() {
    this.add.image(512, 384, 'map').setDepth(0);

    addStoryModeUI(this, {
      onSettings: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) =>
        scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
    });

    this.questions = Phaser.Utils.Array.Shuffle([
      { room: 'Right Atrium', text: 'The Right Atrium receives blood from the vena cava.' },
      { room: 'Right Ventricle', text: 'The Right Ventricle pumps blood to the lungs.' },
      { room: 'Pulmonary Artery', text: 'The Pulmonary Artery carries blood to the lungs.' },
      { room: 'Lungs', text: 'Oxygen enters red blood cells in the lungs.' },
      { room: 'Left Atrium', text: 'The Left Atrium receives oxygenated blood from the lungs.' },
      { room: 'Left Ventricle', text: 'The Left Ventricle pumps oxygenated blood to the body.' },
      { room: 'Aorta', text: 'The Aorta distributes blood to the whole body.' },
    ]);

    this.player = this.physics.add.sprite(100, 700, 'player');
    this.player.setDisplaySize(64, 64);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.createZones();
    this.createEnemies();

    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', color: '#fff' }).setScrollFactor(0);
    this.heartsText = this.add.text(20, 50, 'Hearts: ❤️❤️❤️', { fontSize: '24px', color: '#fff' }).setScrollFactor(0);
    this.progressText = this.add.text(20, 80, 'Progress: 0/7', { fontSize: '24px', color: '#fff' }).setScrollFactor(0);

    this.askQuestion();
  }

  createZones() {
    const zoneConfig = {
      'Right Atrium': new Phaser.Geom.Rectangle(530, 270, 160, 100),
      'Right Ventricle': new Phaser.Geom.Rectangle(520, 400, 200, 130),
      'Pulmonary Artery': new Phaser.Geom.Rectangle(480, 160, 300, 60),
      'Lungs': new Phaser.Geom.Rectangle(330, 60, 380, 100),
      'Left Atrium': new Phaser.Geom.Rectangle(310, 270, 180, 90),
      'Left Ventricle': new Phaser.Geom.Rectangle(260, 390, 200, 130),
      'Aorta': new Phaser.Geom.Rectangle(360, 550, 300, 100),
    };

    for (const [name, rect] of Object.entries(zoneConfig)) {
      this.zones[name] = rect;
    }
  }

  createEnemies() {
    const positions = [
      { x: 400, y: 300 },
      { x: 600, y: 400 },
    ];

    positions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy');
      enemy.setDisplaySize(48, 48);
      this.enemies.push(enemy);
    });
  }

  askQuestion() {
    if (this.questionIndex >= this.questions.length || this.hearts <= 0) {
      this.endGame();
      return;
    }

    const q = this.questions[this.questionIndex];
    this.showQuestionPopup(q.text);
  }

  showQuestionPopup(questionText) {
    this.physics.pause();
    this.canCheckZone = false;

    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.6).setDepth(10);
    const box = this.add.rectangle(512, 384, 700, 300, 0xffffff).setDepth(11);
    const text = this.add.text(512, 384, questionText, {
      fontSize: '24px',
      color: '#000',
      wordWrap: { width: 660 },
      align: 'center'
    }).setOrigin(0.5).setDepth(12);

    this.input.once('pointerdown', () => {
      overlay.destroy();
      box.destroy();
      text.destroy();
      this.physics.resume();

      this.time.delayedCall(500, () => {
        this.canCheckZone = true;
      });
    });
  }

  update() {
    if (!this.player) return;

    this.handleMovement();

    if (this.canCheckZone) {
      this.checkZoneEntry();
    }

    this.moveEnemies();
    this.checkEnemyCollisions();
  }

  handleMovement() {
    const speed = 160;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  }

  checkZoneEntry() {
    const { x, y } = this.player;
    const current = this.questions[this.questionIndex];

    if (this.answeredRooms.has(current.room)) return;

    const zone = this.zones[current.room];
    if (zone && zone.contains(x, y)) {
      this.answeredRooms.add(current.room);
      this.handleAnswer(true);
    } else {
      for (const [name, z] of Object.entries(this.zones)) {
        if (z.contains(x, y) && name !== current.room) {
          this.handleAnswer(false);
        }
      }
    }
  }

  handleAnswer(correct) {
    if (correct) {
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.showFeedback('Correct!');
      this.questionIndex++;
    } else {
      this.hearts--;
      this.heartsText.setText('Hearts: ' + '❤️'.repeat(this.hearts));
      this.showFeedback('Wrong! Respawning...');
    }

    this.progressText.setText(`Progress: ${this.questionIndex}/7`);
    this.player.setPosition(100, 700);
    this.askQuestion();
  }

  showFeedback(msg) {
    const txt = this.add.text(512, 384, msg, {
      fontSize: '32px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(1500, () => txt.destroy());
  }

  moveEnemies() {
    this.enemies.forEach(enemy => {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const speed = 50;
        enemy.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      }
    });
  }

  checkEnemyCollisions() {
    this.enemies.forEach(enemy => {
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 30) {
        this.handleAnswer(false);
      }
    });
  }

  endGame() {
    this.physics.pause();
    const msg = this.hearts > 0 ? 'You Win!' : 'Game Over!';
    this.add.text(512, 384, msg, {
      fontSize: '48px',
      color: '#fff'
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(3000, () => {
      this.scene.start('Chapter3');
    });
  }
}
