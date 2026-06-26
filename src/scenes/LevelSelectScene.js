import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super('LevelSelectScene');
    }

    preload() {
        this.load.image('bgGame', 'assets/bgGame.png');
        this.load.image('btnLeft', 'assets/btnLeft.png');
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png');
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png');
        this.load.image('btnRight', 'assets/btnRight.png');
        this.load.image('btnRightHover', 'assets/btnRightHover.png');
        this.load.image('btnRightClick', 'assets/btnRightClick.png');
        this.load.image('btnRound', 'assets/btnRound.png');
        this.load.image('btnRoundHover', 'assets/btnRoundHover.png');
        this.load.image('btnRoundClick', 'assets/btnRoundClick.png');
        this.load.image('btnRoundLock', 'assets/btnRoundLock.png');
        this.load.image('btnLock', 'assets/btnLock.png');
        this.load.image('btnPlay', 'assets/btnPlay.png');
        this.load.image('btnPlayHover', 'assets/btnPlayHover.png');
        this.load.image('btnPlayClick', 'assets/btnPlayClick.png');
        this.load.image('btnCancel', 'assets/btnCancel.png');
        this.load.image('btnCancelHover', 'assets/btnCancelHover.png');
        
        // SINKRONISASI FILE ASLI: Menggunakan huruf kapital 'btnCancelClick'
        this.load.image('btnCancelClick', 'assets/btnCancelClick.png');
        this.load.image('panelWarning', 'assets/panelWarning.png');
        this.load.image('panelTime', 'assets/panelTime.png');
        this.load.image('0stars', 'assets/0stars.png');
        this.load.image('1stars', 'assets/1stars.png');
        this.load.image('2stars', 'assets/2stars.png');
        this.load.image('3stars', 'assets/3stars.png');
        
        // JALUR AUDIO: Folder 'Audio' kapital
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
    }

    create(data) {
        this.currentSlide = 0;
        this.totalSlides = 10;
        this.autoOpenLevel = (data && data.autoOpenLevel) ? data.autoOpenLevel : null;
        this.updateLivesStatus();
        
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        
        this.time.addEvent({
            delay: 1000,
            callback: this.updateLivesStatus,
            callbackScope: this,
            loop: true
        });

        // PROTEKSI SCENE AUDIO: Hentikan UIScene lama sebelum launch baru agar BGM tidak berlipat ganda
        this.scene.stop('UIScene');
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        
        const bg = this.add.image(currentW / 2, currentH / 2, 'bgGame').setDepth(-1);
        const scaleX = currentW / bg.width;
        const scaleY = currentH / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        const btnBack = this.add.image(60, 60, 'btnLeft').setScale(0.1).setInteractive();
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { btnBack.setTexture('btnLeftClick'); playSFX(this, 'sndClick'); });
        btnBack.on('pointerup', () => { btnBack.setTexture('btnLeft'); this.scene.start('Menu'); });
        
        this.titleText = this.add.text(currentW / 2, 60, 'ANGKA 1-9', {
            fontSize: '48px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelGridContainer = this.add.container(0, 0);
        
        this.btnSlideLeft = this.add.image(200, currentH / 2 + 40, 'btnLeft').setScale(0.1).setInteractive().setVisible(false);
        this.setupNavButton(this.btnSlideLeft, 'btnLeft', -1, currentW);
        
        this.btnSlideRight = this.add.image(currentW - 200, currentH / 2 + 40, 'btnRight').setScale(0.1).setInteractive();
        this.setupNavButton(this.btnSlideRight, 'btnRight', 1, currentW);
        
        this.paginationDots = [];
        const dotGap = 50;
        const dotY = currentH - 60;
        const totalDotsWidth = (this.totalSlides - 1) * dotGap;
        const dotStartX = (currentW - totalDotsWidth) / 2;
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dotX = dotStartX + (i * dotGap);
            const dot = this.add.image(dotX, dotY, 'btnRoundLock').setScale(0.05);
            this.paginationDots.push(dot);
        }
        
        if (this.autoOpenLevel) {
            const levelNum = parseInt(this.autoOpenLevel.split('_')[1]);
            let canAutoOpen = false;
            
            if (levelNum === 1) {
                canAutoOpen = true;
            } else {
                const prevLevelId = `level_${levelNum - 1}`;
                const prevStars = localStorage.getItem(prevLevelId);
                if (prevStars && parseInt(prevStars) > 0) canAutoOpen = true;
            }
            
            if (canAutoOpen) {
                const targetSlide = Math.floor((levelNum - 1) / 20);
                if (targetSlide >= 0 && targetSlide < this.totalSlides) {
                    this.currentSlide = targetSlide;
                }
                this.renderLevelGrid(currentW, currentH);
                this.time.delayedCall(400, () => {
                    const limit = 9 + (this.currentSlide * 10);
                    this.showLevelPopup(levelNum, limit, currentW, currentH);
                });
            } else {
                this.renderLevelGrid(currentW, currentH);
            }
        } else {
            this.renderLevelGrid(currentW, currentH);
        }  
        
        const gridItems = this.levelGridContainer.list;
        gridItems.forEach(item => item.setScale(0));
        
        this.tweens.add({
            targets: gridItems,
            scale: (target) => {
                if (target.texture && target.texture.key === 'btnRound') return 0.13;
                if (target.texture && target.texture.key === 'btnLock') return 0.13;
                if (target.type === 'Text') return 1;
                return 0.3;
            },
            duration: 800,
            ease: 'Elastic.out',
            easeParams: [1.2, 0.5],
            delay: this.tweens.stagger(5)
        });
    }

    updateLivesStatus() {
        let storedLives = localStorage.getItem('userLives');
        let lives = (storedLives !== null) ? parseInt(storedLives) : 5;
        let storedTime = localStorage.getItem('lastLifeTime');
        let lastTime = (storedTime !== null) ? parseInt(storedTime) : Date.now();
        
        let now = Date.now();
        let diffMs = now - lastTime;
        let intervalPassed = Math.floor(diffMs / (1000 * 60 * 30));
        
        if (intervalPassed > 0 && lives < 5) {
            lives = Math.min(5, lives + intervalPassed);
            let newTime = lastTime + (intervalPassed * 1000 * 60 * 30);
            localStorage.setItem('userLives', lives);
            localStorage.setItem('lastLifeTime', newTime);
        }
        this.currentLives = lives;
    }

    drawLivesUi(posX, posY) {
        this.livesContainer = this.add.container(posX - 100, 60);
        const heart = this.add.image(0, 0, 'btnRound').setScale(0.08);
        this.livesText = this.add.text(0, 0, this.currentLives, {
            fontSize: '24px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.livesTimerText = this.add.text(80, 0, "00:00", {
            fontSize: '24px', fontStyle: 'bold', color: '#000000', fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.livesContainer.add([heart, this.livesText, this.livesTimerText]);
        this.updateLivesStatus();
    }

    setupNavButton(btn, keyName, direction, w) {
        btn.on('pointerover', () => btn.setTexture(keyName + 'Hover'));
        btn.on('pointerout', () => btn.setTexture(keyName));
        btn.on('pointerdown', () => { btn.setTexture(keyName + 'Click'); playSFX(this, 'sndClick'); });
        btn.on('pointerup', () => { btn.setTexture(keyName); this.changeSlide(direction, w); });
    }

    changeSlide(direction, w) {
        const newSlide = this.currentSlide + direction;
        if (newSlide >= 0 && newSlide < this.totalSlides) {
            const targetX = direction > 0 ? -w : w;
            this.tweens.add({
                targets: this.levelGridContainer,
                x: targetX, alpha: 0, duration: 300, ease: 'Power2.easeIn',
                onComplete: () => {
                    this.currentSlide = newSlide;
                    this.renderLevelGrid(w, this.game.canvas.height);
                    this.levelGridContainer.x = direction > 0 ? w : -w;
                    this.levelGridContainer.alpha = 0;
                    
                    this.tweens.add({
                        targets: this.levelGridContainer, x: 0, alpha: 1, duration: 500, ease: 'Back.out', easeParams: [1.2]
                    });
                }
            });
        }
    }

    renderLevelGrid(w, h) {
        this.levelGridContainer.removeAll(true);
        
        const currentLimit = 9 + (this.currentSlide * 10);
        this.titleText.setText(`Angka 1- ${currentLimit}`);
        
        const rows = 4;
        const cols = 5;
        const gapX = 140;
        const gapY = 120;
        const totalGridWidth = (cols - 1) * gapX;
        const totalGridHeight = (rows - 1) * gapY;
        const startX = (w - totalGridWidth) / 2;
        const startY = (h - totalGridHeight) / 2 + 10;
        
        let currentLevelNum = (this.currentSlide * 20) +1;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + (c * gapX);
                const y = startY + (r * gapY);
                const levelToPlay = currentLevelNum;
                let isLocked = true;
                
                if (levelToPlay === 1) {
                    isLocked = false;
                } else {
                    const prevLevelId = `level_${levelToPlay - 1}`;
                    const prevStars = localStorage.getItem(prevLevelId);
                    if (prevStars && parseInt(prevStars) > 0) isLocked = false;
                }
                
                if (isLocked) {
                    const btnLocked = this.add.image(x, y, 'btnLock').setScale(0.13);
                    this.levelGridContainer.add(btnLocked);
                } else {
                    const levelId = `level_${levelToPlay}`;
                    const starsEarned = localStorage.getItem(levelId) || 0;
                    const btnLevel = this.add.image(x, y, 'btnRound').setScale(0.13).setInteractive();
                    const starImg = this.add.image(x, y + 40, `${starsEarned}stars`).setScale(0.3);
                    const txtLevel = this.add.text(x, y + 5, levelToPlay.toString(), {
                        fontSize: '42px', fontFamily: 'Arial', fontStyle: 'bold', color: '#004080'
                    }).setOrigin(0.5);
        
                    btnLevel.on('pointerover', () => { btnLevel.setTexture('btnRoundHover'); });
                    btnLevel.on('pointerout', () => btnLevel.setTexture('btnRound'));
                    btnLevel.on('pointerdown', () => { btnLevel.setTexture('btnRoundClick'); playSFX(this, 'sndClick'); });
                    btnLevel.on('pointerup', () => {
                        btnLevel.setTexture('btnRound');
                        this.showLevelPopup(levelToPlay, currentLimit, w, h);
                    });
                    
                    this.levelGridContainer.add([btnLevel, starImg, txtLevel]);
                }
                currentLevelNum++;
            }
        }
        
        this.paginationDots.forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.setTexture('btnRoundHover').setScale(0.04);
            } else {
                dot.setTexture('btnRoundLock').setScale(0.03);
            }
        });
        
        this.btnSlideLeft.setVisible(this.currentSlide > 0);
        this.btnSlideRight.setVisible(this.currentSlide < this.totalSlides - 1);
    }

    showLevelPopup(level, limit, w, h) {
        const relativeLevel = (level - 1) % 20 + 1;
        let op = 'tambah'; let opName = "Penjumlahan"; let opSymbol = "+";
        
        if (relativeLevel <= 5) { op = 'tambah'; opName = "Penjumlahan"; opSymbol = "+"; }
        else if (relativeLevel <= 10) { op = 'kurang'; opName = "Pengurangan"; opSymbol = "-"; }
        else if (relativeLevel <= 15) { op = 'kali'; opName = "Perkalian"; opSymbol = "x"; }
        else { op = 'bagi'; opName = "Pembagian"; opSymbol = ":"; }
        
        const baseTime = 120;
        const increment = Math.floor(this.currentSlide / 2) * 120;
        const timeLimit = baseTime + increment;
        
        const min = Math.floor(timeLimit / 60);
        const sec = timeLimit % 60;
        const minStr = min < 10 ? "0" + min : min;
        const secStr = sec < 10 ? "0" + sec : sec;
        const timeString = `${minStr}:${secStr}`;
        
        const popupContainer = this.add.container(0, 0).setDepth(999);
        const dimmer = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
        const panel = this.add.image(w / 2, h / 2, 'panelWarning');
        
        const titleStyle = { fontSize: '36px', fontStyle: 'bold', color: '#000000', fontFamily: 'Arial' };
        const infoStyle = { fontSize: '28px', color: '#333333', align: 'center', lineSpacing: 10, fontFamily: 'Arial' };
        
        const txtTitle = this.add.text(w / 2, h / 2 - 130, `LEVEL ${level}`, titleStyle).setOrigin(0.5);
        const infoContent = `Operasi: ${opName} (${opSymbol})\nBatas Angka: 1-${limit}`;
        const txtInfo = this.add.text(w / 2, h / 2 - 60, infoContent, infoStyle).setOrigin(0.5);
        
        const imgTime = this.add.image(w / 2, h / 2 + 30, 'panelTime').setScale(0.3);
        const txtTime = this.add.text(w / 2 + 20, h / 2 + 30, timeString, {
            fontSize: '32px', fontStyle: 'bold', color: '#000000', fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        const btnPlay = this.add.image(w / 2, h / 2 + 160, 'btnPlay').setScale(0.3).setInteractive();
        
        btnPlay.on('pointerover', () => btnPlay.setTexture('btnPlayHover'));
        btnPlay.on('pointerout', () => btnPlay.setTexture('btnPlay'));
        btnPlay.on('pointerdown', () => { btnPlay.setTexture('btnPlayClick'); playSFX(this, 'sndClick'); });
        btnPlay.on('pointerup', () => {
            if (this.currentLives <= 0) return;
            const problems = this.generateProblems(op, limit, 16);
            this.scene.start('GameScene', {
                problems: problems, mode: 'level', timeLimit: timeLimit, levelId: `level_${level}`, range: `1-${limit}`, op: op, isGame: true
            });
        });
        
        const btnClose = this.add.image(w / 2 - 300, h / 2 - 200, 'btnCancel').setScale(0).setInteractive();
        const closeFunc = () => popupContainer.destroy();
        
        btnClose.on('pointerover', () => btnClose.setTexture('btnCancelHover'));
        btnClose.on('pointerout', () => btnClose.setTexture('btnCancel'));
        
        // PERBAIKAN SINKRONISASI ASSET: Mengubah tekstur menjadi 'btnCancelClick' kapital
        btnClose.on('pointerdown', () => { btnClose.setTexture('btnCancelClick'); playSFX(this, 'sndClick'); });
        btnClose.on('pointerup', closeFunc);
        dimmer.on('pointerdown', closeFunc);
        
        popupContainer.add([dimmer, panel, txtTitle, txtInfo, imgTime, txtTime, btnPlay, btnClose]);
        panel.setScale(0); btnPlay.setScale(0); txtTitle.setScale(0); txtInfo.setScale(0); imgTime.setScale(0); txtTime.setScale(0);
        
        this.tweens.add({
            targets: [panel, btnPlay, txtTitle, txtInfo, imgTime, txtTime], scale: { from: 0, to: 1 },
            onUpdate: (tween) => {
                const val = tween.getValue();
                panel.setScale(val * 0.35); btnPlay.setScale(val * 0.25); imgTime.setScale(val * 0.3);
                txtTitle.setScale(val); txtInfo.setScale(val); txtTime.setScale(val);
            },
            duration: 300, ease: 'Back.out',
            onComplete: () => {
                this.tweens.add({
                    targets: btnPlay, scaleX: 0.255, scaleY: 0.248, duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
            }
        });
        
        this.tweens.add({ targets: btnClose, scale: { from: 0, to: 0.1 }, duration: 300, delay: 100, ease: 'Back.out' });
    }

    generateProblems(op, limit, count) {
        const problems = [];
        for (let i = 0; i < count; i++) {
            let a, b;
            if (op === 'tambah') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, limit);
            } else if (op === 'kurang') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, limit);
                if (b > a) [a, b] = [b, a];
            } else if (op === 'kali') {
                a = Phaser.Math.Between(1, limit); b = Phaser.Math.Between(1, 10);
            } else if (op === 'bagi') {
                b = Phaser.Math.Between(2, 10); let res = Phaser.Math.Between(1, limit); a = b * res;
            }
            problems.push({ a: a, b: b, op: op });
        }
        return problems;
    }

    update() {}
}