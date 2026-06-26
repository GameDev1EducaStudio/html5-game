import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class PracticeScene extends Phaser.Scene {

    constructor() {
        super('PracticeScene');
    }

    preload() { 
        this.load.image('bgGame', 'assets/bgGame.png');
        this.load.image('btnLeft', 'assets/btnLeft.png');
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png');
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png');
        this.load.image('btnRound', 'assets/btnRound.png');
        this.load.image('btnRoundHover', 'assets/btnRoundHover.png');
        this.load.image('btnRoundClick', 'assets/btnRoundClick.png');
        this.load.image('btnSmall', 'assets/btnSmall.png');
        this.load.image('btnSmallHover', 'assets/btnSmallHover.png');
        this.load.image('btnSmallClick', 'assets/btnSmallClick.png');
        this.load.image('btnPlay', 'assets/btnPlay.png');
        this.load.image('btnPlayHover', 'assets/btnPlayHover.png');
        this.load.image('btnPlayClick', 'assets/btnPlayClick.png');
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
    }

    create(data) {
        this.selectedOp = null;
        this.selectedLimit = null;
        
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        
        if (!this.scene.get('UIScene').scene.isActive()) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');
        
        const bg = this.add.image(currentW / 2, currentH / 2, 'bgGame').setDepth(-1);
        const scaleX = currentW / bg.width;
        const scaleY = currentH / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        const btnBack = this.add.image(60, 60, 'btnLeft').setScale(0.1).setInteractive();
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { 
            btnBack.setTexture('btnLeftClick'); 
            playSFX(this, 'sndClick'); 
        });
        btnBack.on('pointerup', () => {
            btnBack.setTexture('btnLeft');
            this.scene.start('Menu');
        });
        
        this.add.text(currentW / 2, 60, 'MODE LATIHAN', {
            fontSize: '48px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.opButtons = [];
        this.limitButtons = [];
        
        const ops = [
            { key: 'tambah', symbol: '+' },
            { key: 'kurang', symbol: '-' },
            { key: 'kali', symbol: 'x' },
            { key: 'bagi', symbol: ':' }
        ];
        
        const opContX = currentW * 0.25;
        const opContY = currentH / 2;
        const opContainer = this.add.container(opContX, opContY);
        
        const opTitle = this.add.text(0, -180, 'Operasi', {
            fontSize: '24px', fill: '#ffff00', fontStyle: 'bold', fontFamily: 'Arial'
        }).setOrigin(0.5);
        opContainer.add(opTitle);
        
        const gapY_op = 80;
        const startY_op = -120;
        
        ops.forEach((op, index) => {
            const btnY = startY_op + (index * gapY_op);
            const btn = this.add.image(0, btnY, 'btnRound').setInteractive().setScale(0.1);
            btn.myDataKey = op.key;
            
            btn.on('pointerover', () => {
                if (this.selectedOp !== op.key) btn.setTexture('btnRoundHover');
            });
            btn.on('pointerout', () => {
                if (this.selectedOp !== op.key) btn.setTexture('btnRound');
            });
            btn.on('pointerdown', () => {
                this.selectOperation(op.key, btn);
                playSFX(this, 'sndClick');
            });
            
            const text = this.add.text(0, btnY, op.symbol, {
                fontSize: '40px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            this.opButtons.push(btn);
            opContainer.add([btn, text]);
        });
        
        const limits = [9, 19, 29, 39, 49, 59, 69, 79, 89, 99];
        const limitContX = currentW * 0.55;
        const limitContY = currentH / 2;
        const limitContainer = this.add.container(limitContX, limitContY);
        
        const limitTitle = this.add.text(50, -180, 'Batas Angka', {
            fontSize: '24px', fill: '#ffff00', fontStyle: 'bold', fontFamily: 'Arial'
        }).setOrigin(0.5);
        limitContainer.add(limitTitle);
        
        const gapX_Limit = 150;
        const gapY_Limit = 100;
        const startX_Btns = -110;
        const startY_Btns = -120;
        
        limits.forEach((limit, index) => {
            let col = index % 3;
            let row = Math.floor(index / 3);
            if (index === limits.length - 1) col = 1;
            
            const x = startX_Btns + (col * gapX_Limit);
            const y = startY_Btns + (row * gapY_Limit);
            
            const btn = this.add.image(x, y, 'btnSmall').setInteractive().setScale(0.1);
            btn.myDataKey = limit;
            
            btn.on('pointerover', () => {
                if (this.selectedLimit !== limit) btn.setTexture('btnSmallHover');
            });
            btn.on('pointerout', () => {
                if (this.selectedLimit !== limit) btn.setTexture('btnSmall');
            });
            btn.on('pointerdown', () => {
                this.selectLimit(limit, btn);
                playSFX(this, 'sndClick');
            });
            
            const label = this.add.text(x, y, `1-${limit}`, {
                fontSize: '20px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            this.limitButtons.push(btn);
            limitContainer.add([btn, label]);
        });
        
        this.startBtn = this.add.image(currentW - 200, currentH - 150, 'btnPlay').setInteractive().setVisible(false).setScale(0.2);
        this.startBtn.on('pointerover', () => this.startBtn.setTexture('btnPlayHover'));
        this.startBtn.on('pointerout', () => this.startBtn.setTexture('btnPlay'));
        this.startBtn.on('pointerdown', () => {
            this.startBtn.setTexture('btnPlayClick');
            playSFX(this, 'sndClick');
            this.generateAndStart();
        });
        
        this.tweens.add({
            targets: this.startBtn,
            y: '+=20', scaleX: 0.205, scaleY: 0.198, yoyo: true, repeat: -1, repeatDelay: 200, ease: 'Sine.easeInOut', duration: 400,
            onStart: () => { this.startBtn.setScale(0.205, 0.198); }
        });
        
        const allButtons = [...this.opButtons, ...this.limitButtons];
        allButtons.forEach(btn => btn.setScale(0));
        
        const allText = [];
        opContainer.iterate(child => { if (child.type === 'Text') { child.setScale(0); allText.push(child); } });
        limitContainer.iterate(child => { if (child.type === 'Text') { child.setScale(0); allText.push(child); } });
        
        this.tweens.add({
            targets: [...allButtons, ...allText],
            scale: (target) => target.type === 'Text' ? 1 : 0.1,
            duration: 1000,
            ease: 'Elastic.out',
            easeParams: [1.5, 0.5],
            delay: this.tweens.stagger(5)
        });
    }

    selectOperation(opKey, btnObject) {
        this.selectedOp = opKey;
        this.opButtons.forEach(b => b.setTexture('btnRound'));
        btnObject.setTexture('btnRoundClick');
        
        this.tweens.add({
            targets: btnObject, scaleX: 0.105, scaleY: 0.09, duration: 100, yoyo: true, ease: 'Quad.easeOut'
        });
        this.checkReady();
    }

    selectLimit(limitVal, btnObject) {
        this.selectedLimit = limitVal;
        this.limitButtons.forEach(b => b.setTexture('btnSmall'));
        btnObject.setTexture('btnSmallClick');
        
        this.tweens.add({
            targets: btnObject, scaleX: 0.105, scaleY: 0.09, duration: 100, yoyo: true, ease: 'Quad.easeOut'
        });
        this.checkReady();
    }

    checkReady() {
        if (this.selectedOp && this.selectedLimit) {
            if (!this.startBtn.visible) {
                this.startBtn.setVisible(true);
                this.tweens.add({
                    targets: this.startBtn, scale: { from: 0, to: 0.2 }, duration: 300, ease: 'Back.out'
                });
            }
        }
    }

    generateAndStart() {
        const problems = [];
        const count = 16;
        const limit = this.selectedLimit;
        const op = this.selectedOp;
        
        for (let i = 0; i < count; i++) {
            let a, b;
            if (op === 'tambah') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, limit);
            } else if (op === 'kurang') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, limit);
            } else if (op === 'kali') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, 10);
            } else if (op === 'bagi') {
                b = Phaser.Math.Between(2, 10); let res = Phaser.Math.Between(1, limit); a = b * res;
            }
            problems.push({ a: a, b: b, op: op });
        }
        
        this.scene.start('GameScene', {
            problems: problems, mode: 'practice', range: `1-${limit}`, op: op, isGame: true
        });
    }

    update() {}
}