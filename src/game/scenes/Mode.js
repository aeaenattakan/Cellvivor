import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Mode extends Scene
{
    constructor ()
    {
        super('Mode');
    }

    preload() {
        this.load.image('magnifying', 'assets/magnifying.png');
        this.load.image('storymode', 'assets/storymode.png');      
        this.load.image('multimode', 'assets/multimode.png'); 
        this.load.image('NewgameButton', 'assets/NewgameButton.png');
        this.load.image('ContinueButton', 'assets/ContinueButton.png'); 
            this.load.image('5.png', 'assets/5.png');
            this.load.image('6.png', 'assets/6.png');
            this.load.image('7.png', 'assets/7.png');
            this.load.image('8.png', 'assets/8.png');
            this.load.image('9.png', 'assets/9.png');
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
        this.load.image('star', 'assets/star.png');

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
    const storyboardBtn = this.add.image(this.cameras.main.width * 0.265, buttonY, 'storymode')
        .setOrigin(0.5)
        .setScale(0.145)
        .setInteractive({ useHandCursor: true })
        .setDepth(50);

    storyboardBtn.on('pointerdown', () => {
        if (this.popupContainer) return;
        // Popup background
        this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
            .setOrigin(0.5).setDepth(299);
        // White popup box
        const popupBox = this.add.rectangle(512, 320, 500, 250, 0xffffff, 1)
            .setOrigin(0.5).setDepth(300);
        // Popup text
        this.popupText = this.add.text(512, 270, 'continue the story or start again?', {
            fontSize: '28px',
            color: '#222',
            wordWrap: { width: 440 },
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        // New Game Button
        const newGameBtn = this.add.image(512 - 112, 390, 'NewgameButton')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(335)
            .setInteractive({ useHandCursor: true });
        newGameBtn.on('pointerdown', async () => {
            // Get current user
            const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));
            if (!user?._id) return;
            // Reset progress to Chapter1
            await fetch('http://localhost:5000/progress/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, scene: "Chapter1" })
            });
            this.scene.start('Chapter1');
            // Cleanup popup
            this.popupContainer.destroy();
            popupBox.destroy();
            this.popupText.destroy();
            newGameBtn.destroy();
            continueBtn.destroy();
            closeBtn.destroy();
            this.popupContainer = null;
            this.popupText = null;
        });

        // Continue Button
        const continueBtn = this.add.image(512 + 112, 390, 'ContinueButton')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(335)
            .setInteractive({ useHandCursor: true });
        continueBtn.on('pointerdown', async () => {
            // const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));
            // if (!user?._id) return;
            // const res = await fetch(`/progress/load/${user._id}`);
            // const data = await res.json();
            // const sceneToStart = data.lastScene || "Chapter1";
            // this.scene.start(sceneToStart);
            // // Cleanup popup
            // this.popupContainer.destroy();
            // popupBox.destroy();
            // this.popupText.destroy();
            // newGameBtn.destroy();
            // continueBtn.destroy();
            // closeBtn.destroy();
            // this.popupContainer = null;
            // this.popupText = null;
             this.scene.start('Chapter1');
        });

        // "X" Close button at top right of popupBox
        const closeBtn = this.add.text(
            512 + 500 / 2 - 24, // right edge minus some padding
            320 - 250 / 2 + 24, // top edge plus some padding
            '✕',
            {
                fontSize: '32px',
                color: '#888',
                fontStyle: 'bold',
                backgroundColor: '#fff',
                padding: { left: 8, right: 8, top: 2, bottom: 2 },
                borderRadius: 16,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.popupContainer.destroy();
            popupBox.destroy();
            this.popupText.destroy();
            newGameBtn.destroy();
            continueBtn.destroy();
            closeBtn.destroy();
            this.popupContainer = null;
            this.popupText = null;
        });
    });
        // GameMode Button (styled like storyboardBtn)
const gameModeBtn = this.add.image(this.cameras.main.width * 0.715, buttonY, 'multimode')
    .setOrigin(0.5)
    .setScale(0.145)
    .setInteractive({ useHandCursor: true })
    .setDepth(50);

gameModeBtn.on('pointerdown', () => {
    if (this.popupContainer) return;
    // Popup background
    this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
        .setOrigin(0.5).setDepth(299);
    // White popup box
    const popupBox = this.add.rectangle(512, 320, 500, 250, 0xffffff, 1)
        .setOrigin(0.5).setDepth(300);
    // Popup text
    const popupText = this.add.text(512, 270, 'Please choose your role', {
        fontSize: '28px',
        color: '#222',
        wordWrap: { width: 440 },
        align: 'center'
    }).setOrigin(0.5).setDepth(301);

    // Hinter Button
    const hinterBtn = this.add.text(512 - 100, 370, 'Hinter', {
        fontSize: '28px',
        color: '#fff',
        backgroundColor: '#5271ff',
        padding: { left: 24, right: 24, top: 12, bottom: 12 },
        borderRadius: 8
    }).setOrigin(0.5).setDepth(335).setInteractive({ useHandCursor: true });

    // Guesser Button
    const guesserBtn = this.add.text(512 + 100, 370, 'Guesser', {
        fontSize: '28px',
        color: '#fff',
        backgroundColor: '#ee442b',
        padding: { left: 24, right: 24, top: 12, bottom: 12 },
        borderRadius: 8
    }).setOrigin(0.5).setDepth(335).setInteractive({ useHandCursor: true });

    // Close button
    const closeBtn = this.add.text(
        512 + 500 / 2 - 24,
        320 - 250 / 2 + 24,
        '✕',
        {
            fontSize: '32px',
            color: '#888',
            fontStyle: 'bold',
            backgroundColor: '#fff',
            padding: { left: 8, right: 8, top: 2, bottom: 2 },
            borderRadius: 16,
            align: 'center'
        }
    ).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

    // Cleanup helper
    const closePopup = () => {
        this.popupContainer.destroy();
        popupBox.destroy();
        popupText.destroy();
        hinterBtn.destroy();
        guesserBtn.destroy();
        closeBtn.destroy();
        this.popupContainer = null;
    };

    closeBtn.on('pointerdown', closePopup);

    hinterBtn.on('pointerdown', () => {
        closePopup();
        // Go to game page as Hinter (pass role if needed)
        this.scene.start('Game'/*, { hinter : currentUser._id }*/);
    });

    guesserBtn.on('pointerdown', () => {
        closePopup();
        // Go to game page as Guesser (pass role if needed)
        this.scene.start('Game'  /*,{guesser : currentUser._id}*/ );
    });
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
        const magnifyingBtn = this.add.image(this.cameras.main.width - 60, 80, 'magnifying')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(120)
            .setInteractive({ useHandCursor: true });

        magnifyingBtn.on('pointerdown', () => {
            if (this.popupContainer) return;

            // Overlay
            this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.69)
            .setOrigin(0.5).setDepth(199)
            .setInteractive({ useHandCursor: false });

            // Popup box
            const popupBox = this.add.rectangle(512, 370, 850, 550, 0xffffff, 1)
            .setOrigin(0.5).setDepth(200);

            // Slides
            const slides = ['5.png', '6.png', '7.png', '8.png', '9.png'];
            let current = 0;
            const popupDepth = 201;

            let slideImage = this.add.image(512, 370, slides[current])
            .setDisplaySize(850, 550)
            .setDepth(popupDepth);

            // Previous button
            const prevBtn = this.add.text(192, 680, 'Previous', {
            fontSize: '28px',
            color: '#fff',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
            }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

            // Next button
            const nextBtn = this.add.text(832, 680, 'Next', {
            fontSize: '28px',
            color: '#fff',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
            }).setOrigin(0.5).setDepth(popupDepth + 1).setInteractive({ useHandCursor: true });

            // Close popup helper
            const closePopup = () => {
            this.popupContainer.destroy();
            popupBox.destroy();
            slideImage.destroy();
            prevBtn.destroy();
            nextBtn.destroy();
            this.popupContainer = null;
            };

            function updateSlide() {
            slideImage.setTexture(slides[current]);
            prevBtn.setAlpha(current === 0 ? 0.5 : 1);
            prevBtn.disableInteractive();
            nextBtn.setAlpha(current === slides.length - 1 ? 0.5 : 1);
            nextBtn.disableInteractive();
            if (current > 0) prevBtn.setInteractive({ useHandCursor: true });
            if (current < slides.length - 1) nextBtn.setInteractive({ useHandCursor: true });
            }

            prevBtn.on('pointerdown', () => {
            if (current > 0) {
                current--;
                updateSlide();
            }
            });
            nextBtn.on('pointerdown', () => {
            if (current < slides.length - 1) {
                current++;
                updateSlide();
            } else if (current === slides.length - 1) {
                // Close on last page next click
                closePopup();
            }
            });

            updateSlide();

            // Close when clicking overlay (but not popup box)
            this.popupContainer.on('pointerdown', (pointer) => {
            // Only close if click is outside popupBox
            const bounds = popupBox.getBounds();
            if (
                pointer.x < bounds.left ||
                pointer.x > bounds.right ||
                pointer.y < bounds.top ||
                pointer.y > bounds.bottom
            ) {
                closePopup();
            }
            });
        });

    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
