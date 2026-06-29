export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() { 
        this.load.image('logo', 'assets/logo.png');
        this.load.audio('sfx_intro', 'assets/Audio/bgm.mp3');

        adConfig({sound: 'on', preloadAdBreaks: 'on'});
    }

    create() {
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        
        let logo = this.add.image(currentW / 2, currentH / 2, 'logo').setAlpha(0).setScale(0.5);
        
        this.tweens.add({
            targets: logo,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.tweens.add({
                        targets: logo,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => { 
                            adBreak({
                            type: 'preroll',
                            name: 'splash_gamelab',
                            adBreakDone: (info) => {
                                console.log(`Preroll result: ${info.breakStatus}`);
                                this.scene.start('Play'); 
                            }
                            });    
                        }
                    });
                });
            }
        });
    }

    update() {}
}