import Phaser from 'phaser';
import { addStoryModeUI } from './UIscene';

export class Chapter1game extends Phaser.Scene {
    constructor() {
        super('Chapter1game');
        this.dropZones = {};
        this.properties = [];
        this.currentIndex = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.progressText = null;
    }

    preload() {
        this.load.image('BloodVessel', 'assets/BloodVessel_Capi.png');
        this.load.image('Vein', 'assets/Vein.png');
        this.load.image('Artery', 'assets/Artery.png');
        this.load.image('setting', 'assets/setting.png');
        this.load.image('book', 'assets/book.png');
    }

    create() {
        addStoryModeUI(this, {
            onSettings: (scene, box) =>
                scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
            onBook: (scene, box) =>
                scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
        });

        const zoneData = [
            { key: 'Artery', label: 'Arteries', type: 'arteries' },
            { key: 'Vein', label: 'Veins', type: 'veins' },
            { key: 'BloodVessel', label: 'Capillaries', type: 'capillaries' }
        ];

        const screenWidth = this.sys.game.config.width;
        const spacing = screenWidth / (zoneData.length + 1);

        zoneData.forEach((data, i) => {
            const x = spacing * (i + 1);
            const y = 380;
            const img = this.add.image(x, y, data.key).setScale(0.15).setOrigin(0.5);
            const zone = this.add.zone(x, y, img.displayWidth, img.displayHeight).setRectangleDropZone(img.displayWidth, img.displayHeight);
            this.add.text(x, y + img.displayHeight / 2 + 30, data.label, { fontSize: '22px', color: '#000' }).setOrigin(0.5);
            zone.zoneType = data.type;
            this.dropZones[data.type] = zone;
        });

        this.properties = Phaser.Utils.Array.Shuffle([
            { text: 'Thick, elastic walls', type: 'arteries' },
            { text: 'Blood pulses strongly with each heartbeat', type: 'arteries' },
            { text: 'Have valves to prevent blood from flowing backward', type: 'veins' },
            { text: 'Lower pressure', type: 'veins' },
            { text: 'The smallest vessels', type: 'capillaries' },
            { text: 'Sites of exchange between blood and body cell', type: 'capillaries' }
        ]);

        this.totalCount = this.properties.length;
        this.correctCount = 0;

        this.progressText = this.add.text(screenWidth / 2, 120, `0/${this.totalCount}`, {
            fontSize: '26px',
            color: '#333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.showHowToPlayPopup(() => {
            this.showNextProperty();
        });

        // Popup UI helpers
        let popupContainer = null, popupBox = null, popupText = null, closeBtn = null;
        const showPopup = (msg, color = '#222', onClose = null) => {
            if (popupContainer) return;
            popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
                .setOrigin(0.5).setDepth(299);
            popupBox = this.add.rectangle(512, 320, 500, 200, 0xffffff, 1)
                .setOrigin(0.5).setDepth(300);
            popupText = this.add.text(512, 320, msg, {
                fontSize: '28px',
                color: color,
                wordWrap: { width: 440 },
                align: 'center'
            }).setOrigin(0.5).setDepth(301);
            closeBtn = this.add.text(512, 410, 'Close', {
                fontSize: '24px',
                color: '#FFD700',
                backgroundColor: '#333',
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
                borderRadius: 8
            }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });
            closeBtn.on('pointerdown', () => {
                popupContainer.destroy();
                popupBox.destroy();
                popupText.destroy();
                closeBtn.destroy();
                popupContainer = popupBox = popupText = closeBtn = null;
                if (typeof onClose === 'function') onClose();
            });
        };

        this.input.on('drop', (pointer, box, dropZone) => {
            if (!dropZone || !box) return;

            if (dropZone.zoneType === box.propType) {
                this.correctCount++;
                this.progressText.setText(`${this.correctCount}/${this.totalCount}`);
                showPopup('Correct!\n(≧∇≦)ﾉ', '#00aa00', () => {
                    box.textObj.destroy();
                    box.destroy();
                    this.showNextProperty();
                });
            } else {
                showPopup('Try Again!\nヽ(*。>Д<)o゜', '#ff0000', () => {
                    this.tweens.add({
                        targets: [box, box.textObj],
                        x: box.originalX,
                        y: box.originalY,
                        duration: 300,
                        ease: 'Sine.easeInOut'
                    });
                });
            }
        });

        this.add.text(screenWidth / 2, 170, 'Match the property to the\ncorrect blood vessel type!', {
            fontSize: '30px', color: '#222', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    showNextProperty() {
        if (this.currentIndex >= this.properties.length) {
            let popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.5)
                .setOrigin(0.5).setDepth(299);
            let popupBox = this.add.rectangle(512, 320, 500, 200, 0xffffff, 1)
                .setOrigin(0.5).setDepth(300);
            let popupText = this.add.text(512, 300, 'All done!\nContinue to Chapter 2?', {
                fontSize: '26px', color: '#222', align: 'center'
            }).setOrigin(0.5).setDepth(301);

            let buttonText = this.add.text(512, 370, 'Continue to Chapter 2', {
                fontSize: '22px',
                color: '#FFD700',
                backgroundColor: '#333',
                padding: { left: 24, right: 24, top: 10, bottom: 10 },
                borderRadius: 8
            }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

            buttonText.on('pointerover', () => buttonText.setStyle({ color: '#fff', backgroundColor: '#FFD700' }));
            buttonText.on('pointerout', () => buttonText.setStyle({ color: '#FFD700', backgroundColor: '#333' }));
            buttonText.on('pointerdown', () => {
                popupContainer.destroy();
                popupBox.destroy();
                popupText.destroy();
                buttonText.destroy();
                this.scene.start('Chapter2');
            });
            return;
        }

        const prop = this.properties[this.currentIndex++];
        const x = this.sys.game.config.width / 2;
        const y = 660;
        const boxWidth = 360;

        const tempText = this.add.text(0, 0, prop.text, {
            fontSize: '18px', color: '#000', wordWrap: { width: boxWidth - 20 }
        }).setWordWrapWidth(boxWidth - 20).setVisible(false);

        const textHeight = tempText.height;
        tempText.destroy();

        const boxHeight = textHeight + 32;

        const box = this.add.rectangle(x, y, boxWidth, boxHeight, 0xffffff)
            .setStrokeStyle(2, 0x888888)
            .setDepth(3)
            .setInteractive({ draggable: true });

        const text = this.add.text(x, y, prop.text, {
            fontSize: '18px', color: '#000', wordWrap: { width: boxWidth - 20 }, align: 'center'
        }).setOrigin(0.5).setDepth(4);

        box.propType = prop.type;
        box.textObj = text;
        box.originalX = x;
        box.originalY = y;

        this.input.setDraggable(box);

        box.on('drag', (pointer, dragX, dragY) => {
            box.x = dragX;
            box.y = dragY;
            text.x = dragX;
            text.y = dragY;
        });
    }

    showHowToPlayPopup(onClose) {
        const overlay = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.66)
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(1000);

        const popup = this.add.rectangle(512, 360, 850, 550, 0xffffff, 1)
            .setOrigin(0.5)
            .setDepth(1001);

        const helpText = this.add.text(512, 360, 'How to Play\n\nDrag the properties to the correct blood vessel.\nMatch all correctly to continue.', {
            fontSize: '26px',
            color: '#222',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5).setDepth(1002);

        overlay.once('pointerdown', () => {
            overlay.destroy();
            popup.destroy();
            helpText.destroy();
            if (onClose) onClose();
        });
    }
}
