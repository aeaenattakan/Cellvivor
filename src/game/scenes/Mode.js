import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import io from 'socket.io-client';
const socket = io('http://localhost:5000'); // Adjust as needed

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

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

    // Overlay
    this.popupContainer = this.add.rectangle(512, 360, 1024, 800, 0x000000, 0.7)
        .setOrigin(0.5).setDepth(299);

    // Popup box
    const popupBox = this.add.rectangle(512, 360, 600, 420, 0xffffff, 1)
        .setOrigin(0.5).setDepth(300);

    // Title
    const title = this.add.text(512, 220, "Multiplayer Mode", {
        fontSize: '38px',
        color: '#fa821a',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5).setDepth(301);

    // Info message
    let infoMsg = this.add.text(512, 260, "", {
        fontSize: '22px',
        color: '#333',
        align: 'center',
        wordWrap: { width: 540 }
    }).setOrigin(0.5).setDepth(303);

    // Multiplayer state
    this.roles = { guesser: null, hinter: null };
    this.isHost = false;
    this.currentRoom = null;

    // Button style
    const btnY = 300;
    const btnSpacing = 70;
    const btnStyle = {
        fontSize: '28px',
        color: '#fff',
        backgroundColor: '#fa821a',
        padding: { left: 32, right: 32, top: 12, bottom: 12 },
        borderRadius: 12
    };

    // Option buttons
    const createRoomBtn = this.add.text(512, btnY, "Create Room", btnStyle)
        .setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });
    const joinRoomBtn = this.add.text(512, btnY + btnSpacing, "Join Room", btnStyle)
        .setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });
    const simpleGameBtn = this.add.text(512, btnY + btnSpacing * 2, "Start Simple Game", btnStyle)
        .setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

    // Role selection UI (hidden by default)
    let roleMsg, guesserBtn, hinterBtn, startBtn;

    function showRoleSelection() {
        if (!roleMsg) {
            roleMsg = this.add.text(512, btnY + btnSpacing * 3 + 20, "Choose your role:", {
                fontSize: '24px',
                color: '#fa821a',
                align: 'center'
            }).setOrigin(0.5).setDepth(304);

            guesserBtn = this.add.text(512 - 90, btnY + btnSpacing * 4, "Guesser", btnStyle)
                .setOrigin(0.5).setDepth(305).setInteractive({ useHandCursor: true });
            hinterBtn = this.add.text(512 + 90, btnY + btnSpacing * 4, "Hinter", btnStyle)
                .setOrigin(0.5).setDepth(305).setInteractive({ useHandCursor: true });

            guesserBtn.on('pointerdown', () => {
                this.roles.guesser = "You"; // or actual user ID/name
                infoMsg.setText("You are the guesser.");
                socket.emit('setRole', 'guesser');
                updateStartBtn();
            });
            hinterBtn.on('pointerdown', () => {
                this.roles.hinter = "You";
                infoMsg.setText("You are the hinter.");
                socket.emit('setRole', 'hinter');
                updateStartBtn();
            });

            startBtn = this.add.text(512, btnY + btnSpacing * 5 + 10, "Start Game", {
                fontSize: '28px',
                color: '#fff',
                backgroundColor: '#2ecc40',
                padding: { left: 32, right: 32, top: 12, bottom: 12 },
                borderRadius: 12
            }).setOrigin(0.5).setDepth(306).setInteractive({ useHandCursor: true }).setAlpha(0.5);
            startBtn.disableInteractive();

            startBtn.on('pointerdown', () => {
                if (this.roles.guesser && this.roles.hinter && this.isHost) {
                    socket.emit('start-game', { roomCode: this.currentRoom });
                } else {
                    infoMsg.setText("Both roles must be filled and only host can start.");
                }
            });
        } else {
            roleMsg.setVisible(true);
            guesserBtn.setVisible(true);
            hinterBtn.setVisible(true);
            startBtn.setVisible(true);
        }
        updateStartBtn();
    }

    function hideRoleSelection() {
        if (roleMsg) {
            roleMsg.setVisible(false);
            guesserBtn.setVisible(false);
            hinterBtn.setVisible(false);
            startBtn.setVisible(false);
        }
    }

    function updateStartBtn() {
        console.log("Updating startBtn:", {
      guesser: this.roles.guesser,
      hinter: this.roles.hinter,
      isHost: this.isHost
    });
    if (this.roles.guesser && this.roles.hinter && this.isHost) {
        startBtn.setAlpha(1);
        startBtn.setInteractive({ useHandCursor: true });
    } else {
        startBtn.setAlpha(0.5);
        startBtn.disableInteractive();
    }
    }

    // Bind functions to this
    showRoleSelection = showRoleSelection.bind(this);
    hideRoleSelection = hideRoleSelection.bind(this);
    updateStartBtn = updateStartBtn.bind(this);

    // Button logic
    createRoomBtn.on('pointerdown', () => {
        this.isHost = true;
        const roomCode = generateRoomCode();
        this.currentRoom = roomCode; // <-- Make sure this is set!
        socket.emit('createRoom', roomCode);
        infoMsg.setText(`Room created: ${roomCode}. You are the host.`);
        showRoleSelection();
    });

    joinRoomBtn.on('pointerdown', () => {
        this.isHost = false;
        const roomCode = window.prompt("Enter room code to join:");
        if (!roomCode) return;
        this.currentRoom = roomCode; // <-- Make sure this is set!
        socket.emit('joinRoom', roomCode);
        infoMsg.setText("Joined room " + roomCode + ". You are not the host.");
        showRoleSelection();
    });

    simpleGameBtn.on('pointerdown', () => {
        infoMsg.setText("Simple game started! (Demo only)");
        hideRoleSelection();
        this.scene.start('Game');
    });

    // Listen for game start from server
    socket.on('game-started', () => {
        this.scene.start('Game');
    });

    // (Optional) Listen for player join/role updates
    socket.on('playerJoined', (playerId) => {
        console.log(`${playerId} joined the room`);
    });
    socket.on('roleUpdated', ({ playerId, role, name }) => {
        // Example: assign by role string
        if (role === 'guesser') this.roles.guesser = name || playerId;
        if (role === 'hinter') this.roles.hinter = name || playerId;
        updateStartBtn();
    });

    // Close button
    const closeBtn = this.add.text(512 + 600 / 2 - 24, 360 - 420 / 2 + 24, '✕', {
        fontSize: '32px',
        color: '#888',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { left: 8, right: 8, top: 2, bottom: 2 },
        borderRadius: 16,
        align: 'center'
    }).setOrigin(0.5).setDepth(310).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
        this.popupContainer.destroy();
        popupBox.destroy();
        title.destroy();
        createRoomBtn.destroy();
        joinRoomBtn.destroy();
        simpleGameBtn.destroy();
        infoMsg.destroy();
        closeBtn.destroy();
        if (roleMsg) roleMsg.destroy();
        if (guesserBtn) guesserBtn.destroy();
        if (hinterBtn) hinterBtn.destroy();
        if (startBtn) startBtn.destroy();
        this.popupContainer = null;
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

            // Prev button
            const prevBtn = this.add.text(512 - 400, 370, '<', {
                fontSize: '64px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
                borderRadius: 32
            }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

            // Next button
            const nextBtn = this.add.text(512 + 400, 370, '>', {
                fontSize: '64px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 16, right: 16, top: 8, bottom: 8 },
                borderRadius: 32
            }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

            // Slide change logic
            const updateSlide = (index) => {
                slideImage.setTexture(slides[index]);
            };

            prevBtn.on('pointerdown', () => {
                current = (current > 0) ? current - 1 : slides.length - 1;
                updateSlide(current);
            });

            nextBtn.on('pointerdown', () => {
                current = (current < slides.length - 1) ? current + 1 : 0;
                updateSlide(current);
            });

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
            ).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

            closeBtn.on('pointerdown', () => {
                this.popupContainer.destroy();
                popupBox.destroy();
                slideImage.destroy();
                prevBtn.destroy();
                nextBtn.destroy();
                closeBtn.destroy();
                this.popupContainer = null;
            });
        });
    }
}

const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));
if (user && user.name) {
    socket.emit('registerUser', user.name);
}
