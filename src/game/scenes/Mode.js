import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Mode extends Scene
{
    constructor ()
    {
        super('Mode');
    }

    preload() {
        this.load.image('back', 'assets/back.png');
        this.load.image('magnifying', 'assets/magnifying.png');
        this.load.image('storymode', 'assets/storymode.png');      // Add this line
        this.load.image('multimode', 'assets/multimode.png');      // Add this line
    }

    create ()
    {
        // Set background color
        this.cameras.main.setBackgroundColor('#fa821a');

        // Header text "MODE" centered at the top
        const headerY = this.cameras.main.height * 0.22;
        const headerText = this.add.text(this.cameras.main.width / 2, headerY, 'MODE', {
            fontSize: '68px',
            color: '#fff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add star images on both sides of the header
        this.load.image('star', 'assets/star.png'); // Make sure star.png is preloaded in preload()
        // If not, add: this.load.image('star', 'assets/star.png'); in preload()

        // Place stars to the left and right of the header
        const starOffsetX = 126;
        const starY = headerY;
        this.add.image(headerText.x - starOffsetX, starY, 'star')
            .setOrigin(0.5)
            .setScale(0.13)
            .setDepth(101);
        this.add.image(headerText.x + starOffsetX, starY, 'star')
            .setOrigin(0.5)
            .setScale(0.13)
            .setDepth(101);

        // Center Y for both buttons
        const buttonY = this.cameras.main.height*0.55;

        // Storyboard button on the left side
        const storyboardBtn = this.add.image(this.cameras.main.width * 0.265, buttonY, 'storymode')
            .setOrigin(0.5)
            .setScale(0.145) // smaller size
            .setInteractive({ useHandCursor: true })
            .setDepth(50);
        storyboardBtn.on('pointerdown', () => {
            window.open('/storyboard', '_blank');
        });

        // Multiplayer Mode button on the right side
        const multiplayerBtn = this.add.image(this.cameras.main.width * 0.715, buttonY, 'multimode')
            .setOrigin(0.5)
            .setScale(0.145) // smaller size
            .setInteractive({ useHandCursor: true })
            .setDepth(50);
        multiplayerBtn.on('pointerdown', () => {
            this.scene.start('Game');
        });

        // Back arrow button (slightly lower)
        const arrow = this.add.text(60, 90, '<', {
            fontSize: '48px',
            color: '#ffffffff',
            align: 'Left',
            borderRadius: 12
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

        arrow.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Magnifying glass button (top right)
        const magnifyingBtn = this.add.image(this.cameras.main.width - 60, 80, 'magnifying')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(70)
            .setInteractive({ useHandCursor: true });

        magnifyingBtn.on('pointerdown', () => {
            if (this.popupContainer) return;
            this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
                .setOrigin(0.5).setDepth(299);
            const popupBox = this.add.rectangle(512, 320, 500, 200, 0xffffff, 1)
                .setOrigin(0.5).setDepth(300);
            this.popupText = this.add.text(512, 320, 'Popup Content Here', {
                fontSize: '28px',
                color: '#222',
                wordWrap: { width: 440 }
            }).setOrigin(0.5).setDepth(301);
            this.closeBtn = this.add.text(512, 410, 'Close', {
                fontSize: '24px',
                color: '#FFD700',
                backgroundColor: '#333',
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
                borderRadius: 8
            }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });
            this.closeBtn.on('pointerdown', () => {
                this.popupContainer.destroy();
                popupBox.destroy();
                this.popupText.destroy();
                this.closeBtn.destroy();
                this.popupContainer = null;
                this.popupText = null;
                this.closeBtn = null;
            });
        });
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
