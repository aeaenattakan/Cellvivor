import Phaser from 'phaser';
import addStoryModeUI from './UIscene'; // Adjust the path if needed

export default class Chapter1game extends Phaser.Scene {
    constructor() {
        super('Chapter1game');
        this.dropZones = {};
        this.draggables = [];
        this.matches = {};
        this.correctMap = {};
        this.placedCount = 0;
        this.resultTexts = [];
    }

    preload() {
        // Preload vessel images if not already loaded in main preload
        this.load.image('BloodVesselA', 'assets/BloodVesselA.png');
        this.load.image('BloodVesselB', 'assets/BloodVesselB.png');
        this.load.image('BloodVessel', 'assets/BloodVessel.png');
    }

    create() {
        // --- Call UI Scene/Overlay ---
        addStoryModeUI(this, {
            onSettings: (scene, box) => scene.add.text(box.x, box.y, 'Custom Settings', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
            onBook: (scene, box) => scene.add.text(box.x, box.y, 'Custom Book', { fontSize: '32px', color: '#222' }).setOrigin(0.5).setDepth(201),
        });

        // --- Drop Zone Setup ---
        const zoneData = [
            {
                key: 'BloodVesselA',
                label: '🟥 Arteries',
                x: 250,
                y: 250,
                type: 'arteries'
            },
            {
                key: 'BloodVesselB',
                label: '🔵 Veins',
                x: 550,
                y: 250,
                type: 'veins'
            },
            {
                key: 'BloodVessel',
                label: '🟠 Capillaries',
                x: 850,
                y: 250,
                type: 'capillaries'
            }
        ];

        this.dropZones = {};
        zoneData.forEach((zone, i) => {
            // Vessel image
            this.add.image(zone.x, zone.y, zone.key).setDisplaySize(120, 120).setDepth(1);
            // Label
            this.add.text(zone.x, zone.y + 80, zone.label, {
                fontSize: '22px',
                color: '#222',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Drop zone rectangle (invisible, but for feedback)
            const rect = this.add.rectangle(zone.x, zone.y, 160, 160, 0x000000, 0.08)
                .setStrokeStyle(3, 0x888888)
                .setDepth(2)
                .setInteractive({ dropZone: true });
            rect.zoneType = zone.type;
            this.dropZones[zone.type] = rect;
        });

        // --- Draggable Properties ---
        const properties = [
            // Arteries
            { text: 'Thick, elastic walls', type: 'arteries' },
            { text: 'Can handle high pressure from the heart', type: 'arteries' },
            { text: 'No valves', type: 'arteries' },
            { text: 'Blood pulses strongly with each heartbeat', type: 'arteries' },
            // Veins
            { text: 'Thinner walls than arteries', type: 'veins' },
            { text: 'Have valves to prevent blood from flowing backward', type: 'veins' },
            { text: 'Lower pressure', type: 'veins' },
            { text: 'Blood moves with help from muscles and valves', type: 'veins' },
            // Capillaries
            { text: 'The smallest vessels', type: 'capillaries' },
            { text: 'Walls only one cell thick', type: 'capillaries' },
            { text: 'Sites of exchange between blood and body cell', type: 'capillaries' }
        ];

        Phaser.Utils.Array.Shuffle(properties); // Randomize order

        this.draggables = {};
        this.matches = {};
        this.correctMap = {};
        this.placedCount = 0;

        // Place draggable property boxes
        properties.forEach((prop, i) => {
            const box = this.add.rectangle(200 + (i % 2) * 400, 450 + Math.floor(i / 2) * 60, 350, 48, 0xffffff, 1)
                .setStrokeStyle(2, 0x888888)
                .setDepth(3)
                .setInteractive({ draggable: true });
            const txt = this.add.text(box.x, box.y, prop.text, {
                fontSize: '18px',
                color: '#222',
                wordWrap: { width: 330 }
            }).setOrigin(0.5).setDepth(4);

            box.propType = prop.type;
            box.textObj = txt;
            box.originalX = box.x;
            box.originalY = box.y;
            box.isPlaced = false;
            this.draggables.push(box);
            this.correctMap[box] = prop.type;

            // Drag events
            box.on('drag', (pointer, dragX, dragY) => {
                box.x = dragX;
                box.y = dragY;
                txt.x = dragX;
                txt.y = dragY;
            });

            box.on('dragend', (pointer, dragX, dragY, dropped) => {
                if (!dropped) {
                    // Snap back if not dropped on a zone
                    this.tweens.add({
                        targets: [box, txt],
                        x: box.originalX,
                        y: box.originalY,
                        duration: 200,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        });

        // Enable drag for all boxes
        this.input.setDraggable(this.draggables);

        // Drop event
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (!dropZone || !gameObject) return;
            // Snap to drop zone center
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y + Phaser.Math.Between(-40, 40); // slight random offset for stacking
            gameObject.textObj.x = gameObject.x;
            gameObject.textObj.y = gameObject.y;
            gameObject.isPlaced = true;
            this.matches[gameObject] = dropZone.zoneType;
            this.placedCount = Object.keys(this.matches).length;

            // Visual feedback
            dropZone.setStrokeStyle(4, 0x44ff44);

            // If all placed, validate
            if (this.placedCount === this.draggables.length) {
                this.validateMatches();
            }
        });

        // Remove highlight on dragleave
        Object.values(this.dropZones).forEach(zone => {
            zone.on('pointerout', () => {
                zone.setStrokeStyle(3, 0x888888);
            });
        });

        // Instructions
        this.add.text(512, 80, 'Match each property to the correct blood vessel type!', {
            fontSize: '28px',
            color: '#222',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Reset/Next buttons (hidden until needed)
        this.tryAgainBtn = this.add.text(512, 670, 'Try Again', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#c00',
            padding: { left: 24, right: 24, top: 10, bottom: 10 },
            borderRadius: 8
        }).setOrigin(0.5).setDepth(10).setInteractive().setVisible(false);

        this.nextBtn = this.add.text(900, 670, 'Next', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#0c0',
            padding: { left: 24, right: 24, top: 10, bottom: 10 },
            borderRadius: 8
        }).setOrigin(0.5).setDepth(10).setInteractive().setVisible(false);

        this.tryAgainBtn.on('pointerdown', () => this.resetGame());
        // this.nextBtn.on('pointerdown', () => this.scene.start('NextSceneName'));
    }

    validateMatches() {
        // Remove previous result texts
        this.resultTexts.forEach(t => t.destroy());
        this.resultTexts = [];

        let allCorrect = true;
        this.draggables.forEach(box => {
            const placedType = this.matches[box];
            const correctType = box.propType;
            if (placedType === correctType) {
                box.setStrokeStyle(4, 0x00cc44);
                box.textObj.setColor('#008800');
            } else {
                box.setStrokeStyle(4, 0xcc0000);
                box.textObj.setColor('#cc0000');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            this.nextBtn.setVisible(true);
            this.tryAgainBtn.setVisible(false);
            this.add.text(512, 620, '✅ All correct! Great job!', {
                fontSize: '28px',
                color: '#008800'
            }).setOrigin(0.5).setDepth(10);
        } else {
            this.tryAgainBtn.setVisible(true);
            this.nextBtn.setVisible(false);
            this.add.text(512, 620, '❌ Some answers are incorrect. Try again!', {
                fontSize: '28px',
                color: '#cc0000'
            }).setOrigin(0.5).setDepth(10);
        }
    }

    resetGame() {
        // Reset all draggables to original positions and colors
        this.draggables.forEach(box => {
            box.x = box.originalX;
            box.y = box.originalY;
            box.textObj.x = box.originalX;
            box.textObj.y = box.originalY;
            box.setStrokeStyle(2, 0x888888);
            box.textObj.setColor('#222');
            box.isPlaced = false;
        });
        this.matches = {};
        this.placedCount = 0;
        this.tryAgainBtn.setVisible(false);
        this.nextBtn.setVisible(false);
        this.resultTexts.forEach(t => t.destroy());
        this.resultTexts = [];
    }
}