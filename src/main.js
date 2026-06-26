import { Start } from './scenes/Start.js';
import { Menu } from './scenes/Menu.js';
import { Play } from './scenes/Play.js';
import { GameScene } from './scenes/GameScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { PracticeScene } from './scenes/PracticeScene.js';
import { HistoryScene } from './scenes/HistoryScene.js';
import { AchievementScene } from './scenes/AchievementScene.js';
import { UnlockScene } from './scenes/UnlockScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,

    title: 'Overlord Rising',
    description: '',

    parent: 'game-container',

    width: 1280,
    height: 720,

    backgroundColor: '#000000',

    pixelArt: false,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',

        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },

    scene: [
        Start,
        Menu,
        Play,
        LevelSelectScene,
        GameScene,
        PracticeScene,
        HistoryScene,
        AchievementScene,
        UnlockScene,
        UIScene
    ]
};

new Phaser.Game(config);