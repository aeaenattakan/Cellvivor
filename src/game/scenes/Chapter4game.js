import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';

export class Chapter4game extends Phaser.Scene {
  constructor() {
    super('Chapter4game');
    this.rounds = [];
    this.currentRound = 0;
    this.score = 0;
    this.hearts = 3;
    this.heartIcons = [];
    this.bpm = 60;
    this.userTapBPM = 0;
    this.bpmDecayTimer = 0;
    this.isTrial = true;
    this.beatTime = 0;
    this.lastTap = 0;
    this.bpmLabel = null;
    this.character = null;
    this.heartImage = null;
    this.progressText = null;
    this.scoreText = null;
    this.accuracyBar = null;
    this.accuracyTween = null;
    this.heartbeatVideo = null;
    this.tapTimes = []; // store recent tap times
    this.maxTaps = 5;

  }

  preload() {
    this.load.image('star', 'assets/star.png');
    this.load.image('relaxing', 'assets/relaxing.png');
    this.load.image('resting', 'assets/resting.png');
    this.load.image('walking', 'assets/walking.png');
    this.load.image('jogging', 'assets/jogging.png');
    this.load.image('running', 'assets/running.png');
    this.load.video('heartbeat', 'assets/heartbeat.mp4');
    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    this.load.image('book', 'assets/book.png');
  }

create() {
  this.cameras.main.setBackgroundColor('#000000');

  this.heartbeatVideo = this.add.video(320,350, 'heartbeat').setDepth(0).setOrigin(0.5);
  this.heartbeatVideo.play(true);
  this.heartbeatVideo.setLoop(true);

  // Horizontal arrow indicator at center
  const arrow = this.add.graphics({ fillStyle: { color: 0xffffff } });
  arrow.fillTriangle(500, 384, 520, 374, 520, 394); // simple right-facing arrow
  arrow.setDepth(105);


  addStoryModeUI(this);
  this.createUI();
    // Add Check BPM button
    this.checkBtn = this.add.text(800, 630, 'Check BPM', {
      fontSize: '24px',
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100);

    this.checkBtn.on('pointerdown', () => {
      if (!this.isTrial && this.userTapBPM > 0) {
        const diff = Math.abs(this.userTapBPM - this.bpm);
        if (diff <= 5) {
          this.score += 10;
          this.scoreText.setText('Score: ' + this.score);
          this.currentRound++;
          this.time.delayedCall(1000, () => this.startRound());
        } else {
          this.loseHeart();
          this.cameras.main.shake(200, 0.01);
          this.time.delayedCall(1000, () => this.startRound());
        }
      }
    });

  this.generateRounds();
  this.startRound();

  this.input.keyboard.on('keydown-SPACE', () => this.handleTap());

  this.input.on('pointerdown', () => this.handleTap());
}


  createUI() {
    this.progressText = this.add.text(80, 100, 'Progress: 0/5', {
  fontSize: '24px',
  color: '#fff',
}).setScrollFactor(0).setDepth(100);

this.scoreText = this.add.text(80, 130, 'Score: 0', {
  fontSize: '24px',
  color: '#fff',
}).setScrollFactor(0).setDepth(100);

    for (let i = 0; i < 3; i++) {
  const heart = this.add.image(100 + i * 40, 70, 'star')
    .setScrollFactor(0)
    .setDisplaySize(28, 28)
    .setDepth(100);
  this.heartIcons.push(heart);
}


    this.bpmLabel = this.add.text(800, 180, 'BPM RATE: --', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

  }

  generateRounds() {
    const rounds = [
      { label: 'Resting', bpm: 70, image: 'resting' },
      { label: 'Walking', bpm: 90, image: 'walking' },
      { label: 'Jogging', bpm: 120, image: 'jogging' },
      { label: 'Running', bpm: 160, image: 'running' }
    ];
    Phaser.Utils.Array.Shuffle(rounds);
    this.rounds = [
      { label: 'Relaxing (Trial)', bpm: 60, image: 'relaxing', trial: true },
      ...rounds.slice(0, 4)
    ];
  }

  startRound() {
    if (this.currentRound >= this.rounds.length) {
      return this.endGame();
    }

    const round = this.rounds[this.currentRound];
    this.bpm = round.bpm;
    this.isTrial = !!round.trial;
    this.progressText.setText(`Round ${this.currentRound + 1} of ${this.rounds.length}`);

    if (this.character) this.character.destroy();
    this.character = this.add.image(800,400, round.image).setScale(0.6);

    this.animateCharacter();
    this.heartbeatVideo.setPlaybackRate(this.bpm / 60);
  }

  animateHeart() {
    this.tweens.add({
      targets: this.heartImage,
      scale: { from: 0.5, to: 0.55 },
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      duration: 60000 / this.bpm
    });
  }

  animateCharacter() {
    this.tweens.add({
      targets: this.character,
      y: '+=15',
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      duration: 60000 / this.bpm
    });
  }

  handleTap() {
const now = this.time.now;
this.tapTimes.push(now);
if (this.tapTimes.length > this.maxTaps) this.tapTimes.shift();

let bpmAvg = 0;
if (this.tapTimes.length >= 4) {
  const intervals = [];
  for (let i = 1; i < this.tapTimes.length; i++) {
    const diff = this.tapTimes[i] - this.tapTimes[i - 1];
    if (diff >= 300 && diff <= 1200) intervals.push(diff);
  }

  if (intervals.length >= 2) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    bpmAvg = Math.round(60000 / avgInterval);
    bpmAvg = Phaser.Math.Clamp(bpmAvg, 50, 160); // absolute bounds
  }
}

this.userTapBPM = bpmAvg;
this.bpmLabel.setText(`BPM RATE: ${bpmAvg || '--'}`);
this.bpmDecayTimer = 0;


  }
  

  animateAccuracyBar(percent) {
    if (this.accuracyTween) this.accuracyTween.stop();
    this.accuracyBar.width = 300 * percent;
    this.accuracyTween = this.tweens.add({
      targets: this.accuracyBar,
      width: 0,
      duration: 1000,
      ease: 'Power1'
    });
  }

  loseHeart() {
    if (this.hearts > 0) {
      this.hearts--;
      const heart = this.heartIcons[this.hearts];
      this.tweens.add({ targets: heart, alpha: 0, duration: 300 });
    }
  }

  addHeart() {
    if (this.hearts < 3) {
      const heart = this.heartIcons[this.hearts];
      heart.setAlpha(1);
      this.tweens.add({
        targets: heart,
        scale: 0.06,
        yoyo: true,
        duration: 300,
        onComplete: () => heart.setScale(0.04)
      });
      this.hearts++;
    }
  }

  update(time, delta) {
  if (this.userTapBPM > 0) {
    this.bpmDecayTimer += delta;
    if (this.bpmDecayTimer >= 500) {
      let drop = 1;
      if (this.userTapBPM > 140) drop = 5;
      else if (this.userTapBPM > 100) drop = 3;
      else if (this.userTapBPM > 60) drop = 2;

      this.userTapBPM = Math.max(0, this.userTapBPM - drop);
      this.bpmLabel.setText(`BPM RATE: ${this.userTapBPM}`);
      this.bpmDecayTimer = 0;
    }
  }
}


  endGame() {
    this.scene.start('GameOverScene', { score: this.score });
  }
}
