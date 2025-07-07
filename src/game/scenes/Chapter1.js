// scenes/Chapter1.js
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { addStoryModeUI } from './UIscene';
import DialogueUI from './DialogueUI';
import Chapter2 from './Chapter2';

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
      'Bonemarrow',
      'CellBorn',
      'Blood'
    ];
    this.bgStepIndex = 0;
  }

  preload() {
    this.load.image('Chapter1scene1', 'assets/Chapter1scene1.png'); // Cover page
    this.load.image('Chapter1scene2', 'assets/Chapter1scene2.png'); // First background
    this.load.image('bone', 'assets/bone.png');
    this.load.image('Bonemarrow', 'assets/Bonemarrow.png');
    this.load.image('CellBorn', 'assets/CellBorn.gif');
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
      { speaker: "Narrator", text: "Welcome to your journey inside the body." , sceneStep: 1},
     { speaker: "Guide", text: "Let’s begin in the bloodstream..." },
     { speaker: "Guide", text: "See the cells moving? That's life in action.", sceneStep: 1 },
      { speaker: "Narrator", text: "Now, let's look at the bone structure.", sceneStep: 2 },
      { speaker: "Guide", text: "And here, deep inside, is the marrow.", sceneStep: 3 },
      { speaker: "Narrator", text: "Life begins at a cellular level.", sceneStep: 4 },
      { speaker: "Narrator", text: "Cells multiply, evolve, and form blood.", sceneStep: 5 }
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

    // Set the callback BEFORE starting the dialogue
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
            this.background.setTexture(this.bgSteps[this.bgStepIndex]);
        }
        this.showCurrentLine();
    };

    this.dialogueUI.startDialogue([nextLine]);
}
}
