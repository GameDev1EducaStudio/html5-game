import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class AchievementScene extends Phaser.Scene {

    constructor() {
        super('AchievementScene');
    }

    preload() {
        this.load.image('bgGame', 'assets/bgGame.png');
        this.load.image('panelLevelSelect', 'assets/panelLevelSelect.png');
        this.load.image('btnShare', 'assets/btnShare.png');
        this.load.image('btnShareHover', 'assets/btnShareHover.png');
        this.load.image('btnShareClick', 'assets/btnShareClick.png');
        this.load.image('btnLeft', 'assets/btnLeft.png');
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png');
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png');
        this.load.image('medalBronze', 'assets/medalBronze.png');
        this.load.image('medalSilver', 'assets/medalSilver.png');
        this.load.image('medalGold', 'assets/medalGold.png');
    }

    create() {
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        const currentCx = currentW / 2;
        const currentCy = currentH / 2;
        
        const btnShare = this.add.image(currentW - 220, 60, 'btnShare').setScale(0.1).setInteractive().setDepth(10);
        
        btnShare.on('pointerover', () => btnShare.setTexture('btnShareHover'));
        btnShare.on('pointerout', () => btnShare.setTexture('btnShare'));
        btnShare.on('pointerdown', () => { btnShare.setTexture('btnShareClick'); playSFX(this, 'sndClick'); });
        
        btnShare.on('pointerup', () => {
            btnShare.setTexture('btnShare');
            console.log("btnshare diklik");
        });
        
        const bg = this.add.image(currentCx, currentCy, 'bgGame').setDepth(-1);
        const scaleX = currentW / bg.width;
        const scaleY = currentH / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        this.add.rectangle(currentCx, currentCy, currentW, currentH, 0x000000, 0.6);
        
        const panel = this.add.image(currentCx, currentCy, 'panelLevelSelect').setScale(0.3);
        
        this.add.text(currentCx, currentCy - 220, "ACHIEVEMENT", {
            fontSize: '48px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const btnBack = this.add.image(80, 80, 'btnLeft').setScale(0.1).setInteractive();
        
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { btnBack.setTexture('btnLeftClick'); playSFX(this, 'sndClick'); });
        btnBack.on('pointerup', () => {
            btnBack.setTexture('btnLeft');
            this.scene.start('Menu');
        });
        
        let totalPerfectCount = 0;
        
        for (let i = 1; i <= 200; i++) {
            const stars = localStorage.getItem(`level_${i}`);
            if (stars && parseInt(stars) === 3) {
                totalPerfectCount++;
            }
        }
        console.log(`Total skor perfect: ${totalPerfectCount}`);
        
        const startX = currentCx - 300;
        const startY = currentCy - 120;
        const gapX = 150;
        const gapY = 135;
        
        const medalElements = [];
        const unlockedMedals = [];
        
        for (let i = 0; i < 15; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            
            const x = startX + (col * gapX);
            const y = startY + (row * gapY);
            
            let isUnlocked = false;
            let medalKey = 'medalGold';
            let labelText = "";
            let labelColorLock = '#555555';
            
            if (i < 10) {
                const targetLevel = (i + 1) * 20;
                const levelData = localStorage.getItem(`level_${targetLevel}`);
                
                isUnlocked = levelData && parseInt(levelData) > 0;
                
                if (i < 2) medalKey = 'medalBronze';
                else if (i < 5) medalKey = 'medalSilver';
                else medalKey = 'medalGold';
                
                labelText = `level ${targetLevel}`;
            } else {
                const targetCount = (i - 10 + 1) * 20;
                isUnlocked = totalPerfectCount >= targetCount;
                
                medalKey = 'medalGold';
                labelText = `${targetCount}x Perfect`;
                labelColorLock = '#886600';
            }
            
            const medal = this.add.image(x, y, medalKey).setScale(0);
            medalElements.push(medal);
            
            if (!isUnlocked) {
                medal.setTint(0x000000);
                medal.setAlpha(0.6);
            } else {
                unlockedMedals.push(medal);
            }
            
            const labelColor = isUnlocked ? '#FFD700' : labelColorLock;
            
            this.add.text(x, y + 60, labelText, {
                fontFamily: 'Arial',
                fontSize: '18px',
                fontStyle: 'bold',
                color: labelColor
            }).setOrigin(0.5);
        }
        
        panel.setScale(0);
        
        this.tweens.add({
            targets: panel,
            scale: 0.3,
            duration: 400,
            ease: 'Elastic.out', 
            easeParams: [0.5, 1.5]
        });
        
        this.tweens.add({
            targets: medalElements,
            scale: 0.5,
            duration: 500,
            ease: 'Elastic.out',
            easeParams: [1.2, 0.6],
            delay: this.tweens.stagger(30),
            onComplete: () => {
                if (unlockedMedals.length > 0) {
                    this.tweens.add({
                        targets: unlockedMedals,
                        scale: 0.48,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        });
    }

    update() {}
}