import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
//import { MainMenu } from './MainMenu';
//import { Game } from './Game';
export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
    this.cameras.main.setBackgroundColor('#FF8317');
    this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#fff' })
        .setOrigin(0.5, 0.5)
        .setAlign('center');

    // Get the score from the previous scene (Game.js)
    const gameScene = this.scene.get('Game');
    const localScore = gameScene ? gameScene.score : 0;

    this.add.text(400, 350, `Your Score: ${localScore}`, { fontSize: '32px', fill: '#fff' })
        .setOrigin(0.5, 0.5)
        .setAlign('center');

    this.add.text(400, 400, 'Click to return to Main Menu', { fontSize: '32px', fill: '#fff' })
        .setOrigin(0.5, 0.5)
        .setAlign('center');

    this.input.on('pointerdown', this.changeScene, this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
