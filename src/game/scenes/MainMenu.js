import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    logoTween;

    constructor ()
    {
        super('MainMenu');
    }  

    preload() {
        // ...other preload code...
        this.load.image('magnifying', 'assets/magnifying.png');
    }

    create ()
    {
        // Set background color
        this.cameras.main.setBackgroundColor('#91e3ff');

        this.logo = this.add.image(this.cameras.main.centerX, 300, 'logo').setDepth(100).setScale(0.4);

        // Track current user from localStorage (if available)
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            currentUser = null;
        }
        if (currentUser && currentUser.name) {
            // Place the text at the bottom left of the screen
            this.add.text(30, this.cameras.main.height - 40, `Welcome, ${currentUser.name}!`, {
            fontSize: '25px',
            color: '#333',
            align: 'left',
            fontStyle: 'bold',
            fontWeight: '600',
            strokeThickness: 0
            }).setOrigin(0, 1).setDepth(110);
        }

        
        

        const buttonLabels = [
            { 
                label: 'Sign in', 
                action: () => { 
                    EventBus.emit('show-signin'); 
                    console.log('Signin requested'); 
                    // After successful signin, navigate to Mode scene
                    EventBus.once('signin-success', () => this.scene.start('Mode'));
                } 
            },
            { 
                label: 'Login', 
                action: () => { 
                    EventBus.emit('show-login'); 
                    console.log('Login requested'); 
                    // After successful login, navigate to Mode scene
                    EventBus.once('login-success', () => this.scene.start('Mode'));
                } 
            },
            { 
                label: 'Guest Mode', 
                action: () => { 
                    alert('Starting Cellvivor in Guest Mode!'); 
                    console.log('Guest mode started'); 
                    this.scene.start('Mode');
                } 
            }
        ];
        const buttonY = 550;
        const buttonSpacing = 240; // total width for all buttons and gaps
        const buttonWidth = 220;
        const gap = 32;
        const totalWidth = buttonLabels.length * buttonWidth + (buttonLabels.length - 1) * gap;
        const startX = 512 - totalWidth / 2 + buttonWidth / 2;
        buttonLabels.forEach((btn, idx) => {
            const x = startX + idx * (buttonWidth + gap);
            // Button background
            const btnRect = this.add.rectangle(x, buttonY, buttonWidth, 48, 0x6067FE, 1)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(101);
            btnRect.setStrokeStyle(2, 0x4BC6F0);
            // Button text
            const btnText = this.add.text(x, buttonY, btn.label, {
                fontSize: '28px',
                color: '#FFFFFF',
                align: 'center',
                fontStyle: 'normal',
                fontWeight: '400',
                strokeThickness: 0
            }).setOrigin(0.5).setDepth(102);
            // Button events
            btnRect.on('pointerover', () => btnRect.setFillStyle(0x4BC6F0, 1));
            btnRect.on('pointerout', () => btnRect.setFillStyle(0x6067FE, 1));
            btnRect.on('pointerdown', btn.action);
        });

        // Add a magnifying glass button on the top right, same size and Y as the logo/back button
        // Make sure to preload the image in your preload() method:
        // this.load.image('magnifying', 'assets/magnifying.png');
        const magnifyingBtn = this.add.image(this.cameras.main.width - 60, 80, 'magnifying')
            .setOrigin(0.5)
            .setScale(0.1)
            .setDepth(120)
            .setInteractive({ useHandCursor: true });

        magnifyingBtn.on('pointerdown', () => {
            // Prevent multiple popups
            if (this.popupContainer) return;

            // Fullscreen dark background (69% transparent)
            this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.69)
                .setOrigin(0.5).setDepth(199);

            // White popup box
            const popupBox = this.add.rectangle(512, 320, 500, 200, 0xffffff, 1)
                .setOrigin(0.5).setDepth(200);

            // Popup text
            this.popupText = this.add.text(512, 320, 'Popup Content Here', {
                fontSize: '28px',
                color: '#222',
                wordWrap: { width: 440 }
            }).setOrigin(0.5).setDepth(201);

            // Close button
            this.closeBtn = this.add.text(512, 410, 'Close', {
                fontSize: '22px',
                color: '#FFD700',
                backgroundColor: '#333',
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
                borderRadius: 8
            }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

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

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }  
      enterButtonHoverState() {
        this.clickButton.setStyle({ fill: '#ff0'});
      }
    
      enterButtonRestState() {
        this.clickButton.setStyle({ fill: '#0f0' });
      }

    moveLogo (reactCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
