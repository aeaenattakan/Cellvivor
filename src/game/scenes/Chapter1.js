// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
//import Chapter2 from './Chapter2';

export class Chapter1 extends Scene {
  constructor() {
    super("Chapter1");
    this.coverImage = null;
    this.background = null;
    this.startButton = null;
    this.dialogueUI = null;
    this.script = [];
    this.currentLine = 0;
    this.bgSteps = [
      'Chapter1scene2',
      'bone',
      'bone1',
      'bone2',
      'Bonemarrow',
      'noobysleep',
      'noobywake',
      'CellBorn',
      'Blood'
    ];
    this.bgStepIndex = 0;
  }

  preload() {
    this.load.image('Chapter1scene1', 'assets/Chapter1scene1.png'); // Cover page
    this.load.image('Chapter1scene2', 'assets/Chapter1scene2.png'); // First background
    this.load.image('bone', 'assets/Bone.png');
    this.load.image('bone1', 'assets/Bone1.png');
    this.load.image('bone2', 'assets/Bone2.png');
    this.load.image('Bonemarrow', 'assets/Bonemarrow.png');
    this.load.image('noobysleep', 'assets/noobysleep.png');
    this.load.image('noobywake', 'assets/noobywake.png');
    this.load.video('CellBorn', 'assets/CellBorn.mp4');
    this.load.image('Blood', 'assets/Blood.gif');
    this.load.image('magnifying', 'assets/magnifying.png');
    this.load.image('setting', 'assets/setting.png');
    // this.load.image('skipafter', 'assets/skipafter.png');
    // this.load.image('skipbefore', 'assets/skipbefore.png');
    this.load.image('book', 'assets/book.png');
    this.load.image('5.png', 'assets/5.png');
    this.load.image('6.png', 'assets/6.png');
    this.load.image('7.png', 'assets/7.png');
    this.load.image('8.png', 'assets/8.png');
    this.load.image('9.png', 'assets/9.png');
    // Preload other assets if needed
  }

  create() {
    // Start screen: black background
    this.cameras.main.setBackgroundColor('#000000');

    // Show cover image (Chapter1scene1.png)
    this.coverImage = this.add.image(0, 0, 'Chapter1scene1')
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Add Start button centered
    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 300,
      'Start',
      {
        fontSize: '48px',
        color: '#ffffff',
        padding: { left: 32, right: 32, top: 16, bottom: 16 },
        borderRadius: 12
      }
    )
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    addStoryModeUI(this, {
      onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
      onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201 ),
    });
    // Prepare dialogue script with sceneStep for background changes
    this.script = [
      { speaker: "Narrator", text: "Welcome to your journey inside the body, This is CELLVIVOR." }, //once upon a time
    // bone
    { speaker: "Narrator", text: " a vast network of cells works relentlessly to keep us alive.", sceneStep: 2 },
    { speaker: "Narrator", text: "And here, deep inside, is the marrow.", sceneStep: 3 },
    { speaker: "Narrator", text: "The marrow is bustling with activity.", sceneStep: 4 }, // stays on same scene for 2nd click
    {speaker: "Narrator", text: "☆*: .｡. o(≧▽≦)o .｡.:*☆", sceneStep: 5 }, // noobysleep
    { speaker: "Narrator", text: "You are Noobyzom", sceneStep: 6 }, // noobywake
       { speaker: "Narrator", text: "A newborn red blood cell, just created in the bone marrow, the body’s blood cell factory.", sceneStep: 7 }, // CellBorn
      { speaker: "Narrator", text: "Life begins at a cellular level.", sceneStep: 8 },
      { speaker: "Narrator", text: "Cells multiply, evolve, and form blood.", sceneStep: 9 }
    ];

    // Start button click handler
    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.coverImage.destroy();
      this.startStorySequence();
    });

    // Allow pressing Enter/Space to start
    this.input.keyboard.on('keydown', (event) => {
      if ((event.code === 'Space' || event.code === 'Enter') && this.startButton && this.startButton.active) {
        this.startButton.emit('pointerdown');
      }
    });
  }

  startStorySequence() {
    if (this.background) this.background.destroy();
    this.background = this.add.image(0, 0, this.bgSteps[0])
      .setOrigin(0, 0)
      .setDepth(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    if (!this.dialogueUI) {
      this.dialogueUI = new DialogueUI(this);
    //   // Add NEXT and BACK buttons
    // const nextButton = this.add.text(900, 680, '▶ Next', {
    //   fontSize: '20px',
    //   fill: '#ffffff',
    //   backgroundColor: '#333',
    //   padding: { left: 10, right: 10, top: 5, bottom: 5 }
    // }).setInteractive().setDepth(1000);

    // nextButton.on('pointerdown', () => {
    //   this.dialogueUI.advance();
    // });
//820, 680
    const NextButton = this.add.text(900, 680, '◀ Next', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive().setDepth(1000);

    NextButton.on('pointerdown', () => {
      this.dialogueUI.goBack();
    });

    // Keybinds for keyboard users
    this.input.keyboard.on('keydown-ENTER', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      this.dialogueUI.goBack();
    });

    }

    this.currentLine = 0;
    this.bgStepIndex = 0;

    // Register input listeners for advancing dialogue
    this.input.on('pointerdown', () => this.dialogueUI.advance && this.dialogueUI.advance());
    this.input.keyboard.on('keydown', (event) => {
      if (
        event.code === 'Space' ||
        event.code === 'Enter' ||
        event.code === 'Tab'
      ) {
        if (this.dialogueUI.advance) this.dialogueUI.advance();
      }

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.dialogueUI) this.dialogueUI.advance();
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.dialogueUI) this.dialogueUI.goBack();
    });
    });

    // Start the first line
    this.showCurrentLine();
}

