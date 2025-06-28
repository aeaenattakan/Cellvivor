import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
      //
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
