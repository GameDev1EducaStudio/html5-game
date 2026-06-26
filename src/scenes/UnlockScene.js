import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class UnlockScene extends Phaser.Scene {

    constructor() {
        super('UnlockScene');
    }

    preload() {
        this.load.image('lightRay', 'assets/lightRay.png');
        this.load.image('medalGold', 'assets/medalGold.png'); 
        
        // SINKRONISASI NAMA FILE: Menggunakan folder 'Audio' kapital dan 'sndAchivment.mp3'
        this.load.audio('sndAchievement', 'assets/Audio/sndAchivment.mp3');
    }

    init(data) {
        if (data && Array.isArray(data.queue)) {
            this.queue = data.queue;
        } else {
            this.queue = data ? [data] : [];
        }
    }

    create() {
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        this.cx = currentW / 2;
        this.cy = currentH / 2;
        
        this.sound.pauseAll();
        
        this.dimmer = this.add.rectangle(this.cx, this.cy, currentW, currentH, 0x000000, 0.85).setInteractive();
        
        this.rays = this.add.image(this.cx, this.cy, 'lightRay').setAlpha(0.5).setScale(0);
        this.tweens.add({ targets: this.rays, angle: 360, duration: 6000, repeat: -1, ease: 'Linear' });
        
        this.txtTitle = this.add.text(this.cx, this.cy - 200, "ACHIEVEMENT\nUNLOCKED!", {
            fontSize: '42px', fontStyle: '900', align: 'center', color: '#FFD700'
        }).setOrigin(0.5).setScale(0);
        
        this.medal = this.add.image(this.cx, this.cy, 'medalGold').setScale(0);
        
        this.txtDesc = this.add.text(this.cx, this.cy + 180, "", {
            fontSize: '32px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0);
        
        this.txtTap = this.add.text(this.cx, currentH - 50, "- Tap to Continue -", {
            fontSize: '20px', color: '#aaaaaa'
        }).setOrigin(0.5).setAlpha(0);
        
        this.showNextAchievement();
    }

    showNextAchievement() {
        const data = this.queue.shift();
        
        if (!data) {
            this.closeScene();
            return;
        }
        
        this.resetUIElements();
        
        this.medal.setTexture(data.medalKey || 'medalGold');
        this.txtDesc.setText(data.desc || 'Hebat!');
        
        // PERBAIKAN AUDIO BERTUMPUK: Hapus instansiasi sfx achievement yang lama jika masih berbunyi
        if (this.currentSfx) {
            this.currentSfx.stop();
            this.sound.remove(this.currentSfx);
        }
        
        this.currentSfx = this.sound.add('sndAchievement');
        if (this.registry.get('isVolOn')) this.currentSfx.play({ volume: 1 });
        
        this.playEnterAnimation();
    }

    resetUIElements() {
        this.tweens.killTweensOf([this.txtTitle, this.medal, this.txtDesc, this.txtTap, this.rays]);
        this.dimmer.disableInteractive();
        this.rays.setScale(0);
        this.txtTitle.setScale(0).setAlpha(1);
        this.medal.setScale(0).setAlpha(1);
        this.txtDesc.setAlpha(0).setY(this.cy + 180).setScale(1);
        this.txtTap.setAlpha(0).setScale(1);
    }

    playEnterAnimation() {
        this.tweens.add({
            targets: this.rays, scale: 1.5, duration: 800, ease: 'Back.out'
        });
        
        this.tweens.timeline({
            tweens: [
                { targets: this.txtTitle, scale: 1, duration: 500, ease: 'Back.out' },
                { targets: this.medal, scale: 0.5, duration: 800, ease: 'Elastic.out' },
                { targets: this.txtDesc, alpha: 1, y: this.cy + 150, duration: 500, ease: 'Power2' },
                {
                    targets: this.txtTap, alpha: 1, duration: 500, ease: 'Linear',
                    onComplete: () => {
                        this.dimmer.setInteractive();
                        this.dimmer.off('pointerup');
                        this.dimmer.on('pointerup', () => {
                            if (this.currentSfx && this.currentSfx.isPlaying) {
                                this.currentSfx.stop();
                            }
                            if (this.queue.length > 0) {
                                this.playExitAnimation(() => this.showNextAchievement());
                            } else {
                                this.closeScene();
                            }
                        });
                    }
                }
            ]
        });
    }

    playExitAnimation(onCompleteCallback) {
        this.tweens.add({
            targets: [this.txtTitle, this.medal, this.txtDesc, this.txtTap],
            scale: 0, alpha: 0, duration: 200, ease: 'Back.in',
            onComplete: onCompleteCallback
        });
    }

    closeScene() {
        this.sound.resumeAll();
        this.scene.stop();
        this.scene.resume('GameScene');
    }

    update() {}
}