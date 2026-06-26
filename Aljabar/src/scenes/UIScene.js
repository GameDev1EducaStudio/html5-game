import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class UIScene extends Phaser.Scene {

    constructor() {
        super('UIScene');
    }

  preload() {
        this.load.image('panelPaused', 'assets/panelPaused.png');
        this.load.image('panelSmallHistory', 'assets/panelSmallHistory.png');
        this.load.image('verticalScrolling', 'assets/verticalScrolling.png');
        this.load.image('btnUpDown', 'assets/btnUpDown.png');
        this.load.image('btnVolume', 'assets/btnVolume.png');
        this.load.image('btnVolumeHover', 'assets/btnVolumeHover.png');
        this.load.image('btnVolumeClick', 'assets/btnVolumeClick.png');
        this.load.image('btnVolumeLock', 'assets/btnVolumeLock.png');
        this.load.image('btnMusic', 'assets/btnMusic.png');
        this.load.image('btnMusicHover', 'assets/btnMusicHover.png');
        this.load.image('btnMusicClick', 'assets/btnMusicClick.png');
        this.load.image('btnMusicLock', 'assets/btnMusicLock.png');
        this.load.audio('bgm', 'assets/Audio/bgm.mp3');
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
    }

    init(data) {
        if (this.registry.get('isMusicOn') === undefined) {
            this.registry.set('isMusicOn', true);
        }
        if (this.registry.get('isVolOn') === undefined) {
            this.registry.set('isVolOn', true);
        }
        this.isMusicOn = this.registry.get('isMusicOn');
        this.isVolOn = this.registry.get('isVolOn');
        this.isInGame = (data && data.isGame) ? data.isGame : false;
    }

    create() {
        let posX = this.isInGame ? 80 : 0;
        let music = this.sound.get('bgm');
        
        if (!music) {
            music = this.sound.add('bgm', { volume: 0.5, loop: true });
            music.play();
        } else if (!music.isPlaying && this.isMusicOn && !music.isPaused) {
            music.play();
        }
        
        this.bgm = music;
        this.isMusicOn = !this.bgm.isPaused;
        this.isVolOn = !this.sound.mute;
        
        const currentW = this.game.canvas.width;
        const btnVol = this.add.image(currentW - 60 - posX, 60, 'btnVolume').setScale(0.1).setInteractive();
        
        btnVol.on('pointerover', () => { if (this.isVolOn) btnVol.setTexture('btnVolumeHover'); });
        btnVol.on('pointerout', () => { if (this.isVolOn) btnVol.setTexture('btnVolume'); });
        btnVol.on('pointerdown', () => { if (this.isVolOn) btnVol.setTexture('btnVolumeClick'); playSFX(this, 'sndClick'); });
        
        btnVol.on('pointerup', () => {
            this.isVolOn = !this.isVolOn; 
            this.registry.set('isVolOn', this.isVolOn);
            btnVol.setTexture(this.isVolOn ? 'btnVolume' : 'btnVolumeLock');
            
            if (!this.isVolOn) {
                this.sound.sounds.forEach((sound) => {
                    if (sound.key !== 'bgm') sound.stop();
                });
            }
        });
        
        const btnMusic = this.add.image(currentW - 140 - posX, 60, 'btnMusic').setScale(0.1).setInteractive();
        
        btnMusic.on('pointerover', () => { if (this.isMusicOn) btnMusic.setTexture('btnMusicHover'); });
        btnMusic.on('pointerout', () => { if (this.isMusicOn) btnMusic.setTexture('btnMusic'); });
        btnMusic.on('pointerdown', () => { if (this.isMusicOn) btnMusic.setTexture('btnMusicClick'); playSFX(this, 'sndClick'); });
        
        btnMusic.on('pointerup', () => {
            this.isMusicOn = !this.isMusicOn;
            this.registry.set('isMusicOn', this.isMusicOn);
            
            if (this.isMusicOn) {
                if (this.bgm.isPaused) this.bgm.resume();
                else this.bgm.play();
            } else {
                this.bgm.pause();
            }
            btnMusic.setTexture(this.isMusicOn ? 'btnMusic' : 'btnMusicLock');
        });
    }

    update() {}
}