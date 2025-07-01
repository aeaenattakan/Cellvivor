import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }
    
    create ()
    {
        this.cameras.main.setBackgroundColor('#FFD700')
        // Add a back arrow button (top left)
        const arrow = this.add.text(60, 60, '<', {
            fontSize: '48px',
            color: '#ffffffff',
            align: 'Left',
            borderRadius: 12
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        arrow.on('pointerdown', () => {
            const confirmQuit = window.confirm('Do you want to quit the game?');
            if (confirmQuit) {
                console.log('User chose to quit the game.');
                this.scene.start('MainMenu');
            } else {
                console.log('User chose to stay in the game.');
            }
        });
        console.log('User in localStorage:', localStorage.getItem('user'));
        // Helper to fetch a random keyword from the backend
        const getRandomKeyword = async () => {
            const response = await fetch('http://localhost:5000/api/random-keyword');
            if (!response.ok) {
                throw new Error('Failed to fetch keyword');
            }
            const data = await response.json();
            return data.keyword; // expecting { keyword: "..." }
        };


        // Display the keyword and add a button to randomize
        let currentKeyword = '';
        let keywordText = this.add.text(512, 300, 'Loading...', {
            fontSize: '48px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);


        // Track result and hint usage
        let result = '';
        let hintUsed = false;
        // อย่าลืมทำให้ create new gameplay result ใหม่ทุกครั้งที่เล่น 
        async function sendResultToDB(keyword, resultValue, scoreValue) {
            try {
                // Use 'currentUser' for consistency with MainMenu and login
                const user = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('user'));
                const userId = user?._id;
                // Compose the mistake entry as 'resultValue:keyword'
                const mistakeEntry = `${resultValue}:${keyword}`;
                // Debug log all values before sending
                console.log('DEBUG: Sending gameplay result', { userId, mistakeEntry, user });
                if (!userId || !keyword || !resultValue) {
                    console.error('ERROR: Missing userId, keyword, or result', { userId, keyword, resultValue });
                    return;
                }
                const res = await fetch('http://localhost:5000/api/gameplay-mistake', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        keyword,
                        result: mistakeEntry,
                        score: scoreValue
                    })
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error('Backend error:', res.status, text);
                } else {
                    const data = await res.json();
                    console.log('Gameplay result saved:', data);
                }
            } catch (e) {
                console.error('Frontend fetch error:', e);
            }
        }

        const showKeyword = (word) => {
            currentKeyword = word;
            keywordText.setText(word);
            result = '';
            hintUsed = false;
        };
        let localScore = 0;
        async function handleAfterKeyword() {
            if (currentKeyword && result) {
                // Only increment score if result is 'TT'
                if (result === 'TT') {
                    localScore++;
                }
                await sendResultToDB(currentKeyword, result, localScore);
            }
        }

        const loadKeyword = async () => {
            await handleAfterKeyword();
            keywordText.setText('Loading...');
            getRandomKeyword()
                .then(showKeyword)
                .catch(() => {
                    keywordText.setText('Error loading keyword');
                });
        };

        loadKeyword();

        const hintBg = this.add.rectangle(900, 200, 60, 60, 0x000000, 0.5)
            .setOrigin(0.5)
            .setDepth(150);
        const hintButton = this.add.text(900, 200, '\uD83D\uDCA1', {
            fontSize: '44px',
            color: '#fff',
        })
            .setOrigin(0.5)
            .setDepth(151)
            .setInteractive({ useHandCursor: true });

        hintButton.on('pointerover', () => hintButton.setStyle({ color: '#FFD700' }));
        hintButton.on('pointerout', () => hintButton.setStyle({ color: '#fff' }));
        hintButton.on('pointerdown', async () => {
            if (!currentKeyword) return;
            try {
                const response = await fetch(`http://localhost:5000/api/random-keyword?keyword=${encodeURIComponent(currentKeyword)}`);
                if (!response.ok) throw new Error('Failed to fetch hint');
                const data = await response.json();
                showHintPopup(data.hint || 'No hint available.');
                hintUsed = true;
            } catch (e) {
                showHintPopup('Error fetching hint.');
            }
        });

        let popupContainer = null;
        let popupText = null;
        let closeBtn = null;
        function showHintPopup(hint) {
            if (popupContainer) return; 
            popupContainer = this.add.rectangle(512, 360, 1024, 720, 0x000000, 0.5)
                .setOrigin(0.5).setDepth(299);
            const popupBox = this.add.rectangle(512, 320, 500, 200, 0xffffff, 1)
                .setOrigin(0.5).setDepth(300);
            popupText = this.add.text(512, 320, hint, {
                fontSize: '28px',
                color: '#222',
                wordWrap: { width: 440 }
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
                popupContainer = null;
                popupText = null;
                closeBtn = null;
            });
        }
        showHintPopup = showHintPopup.bind(this);
        const totalSeconds = 300;
        let remainingSeconds = totalSeconds;
        const timerText = this.add.text(512, 200, formatTime(remainingSeconds), {
            fontSize: '40px',
            color: '#ffffff',
        }).setOrigin(0.5).setDepth(150);
        function formatTime(secs) {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        }
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                remainingSeconds--;
                timerText.setText(formatTime(remainingSeconds));
                if (remainingSeconds <= 0) {
                    this.timerEvent.remove();
                    this.changeScene();
                }
            },
            callbackScope: this,
            loop: true
        });

        // Add two buttons: Skip (left) and Correct (right)
        const buttonY = 400;
        const buttonWidth = 180;
        const buttonHeight = 48;
        const gap = 60;
        // Skip button (left)
        const skipButton = this.add.rectangle(512 - buttonWidth/2 - gap, buttonY, buttonWidth, buttonHeight, 0x6067FE, 1)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(101);
        skipButton.setStrokeStyle(2, 0x4BC6F0);
        const skipText = this.add.text(512 - buttonWidth/2 - gap, buttonY, 'Skip', {
        }).setOrigin(0.5).setDepth(102);
        skipButton.on('pointerover', () => skipButton.setFillStyle(0x4BC6F0, 1));
        skipButton.on('pointerout', () => skipButton.setFillStyle(0x6067FE, 1));
        skipButton.on('pointerdown', async () => {
            // Set result based on hint usage
            if (hintUsed) {
                result = 'FF';
            } else {
                result = 'FF';
            }
            await loadKeyword();
        });

        // Correct button (right)
        const correctButton = this.add.rectangle(512 + buttonWidth/2 + gap, buttonY, buttonWidth, buttonHeight, 0x6067FE, 1)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(101);
        correctButton.setStrokeStyle(2, 0x4BC6F0);
        const correctText = this.add.text(512 + buttonWidth/2 + gap, buttonY, 'Correct', {
        }).setOrigin(0.5).setDepth(102);
        correctButton.on('pointerover', () => correctButton.setFillStyle(0x4BC6F0, 1));
        correctButton.on('pointerout', () => correctButton.setFillStyle(0x6067FE, 1));
        correctButton.on('pointerdown', async () => {
            // Set result based on hint usage
            if (hintUsed) {
                result = 'FT';
            } else {
                result = 'TT';
            }
            await loadKeyword();
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}