showCurrentLine() {
    if (this.currentLine >= this.script.length) {
        // End of all dialogue
        return;
    }
    const nextLine = this.script[this.currentLine];

    this.dialogueUI.onLineComplete = () => {
        this.currentLine++;
        if (this.currentLine >= this.script.length) {
            // End of all dialogue
            return;
        }
        const followingLine = this.script[this.currentLine];
        // If sceneStep is present and different, change background
        if (
            typeof followingLine.sceneStep === 'number' &&
            followingLine.sceneStep !== this.bgStepIndex &&
            this.bgSteps[followingLine.sceneStep]
        ) {
            this.bgStepIndex = followingLine.sceneStep;

            // Remove previous background
            if (this.background) {
                this.background.destroy();
                this.background = null;
            }
            if (this.bgVideo) {
                this.bgVideo.destroy();
                this.bgVideo = null;
            }

            const bgKey = this.bgSteps[this.bgStepIndex];
            // If the asset is a video (loaded with this.load.video), use video
            if (this.cache.video.exists(bgKey)) {
                this.bgVideo = this.add.video(0, 0, bgKey)
                    .setOrigin(0, 0)
                    .setDepth(0);

                // Wait for the video to be ready before sizing
                this.bgVideo.on('play', () => {
                    const vidWidth = this.bgVideo.video.videoWidth;
                    const vidHeight = this.bgVideo.video.videoHeight;
                    const canvasWidth = this.sys.game.config.width;
                    const canvasHeight = this.sys.game.config.height;

                    // Scale to fit canvas while maintaining aspect ratio
                    let scale = Math.min(canvasWidth / vidWidth, canvasHeight / vidHeight);
                    this.bgVideo.setDisplaySize(vidWidth * scale, vidHeight * scale);
                });

                this.bgVideo.play(true);
                this.bgVideo.setLoop(true);
            } else {
                // Otherwise, use image
                this.background = this.add.image(0, 0, bgKey)
                    .setOrigin(0, 0)
                    .setDepth(0)
                    .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
            }
        }
        this.showCurrentLine();
    };

    this.dialogueUI.startDialogue([nextLine]);
}
}
