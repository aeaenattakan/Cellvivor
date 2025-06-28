import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    logoTween;

    constructor ()
    {
        super('MainMenu');
    }  

    create ()
    {
        this.cameras.main.setBackgroundColor('#91E3FF');
        const bgRect = this.add.graphics();
        bgRect.fillStyle(0x4BC6F0, 1);
        const rectWidth = this.cameras.main.width * 0.8;
        const rectHeight = this.cameras.main.height * 0.8;
        const rectX = (this.cameras.main.width - rectWidth) / 2;
        const rectY = (this.cameras.main.height - rectHeight) / 1.5;
        bgRect.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, 60);
        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        // Track current user from localStorage (if available)
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            currentUser = null;
        }
        if (currentUser && currentUser.name) {
            this.add.text(512, 180, `Welcome, ${currentUser.name}!`, {
                fontSize: '32px',
                color: '#333',
                align: 'center',
                fontStyle: 'bold',
                fontWeight: '600',
                strokeThickness: 0
            }).setOrigin(0.5).setDepth(110);
        }

        const buttonLabels = [
            { label: 'Sign in', action: () => { EventBus.emit('show-signin'); console.log('Signin requested'); } },
            { label: 'Login', action: () => { EventBus.emit('show-login'); console.log('Login requested'); } },
            { label: 'Guest Mode', action: () => { alert('Starting Cellvivor in Guest Mode!'); console.log('Guest mode started'); } }
        ];
        const buttonY = 500;
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
