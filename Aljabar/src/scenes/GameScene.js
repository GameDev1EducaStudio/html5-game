import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('bgGame', 'assets/bgGame.png');
        this.load.image('mainContainer', 'assets/mainContainer.png');
        this.load.image('box', 'assets/box.png');
        this.load.image('panelTime', 'assets/panelTime.png');
        
        this.load.image('btnCancel', 'assets/btnCancel.png');
        this.load.image('btnCancelHover', 'assets/btnCancelHover.png');
        this.load.image('btnCancelClick', 'assets/btnCancelClick.png');
        
        this.load.image('btnSmall', 'assets/btnSmall.png');
        this.load.image('btnSmallHover', 'assets/btnSmallHover.png');
        this.load.image('btnSmallClick', 'assets/btnSmallClick.png');
        this.load.image('btnSmallLock', 'assets/btnSmallLock.png');
        
        this.load.image('btnLeft', 'assets/btnLeft.png');
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png');
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png');
        
        this.load.image('btnHome', 'assets/btnHome.png');
        this.load.image('btnHomeHover', 'assets/btnHomeHover.png');
        this.load.image('btnHomeClick', 'assets/btnHomeClick.png');
        
        this.load.image('btnAccept', 'assets/btnAccept.png');
        this.load.image('btnAcceptHover', 'assets/btnAcceptHover.png');
        this.load.image('btnAcceptClick', 'assets/btnAcceptClick.png');

        this.load.image('panelPaused', 'assets/panelPaused.png');
        this.load.image('panelWarning', 'assets/panelWarning.png');
        this.load.image('imgPause', 'assets/imgPause.png');
        
        this.load.image('0stars', 'assets/0stars.png');
        this.load.image('1stars', 'assets/1stars.png');
        this.load.image('2stars', 'assets/2stars.png');
        this.load.image('3stars', 'assets/3stars.png');

        // Menggunakan ukuran horizontal asli (menggunakan opsi 6 frame = 1808)
    this.load.spritesheet('pirate_idle', 'assets/Spritesheet/pirate_idle 1293 x 1550.png', {
            frameWidth: 1550, 
            frameHeight: 1293 
        });
        this.load.spritesheet('pirate_attack', 'assets/Spritesheet/pirate_attack 1293 x 1550.png', {
            frameWidth: 1550, 
            frameHeight: 1293 
        });
        this.load.spritesheet('pirate_hurt', 'assets/Spritesheet/pirate_hurt 1293 x 1550.png', {
            frameWidth: 1550, 
            frameHeight: 1293 
        });
        this.load.spritesheet('pirate_jump', 'assets/Spritesheet/pirate_jump 1293 x 1550.png', {
            frameWidth: 1550, 
            frameHeight: 1293 
        });

        // Audio
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
        this.load.audio('sfx_win', 'assets/Audio/sfx_win.mp3');
        this.load.audio('sfx_lose', 'assets/Audio/sfx_lose.mp3');
    }

    init(data) {
        this.initialData = data || {};
        this.problems = data.problems || [];
        this.mode = data.mode || 'practice';
        this.initialTime = data.timeLimit || 120;
        this.elapsedTime = 0;
        this.timeLeft = this.initialTime;
        this.levelId = data.levelId || 'level_1';
        this.practiceRange = data.range;
        this.practiceOp = data.op;
        this.isResultProcessing = false;
        this.isGameDone = false;
        this.isTimeUp = false;
        this.sndResult = null;
    }

    create() {
        // Deklarasi variabel ukuran layar secara lokal agar tidak menjadi variabel global
        const w = this.scale.width;
        const h = this.scale.height;
        const cx = w / 2;
        const cy = h / 2;

        // Launch UIScene jika belum aktif
        if (!this.scene.get('UIScene').scene.isActive()) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');

        // Background
        const bgTop = this.add.image(cx, cy, 'bgGame').setDepth(0);
        const scaleX = w / bgTop.width;
        const scaleY = h / bgTop.height;
        const scale = Math.max(scaleX, scaleY);
        bgTop.setScale(scale).setScrollFactor(0);

        // Tombol Pause
        const btnPause = this.add.image(w - 220, 60, 'btnCancel').setInteractive().setScale(0.1);
        btnPause.on('pointerover', () => btnPause.setTexture('btnCancelHover'));
        btnPause.on('pointerout', () => btnPause.setTexture('btnCancel'));
        btnPause.on('pointerdown', () => { btnPause.setTexture('btnCancelClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnPause.on('pointerup', () => {
            btnPause.setTexture('btnCancel');
            this.showPausePopup(w, h, cx, cy);
        });

        // Main Container untuk Grid Soal
        this.mainContainer = this.add.container(w * 0.35, cy);
        const panelBg = this.add.image(0, 0, 'mainContainer').setDisplaySize(w * 0.55, h * 0.80);
        this.mainContainer.add(panelBg);

        // Menampilkan Judul (Dipindah ke luar loop agar tidak terbuat berulang kali)
        let opSymbol = '';
        if (this.practiceOp === 'tambah') opSymbol = '+';
        else if (this.practiceOp === 'kurang') opSymbol = '-';
        else if (this.practiceOp === 'kali') opSymbol = 'x';
        else if (this.practiceOp === 'bagi') opSymbol = ':';

        let titleContent = this.mode === 'practice' 
            ? `Latihan ${this.practiceRange} ( ${opSymbol} )` 
            : `Level ${this.levelId.split('_')[1]} ${this.practiceRange} ( ${opSymbol} )`;

        this.add.text(cx - 150, 40, titleContent, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
        }).setOrigin(0.5).setDepth(1);

        // Setup Grid Soal
        this.boxes = [];
        const cols = 4;
        const rows = 4;
        const panelW = w * 0.65;
        const panelH = h * 0.90;
        const gapX = panelW / (cols + 1);
        const gapY = panelH / (rows + 1);

        this.boxWidth = panelW * 0.15;
        this.boxHeight = panelH * 0.20;

        const TEXT_RES = 5;
        const TEXT_SCALE = 1 / TEXT_RES;

        this.problems.forEach((p, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = -panelW / 2 + gapX * (col + 1);
            const y = -panelH / 2 + gapY * (row + 1);

            const box = this.add.container(x, y);
            this.mainContainer.add(box);

            const bg = this.add.image(0, 0, "box").setDisplaySize(this.boxWidth, this.boxHeight);

            // Hitung Kunci Jawaban
            let correct = 0;
            let symbol = '';
            if (p.op === 'tambah') { correct = p.a + p.b; symbol = '+'; }
            else if (p.op === 'kurang') { correct = p.a - p.b; symbol = '-'; }
            else if (p.op === 'kali') { correct = p.a * p.b; symbol = 'x'; }
            else if (p.op === 'bagi') { correct = p.a / p.b; symbol = ':'; }

            // Generate Pilihan Ganda (1 Benar, 3 Salah)
            const options = [correct];
            while (options.length < 4) {
                let wrong = correct + Phaser.Math.Between(-10, 10);
                wrong = Math.abs(wrong);
                if (wrong !== correct && !options.includes(wrong)) {
                    options.push(wrong);
                }
            }
            Phaser.Utils.Array.Shuffle(options);

            // Helper Text Crisp (Dual Text Anti Blur)
            const createDualText = (posX, posY, content) => {
                const small = this.add.text(posX, posY, content, { fontSize: this.boxHeight * 0.22, color: '#000', fontFamily: 'Arial' }).setOrigin(0.5);
                const big = this.add.text(posX, posY, content, { fontSize: (this.boxHeight * 0.22) * TEXT_RES, color: '#000', fontFamily: 'Arial' }).setOrigin(0.5).setScale(TEXT_SCALE).setVisible(false);
                return { small, big };
            };

            const topObj = createDualText(this.boxWidth * 0.20, -this.boxHeight * 0.25, p.a);
            const opObj = createDualText(-this.boxWidth * 0.15, -this.boxHeight * 0.05, symbol);
            const botObj = createDualText(this.boxWidth * 0.20, -this.boxHeight * 0.05, p.b);

            // Garis pembatas matematika susun
            const line = this.add.graphics();
            line.lineStyle(3, 0x000000, 1);
            line.beginPath();
            line.moveTo(-this.boxWidth * 0.35, this.boxHeight * 0.08);
            line.lineTo(this.boxWidth * 0.35, this.boxHeight * 0.08);
            line.strokePath();

            const ansObj = createDualText(0, this.boxHeight * 0.28, '');
            const answerContainer = this.add.container(0, 0);

            box.add([bg, topObj.small, topObj.big, opObj.small, opObj.big, botObj.small, botObj.big, line, ansObj.small, ansObj.big, answerContainer]);

            box.setSize(this.boxWidth, this.boxHeight);
            box.setInteractive();
            box.originalX = x;
            box.originalY = y;

            box.customData = {
                big: false,
                problem: p,
                bg: bg,
                answerContainer: answerContainer,
                options: options,
                textGroups: { small: [topObj.small, opObj.small, botObj.small, ansObj.small], big: [topObj.big, opObj.big, botObj.big, ansObj.big], ansObj: ansObj },
                correctAnswer: correct,
                userValue: null,
                isRevealed: false
            };

            box.on('pointerdown', () => { this.expandBox(box, h); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
            this.boxes.push(box);
        });

        // Right UI Container
        const rightContainer = this.add.container(cx + 350, cy);

        const timerBg = this.add.image(80, -200, 'panelTime').setScale(0.3);
        this.timerText = this.add.text(100, -200, '00:00', { fontSize: '32px', color: '#000', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

        // Animasi Karakter Pirate 
        if (!this.anims.exists('anim_p_idle')) {
            
            // 1. Proteksi & Kunci Frame IDLE (Total 7 Frame: Indeks 0 sampai 6)
            if (this.textures.exists('pirate_idle')) {
                this.anims.create({
                    key: 'anim_p_idle',
                    frames: this.anims.generateFrameNumbers('pirate_idle', { start: 0, end: 6 }), 
                    frameRate: 12,
                    repeat: 0
                });
            } else {
                console.warn("Texture pirate_idle belum ter-load!");
            }

            // 2. Proteksi & Kunci Frame ATTACK (Total 7 Frame: Indeks 0 sampai 6)
            if (this.textures.exists('pirate_attack')) {
                this.anims.create({
                    key: 'anim_p_attack',
                    frames: this.anims.generateFrameNumbers('pirate_attack', { start: 0, end: 6 }), // Mengunci frame hantu
                    frameRate: 12,
                    repeat: 0
                });
            } else {
                console.warn("Texture pirate_attack belum ter-load!");
            }

            // 3. Proteksi & Kunci Frame HURT
            if (this.textures.exists('pirate_hurt')) {
                this.anims.create({
                    key: 'anim_p_hurt',
                    frames: this.anims.generateFrameNumbers('pirate_hurt', { start: 0, end: 6 }),
                    frameRate: 12,
                    repeat: 0
                });
            }

            // 4. Proteksi & Kunci Frame JUMP
            if (this.textures.exists('pirate_jump')) {
                this.anims.create({
                    key: 'anim_p_jump',
                    frames: this.anims.generateFrameNumbers('pirate_jump', { start: 0, end: 6 }),
                    frameRate: 12,
                    repeat: 0
                });
            }
        }

        const pirateSprite = this.add.sprite(30, -50, 'pirate_idle');
 
        pirateSprite.setScale(0.3); 
        pirateSprite.setFlipX(true);
        pirateSprite.setInteractive();

        pirateSprite.on('pointerdown', () => {
            if (pirateSprite.anims.currentAnim && pirateSprite.anims.currentAnim.key === 'anim_p_hurt') return;
            pirateSprite.play('anim_p_jump');
            if (typeof playSFX === 'function') playSFX(this, 'sndClick');
        });

        pirateSprite.play({ key: 'anim_p_idle', repeat: 10 });
        pirateSprite.on('animationcomplete', (anim) => {
            if (['anim_p_attack', 'anim_p_hurt', 'anim_p_jump'].includes(anim.key)) {
                pirateSprite.play({ key: 'anim_p_idle', repeat: 10 });
            } else if (anim.key === 'anim_p_idle') {
                const chance = Phaser.Math.Between(0, 100);
                if (chance <= 60) pirateSprite.play('anim_p_attack');
                else if (chance >= 80) pirateSprite.play('anim_p_jump');
                else if (chance >= 65 && chance <= 75) pirateSprite.play('anim_p_hurt');
                else pirateSprite.play({ key: 'anim_p_idle', repeat: 20 });
            }
        });

        this.descText = this.add.text(75, 150, "Pilih soal di samping dan jawab. \nKlik Done untuk melihat hasil.", {
            fontSize: '18px', fontFamily: 'Arial', color: '#000000', align: 'center', fontStyle: 'bold', wordWrap: { width: 220 }
        }).setOrigin(0.5);

        // Buttons
        this.btnRestartContainer = this.createButton(150, 250, 'Restart', () => {
            this.showConfirmPopup("Yakin ingin\nmengulang level?", cx, cy, w, h, () => {
                this.scene.restart(this.initialData);
            });
        });

        this.btnDoneContainer = this.createButton(0, 250, 'Done', () => {
            this.handleMainButtonClick(cx, cy, w, h);
        });

        // Back Button
        const btnBack = this.add.image(80, 40, 'btnLeft').setInteractive().setScale(0.07);
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { btnBack.setTexture('btnLeftClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnBack.on('pointerup', () => {
            btnBack.setTexture('btnLeft');
            this.showConfirmPopup("Keluar dari game?", cx, cy, w, h, () => {
                this.handleBackNavigation();
            });
        });

        rightContainer.add([timerBg, this.timerText, pirateSprite, this.descText, this.btnRestartContainer, this.btnDoneContainer]);

        // Init Timer Display
        this.formatTime(this.mode === 'level' ? this.timeLeft : 0);

        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true
        });

        this.updateRestartButtonState();

        // Intro Tweens / Animations
        this.mainContainer.setScale(0);
        rightContainer.setAlpha(0).setX(cx + 450);

        this.tweens.add({
            targets: this.mainContainer,
            scale: 1,
            duration: 800,
            ease: 'Elastic.out',
            easeParams: [1.2, 0.6]
        });

        this.boxes.forEach(box => box.setScale(0));
        this.tweens.add({
            targets: this.boxes,
            scale: 1,
            duration: 600,
            ease: 'Back.out',
            delay: this.tweens.stagger(25)
        });

        this.tweens.add({
            targets: rightContainer,
            alpha: 1,
            x: cx + 350,
            duration: 300,
            ease: 'Power2.out'
        });

        this.tweens.add({
            targets: pirateSprite,
            y: '-=5',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });
    }

    reduceLife() {
        let storedLives = localStorage.getItem('userLives');
        let lives = (storedLives !== null) ? parseInt(storedLives) : 5;
        if (lives > 0) {
            if (lives === 5) {
                localStorage.setItem('lastLifeTime', Date.now().toString());
            }
            lives--;
            localStorage.setItem('userLives', lives.toString());
        }
    }

    stopResultBGM() {
        if (this.sndResult && this.sndResult.isPlaying) {
            this.sndResult.stop();
        }
    }

    showPausePopup(w, h, cx, cy) {
        const gapY = 10;
        if (this.gameTimer) this.gameTimer.paused = true;

        const popup = this.add.container(0, 0).setDepth(20000);
        const dimmer = this.add.rectangle(cx, cy, w, h, 0x000000, 0.6).setInteractive();
        const panel = this.add.image(cx, cy, 'panelPaused').setScale(0);
        const imgPause = this.add.image(cx, cy - 150, 'imgPause').setScale(0);

        const btnResume = this.createButton(cx, cy - 60, 'Resume', () => {
            this.tweens.add({
                targets: popup, scale: 0, duration: 200, ease: 'Back.in',
                onComplete: () => {
                    popup.destroy();
                    if (!this.isGameDone && this.gameTimer) this.gameTimer.paused = false;
                }
            });
        });

        const btnRestart = this.createButton(cx, cy + 10 + gapY, 'Restart', () => {
            popup.setVisible(false);
            this.showConfirmPopup("Yakin ingin \nmengulang?", cx, cy, w, h, 
                () => { this.scene.restart(this.initialData); },
                () => { popup.setVisible(true); if (this.gameTimer) this.gameTimer.paused = true; }
            );
        });

        const btnExit = this.createButton(cx, cy + 80 + gapY * 2, 'Exit', () => {
            popup.setVisible(false);
            this.showConfirmPopup("Keluar dari\ngame?", cx, cy, w, h, 
                () => { this.handleBackNavigation(); },
                () => { popup.destroy(); if (this.gameTimer) this.gameTimer.paused = true; }
            );
        });

        popup.add([dimmer, panel, btnResume, btnRestart, btnExit, imgPause]);
        btnResume.setScale(0); btnRestart.setScale(0); btnExit.setScale(0);

        this.tweens.add({ targets: panel, scale: 0.25, duration: 300, ease: 'Back.out' });
        this.tweens.add({
            targets: [btnResume, btnRestart, btnExit, imgPause],
            scale: (target) => target === imgPause ? 0.2 : 1,
            duration: 300, delay: 100, ease: 'Back.out'
        });
    }

    onTimerTick() {
        if (this.isGameDone) return;
        if (this.mode === 'level') {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.formatTime(this.timeLeft);
            } else {
                this.isTimeUp = true;
                this.handleLevelFailed();
            }
        } else {
            this.elapsedTime++;
            this.formatTime(this.elapsedTime);
        }
    }

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        const minStr = min < 10 ? '0' + min : min;
        const secStr = sec < 10 ? '0' + sec : sec;
        this.timerText.setText(`${minStr}:${secStr}`);

        if (seconds <= 10 && this.mode === 'level') this.timerText.setColor('#ff0000');
        else this.timerText.setColor('#000');
    }

    getAnsweredCount() {
        return this.boxes.filter(b => b.customData.userValue !== null).length;
    }

    updateRestartButtonState() {
        if (this.isGameDone) {
            this.setButtonLock(this.btnRestartContainer, false);
            return;
        }
        const count = this.getAnsweredCount();
        this.setButtonLock(this.btnRestartContainer, count === 0);
    }

    setButtonLock(btnContainer, isLocked) {
        const btnSprite = btnContainer.btnSprite;
        if (isLocked) {
            btnSprite.setTexture('btnSmallLock');
            btnSprite.disableInteractive();
        } else {
            btnSprite.setTexture('btnSmall');
            btnSprite.setInteractive();
            btnSprite.setAlpha(1);
        }
    }

    showConfirmPopup(messageText, cx, cy, w, h, onConfirmCallback, onCancelCallback) {
        if (this.gameTimer) this.gameTimer.paused = true;

        const popupContainer = this.add.container(0, 0).setDepth(999);
        const dimmer = this.add.rectangle(cx, cy, w, h, 0x000000, 0.6).setInteractive();
        const PANEL_SCALE = 0.25;
        const panel = this.add.image(cx, cy, 'panelWarning');

        const txtMessage = this.add.text(cx, cy - 20, messageText, {
            fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold', color: '#000000', align: 'center', wordWrap: { width: 350 }, resolution: 3
        }).setOrigin(0.5);

        const BUTTON_SCALE = 0.15;
        const btnCancel = this.add.image(cx - 70, cy + 120, 'btnCancel').setInteractive();

        btnCancel.on('pointerover', () => btnCancel.setTexture('btnCancelHover'));
        btnCancel.on('pointerout', () => btnCancel.setTexture('btnCancel'));
        btnCancel.on('pointerdown', () => { btnCancel.setTexture('btnCancelClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnCancel.on('pointerup', () => {
            btnCancel.setTexture('btnCancel');
            this.tweens.add({
                targets: [panel, btnCancel, btnAccept, txtMessage],
                scale: 0, duration: 200, ease: 'Back.in',
                onComplete: () => {
                    popupContainer.destroy();
                    if (!this.isGameDone && this.gameTimer) this.gameTimer.paused = false;
                    if (onCancelCallback) onCancelCallback();
                }
            });
        });

        const btnAccept = this.add.image(cx + 70, cy + 120, 'btnAccept').setInteractive();
        btnAccept.on('pointerover', () => btnAccept.setTexture('btnAcceptHover'));
        btnAccept.on('pointerout', () => btnAccept.setTexture('btnAccept'));
        btnAccept.on('pointerdown', () => { btnAccept.setTexture('btnAcceptClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnAccept.on('pointerup', () => {
            btnAccept.setTexture('btnAccept');
            if (onConfirmCallback) onConfirmCallback();
            popupContainer.destroy();
        });

        popupContainer.add([dimmer, panel, txtMessage, btnCancel, btnAccept]);
        panel.setScale(0); btnCancel.setScale(0); btnAccept.setScale(0); txtMessage.setScale(0);

        this.tweens.add({ targets: [panel], scale: PANEL_SCALE, duration: 300, ease: 'Back.out' });
        this.tweens.add({ targets: [txtMessage], scale: 1, duration: 300, ease: 'Back.out' });
        this.tweens.add({ targets: [btnCancel, btnAccept], scale: BUTTON_SCALE, duration: 300, delay: 100, ease: 'Back.out' });
    }

    handleBackNavigation() {
        if (this.gameTimer) this.gameTimer.remove();
        if (this.mode === 'level') {
            if (!this.isGameDone) this.reduceLife();
            this.scene.start('LevelSelectScene', { autoOpenLevel: null });
        } else {
            this.scene.start('PracticeScene');
        }
    }

    createButton(x, y, text, onClick) {
        const container = this.add.container(x, y);
        const btn = this.add.image(0, 0, 'btnSmall').setScale(0.1).setInteractive();
        const txt = this.add.text(0, 0, text, { fontSize: '24px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setTexture('btnSmallHover'));
        btn.on('pointerout', () => btn.setTexture('btnSmall'));
        btn.on('pointerdown', () => { btn.setTexture('btnSmallClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btn.on('pointerup', () => {
            btn.setTexture('btnSmall');
            if (onClick) onClick();
        });

        container.add([btn, txt]);
        container.btnSprite = btn;
        container.btnText = txt;
        return container;
    }

    expandBox(box, h) {
        if (this.isGameDone) {
            if (!box.customData.isRevealed) {
                this.showBoxCorrectAnswer(box);
                const allRevealed = this.boxes.every(b => b.customData.isRevealed);
                if (allRevealed) {
                    const btnTxt = this.btnDoneContainer.btnText;
                    if (this.mode === 'level') {
                        btnTxt.setText("Finish");
                        this.descText.setText("Semua jawaban terbuka. \nKlik Finish. ");
                    } else {
                        btnTxt.setText("New");
                        this.descText.setText("Semua jawaban terbuka. \nKlik New.");
                    }
                }
            }
            return;
        }

        if (box.customData.big) return;

        this.boxes.forEach(b => { if (b !== box) b.disableInteractive(); });
        this.mainContainer.bringToTop(box);

        box.customData.textGroups.ansObj.small.setVisible(false);
        box.customData.textGroups.ansObj.big.setVisible(false);

        const scale = (h * 0.75) / this.boxHeight;
        box.customData.textGroups.small.forEach(t => t.setVisible(false));
        box.customData.textGroups.big.forEach(t => t.setVisible(true));

        this.tweens.add({
            targets: box, scale: scale, x: 0, y: 0, duration: 350, ease: 'Back.out'
        });

        box.customData.big = true;
        this.showAnswers(box);
    }

    showAnswers(box) {
        const options = box.customData.options;
        const ac = box.customData.answerContainer;
        ac.removeAll(true);

        const bgW = box.customData.bg.displayWidth;
        const bgH = box.customData.bg.displayHeight;

        const btnCancel = this.add.image(-bgW / 2 + 25, -bgH / 2 + 25, 'btnCancel').setScale(0.03).setAlpha(0);

        this.time.delayedCall(350, () => {
            this.tweens.add({ targets: btnCancel, alpha: 1, duration: 10 });
            btnCancel.setInteractive();
        });

        btnCancel.on('pointerover', () => btnCancel.setTexture('btnCancelHover'));
        btnCancel.on('pointerout', () => btnCancel.setTexture('btnCancel'));
        btnCancel.on('pointerdown', () => { btnCancel.setTexture('btnCancelClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnCancel.on('pointerup', () => {
            btnCancel.setTexture('btnCancel');
            this.closeBox(box);
        });

        ac.add(btnCancel);

        const btnW = bgW * 0.18;
        const btnH = bgH * 0.20;
        const startY = bgH * 0.25;
        const gapX = btnW * 1.1;
        const TEXT_RES = 5;
        const TEXT_SCALE = 1 / TEXT_RES;

        options.forEach((opt, i) => {
            const x = (i - 1.5) * gapX;
            const bgBtn = this.add.image(x, startY, "box").setDisplaySize(btnW, btnH).setInteractive();
            const txt = this.add.text(x, startY, opt, { fontSize: (btnH * 0.30) * TEXT_RES, color: '#000', fontFamily: 'Arial' }).setOrigin(0.5).setScale(TEXT_SCALE);

            if (box.customData.userValue === opt) {
                bgBtn.setTint(0xcccccc);
            }
            bgBtn.on('pointerdown', () => { this.pickAnswer(box, opt); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
            ac.add([bgBtn, txt]);
        });
    }

    pickAnswer(box, value) {
        box.customData.userValue = value;
        box.customData.textGroups.ansObj.small.setText(`= ${value}`);
        box.customData.textGroups.ansObj.big.setText(`= ${value}`);
        box.customData.answerContainer.removeAll(true);

        this.tweens.add({
            targets: box, scale: 1, x: box.originalX, y: box.originalY, duration: 300, ease: 'Back.out',
            onComplete: () => {
                box.customData.textGroups.big.forEach(t => t.setVisible(false));
                box.customData.textGroups.small.forEach(t => t.setVisible(true));
                box.customData.textGroups.ansObj.small.setVisible(true);
            }
        });

        box.customData.big = false;
        this.boxes.forEach(b => b.setInteractive());
        this.updateRestartButtonState();
    }

    closeBox(box) {
        box.customData.answerContainer.removeAll(true);

        this.tweens.add({
            targets: box, scale: 1, x: box.originalX, y: box.originalY, duration: 300, ease: 'Back.out',
            onComplete: () => {
                box.customData.textGroups.big.forEach(t => t.setVisible(false));
                box.customData.textGroups.small.forEach(t => t.setVisible(true));
                box.customData.textGroups.ansObj.small.setVisible(true);
            }
        });

        box.customData.big = false;
        this.boxes.forEach(b => b.setInteractive());
    }

    showBoxCorrectAnswer(box) {
        const textSmall = box.customData.textGroups.ansObj.small;
        textSmall.setText(`= ${box.customData.correctAnswer}`);
        textSmall.setColor('#00aa00');
        textSmall.setFontStyle('bold');
        box.customData.isRevealed = true;
    }

    checkAnswers() {
        this.isGameDone = true;
        if (this.gameTimer) this.gameTimer.remove();

        let correctCount = 0;
        const totalProblems = this.boxes.length;

        this.boxes.forEach(box => {
            box.setInteractive();
            const userVal = box.customData.userValue;
            const correctVal = box.customData.correctAnswer;
            const textSmall = box.customData.textGroups.ansObj.small;

            if (userVal !== null) {
                if (userVal === correctVal) {
                    correctCount++;
                    box.customData.bg.setTint(0x55ff55);
                    textSmall.setColor('#000000');
                    box.customData.isRevealed = true;
                } else {
                    box.customData.bg.clearTint();
                    textSmall.setColor('#ff0000');
                    textSmall.setFontStyle('bold');
                    box.customData.isRevealed = false;
                }
            } else {
                box.customData.bg.clearTint();
                box.customData.isRevealed = false;
            }
        });

        this.descText.setText(`Benar : ${correctCount}\n`);
        const btnTxt = this.btnDoneContainer.btnText;

        if (this.mode === 'level') {
            if (correctCount === totalProblems) {
                btnTxt.setText("Finish");
                this.descText.setText("Sempurna!\nKlik Finish untuk hasil.");
            } else {
                btnTxt.setText("Reveal");
                this.descText.setText(this.isTimeUp ? "Waktu Habis.\nKlik kotak atau Reveal." : this.descText.text + "Klik kotak atau Reveal untuk melihat jawaban");
            }
        } else {
            this.savePracticeData(correctCount, totalProblems);
            if (correctCount === totalProblems) {
                btnTxt.setText("New");
                this.descText.setText("Klik new untuk soal baru.");
            } else {
                btnTxt.setText("Reveal");
                this.descText.setText(this.descText.text + "Klik kotak atau Reveal untuk melihat jawaban.");
            }
        }

        this.updateRestartButtonState();

        this.boxes.forEach((box, index) => {
            if (box.customData.userValue === box.customData.correctAnswer) {
                this.tweens.add({
                    targets: box, scale: 1.02, duration: 400, yoyo: true, repeat: -1, delay: index * 50, ease: 'Sine.easeInOut'
                });
            }
        });
    }

    revealAllAnswer() {
        this.boxes.forEach(box => {
            if (!box.customData.isRevealed) this.showBoxCorrectAnswer(box);
        });

        const btnTxt = this.btnDoneContainer.btnText;
        if (this.mode === 'level') {
            btnTxt.setText("Finish");
            this.descText.setText("Jawaban terbuka. \nKlik Finish untuk melihat hasil.");
        } else {
            btnTxt.setText("New");
            this.descText.setText("Semua jawaban terbuka.");
        }
    }

    handleMainButtonClick(cx, cy, w, h) {
        const btnText = this.btnDoneContainer.btnText.text;
        if (this.isResultProcessing) return;

        if (btnText === 'Done') {
            const answeredCount = this.getAnsweredCount();
            const totalCount = this.boxes.length;
            const unansweredCount = totalCount - answeredCount;

            let msg = "";
            if (answeredCount === 0) msg = "Kamu belum mengisi soal. \nYakin selesai?";
            else if (answeredCount < totalCount) msg = `Sisa ${unansweredCount} soal. \nYakin selesai?`;
            else msg = "Semua terjawab. \nCek jawaban?";

            this.showConfirmPopup(msg, cx, cy, w, h, () => { this.checkAnswers(); });
        } else if (btnText === 'Reveal') {
            this.revealAllAnswer();
        } else if (btnText === 'Finish') {
            this.isResultProcessing = true;
            this.setButtonLock(this.btnDoneContainer, true);
            const correctCount = this.boxes.filter(b => b.customData.bg.tintTopLeft === 0x55ff55).length;
            this.calculateAndShowResult(correctCount, this.boxes.length, cx, cy, w, h);
        } else if (btnText === 'New') {
            this.regenerateProblems();
        }
    }

    regenerateProblems() {
        const newProblems = this.problems.map(p => {
            let newA, newB;
            if (p.op === 'tambah') { newA = Phaser.Math.Between(1, 20); newB = Phaser.Math.Between(1, 20); }
            else if (p.op === 'kurang') { newA = Phaser.Math.Between(10, 30); newB = Phaser.Math.Between(1, newA); }
            else if (p.op === 'kali') { newA = Phaser.Math.Between(1, 10); newB = Phaser.Math.Between(1, 10); }
            else if (p.op === 'bagi') { newB = Phaser.Math.Between(2, 10); newA = newB * Phaser.Math.Between(1, 10); }
            return { op: p.op, a: newA, b: newB };
        });

        this.scene.restart({
            problems: newProblems, mode: 'practice', range: this.practiceRange, op: this.practiceOp, timeLimit: this.initialTime
        });
    }

    handleLevelFailed() {
        this.isGameDone = true;
        if (this.gameTimer) this.gameTimer.remove();
        this.reduceLife();
        this.checkAnswers();
        this.descText.setText("Waktu Habis!\nKlik kotak untuk melihat jawaban.");
    }

    checkAchievements() {
        if (this.mode !== 'level') return false;
        const currentLvl = parseInt(this.levelId.split('_')[1]);
        let unlocksQueue = [];

        if (currentLvl % 20 === 0) {
            const key = `achv_milestone_${currentLvl}`;
            if (!localStorage.getItem(key)) {
                let mKey = 'medalGold';
                const idx = (currentLvl / 20) - 1;
                if (idx < 2) mKey = 'medalBronze';
                else if (idx < 5) mKey = 'medalSilver';

                unlocksQueue.push({ medalKey: mKey, title: 'KAMU MENDAPATKAN MEDALI!', desc: `Level ${currentLvl} Selesai` });
                localStorage.setItem(key, 'true');
            }
        }

        const currentStars = localStorage.getItem(this.levelId);
        // Memastikan pengecekan jika level yang baru diselesaikan mendapatkan 3 bintang
        if (currentStars && parseInt(currentStars) === 3) {
            let totalPerfect = 0;
            for (let i = 1; i <= 200; i++) {
                const s = localStorage.getItem(`level_${i}`);
                if (s && parseInt(s) === 3) totalPerfect++;
            }

            if (totalPerfect > 0 && totalPerfect % 20 === 0) {
                const key = `achv_perfect_${totalPerfect}`;
                if (!localStorage.getItem(key)) {
                    unlocksQueue.push({ medalKey: 'medalGold', title: 'PERFECT MASTER', desc: `${totalPerfect}x Perfect Scores` });
                    localStorage.setItem(key, 'true');
                }
            }
        }

        if (unlocksQueue.length > 0) {
            this.scene.pause();
            this.scene.launch('UnlockScene', { queue: unlocksQueue });
            this.scene.bringToTop('UnlockScene'); // Diperbaiki penulisan key scene dari 'unlocksScene'
            return true;
        }
        return false;
    }

    calculateAndShowResult(correctCount, totalCount, cx, cy, w, h) {
        let stars = 0;
        const percentage = correctCount / totalCount;

        if (percentage >= 1.0) stars = 3;
        else if (percentage >= 0.8) stars = 2;
        else if (percentage >= 0.5) stars = 1;
        else stars = 0;

        this.saveLevelData(stars);

        const showResult = () => {
            this.showResultPopup(stars, correctCount, totalCount, cx, cy, w, h);
        };

        this.time.delayedCall(100, () => {
            if (this.checkAchievements()) {
                this.events.once('resume', () => {
                    this.time.delayedCall(500, showResult);
                });
            } else {
                this.time.delayedCall(400, showResult);
            }
        });
    }

    saveLevelData(stars) {
        if (this.mode !== 'level') return;
        const oldStars = localStorage.getItem(this.levelId);
        if (!oldStars || stars > parseInt(oldStars)) {
            localStorage.setItem(this.levelId, stars.toString());
        }
    }

    savePracticeData(correct = 0, total = 0) {
        if (this.mode !== 'practice') return;
        try {
            const storageKey = 'mathGame_practiceHistory';
            let history = JSON.parse(localStorage.getItem(storageKey)) || [];

            const newRecord = {
                date: new Date().toISOString(),
                operation: this.practiceOp || 'unknown',
                range: this.practiceRange || 'unknown',
                timeBox: this.timerText.text,
                seconds: this.elapsedTime,
                score: `${correct}/${total}`
            };

            history.push(newRecord);
            if (history.length > 20) history.shift();

            localStorage.setItem(storageKey, JSON.stringify(history));
        } catch (error) {
            console.error("Gagal simpan data", error);
        }
    }

    showResultPopup(stars, correctCount, totalCount, cx, cy, w, h) {
        const popup = this.add.container(0, 0).setDepth(10000);
        const dimmer = this.add.rectangle(cx, cy, w, h, 0x000000, 0.7).setInteractive();
        const panel = this.add.image(cx, cy, 'panelWarning').setScale(0);
        this.stopResultBGM();

        let sfxKey = stars > 0 ? 'sfx_win' : 'sfx_lose';
        this.sndResult = this.sound.add(sfxKey, { volume: 1.0 });
        if (this.registry.get('isVolOn')) this.sndResult.play();

        let rankText = "";
        let rankColor = "#000000";

        if (stars === 3) { rankText = "SEMPURNA!"; rankColor = "#FFD700"; }
        else if (stars === 2) { rankText = "HEBAT!"; rankColor = "#FFA500"; }
        else if (stars === 1) { rankText = "BAGUS!"; rankColor = "#006400"; }
        else { rankText = "JANGAN MENYERAH!"; rankColor = "#FF0000"; }

        const titleText = stars > 0 ? "LEVEL COMPLETE" : "LEVEL FAILED";
        const titleObj = this.add.text(cx, cy - 100, titleText, { fontSize: '120px', color: '#000', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5).setScale(0);

        const starImg = this.add.image(cx, cy - 50, `${stars}stars`).setScale(0);
        const rankObj = this.add.text(cx, cy, rankText, { fontStyle: '900', fontSize: '150px', color: rankColor, stroke: '#ffffff', strokeThickness: 20, fontFamily: 'Arial' }).setOrigin(0.5).setScale(0);

        const wrongCount = totalCount - correctCount;
        const infoObj = this.add.text(cx, cy + 60, `Benar: ${correctCount} Salah: ${wrongCount}`, { fontSize: '100px', color: '#333333', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5).setScale(0);

        const btnHome = this.add.image(cx - 70, cy + 130, 'btnHome').setInteractive().setScale(0);
        btnHome.on('pointerover', () => btnHome.setTexture('btnHomeHover'));
        btnHome.on('pointerout', () => btnHome.setTexture('btnHome'));
        btnHome.on('pointerdown', () => { btnHome.setTexture('btnHomeClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnHome.on('pointerup', () => {
            btnHome.setTexture('btnHome');
            this.stopResultBGM();
            this.handleBackNavigation();
        });

        const btnActionContainer = this.add.container(cx + 70, cy + 130).setScale(0);
        const btnAction = this.add.image(0, 0, 'btnSmall').setOrigin(0.5).setInteractive();
        const txtAction = this.add.text(0, 0, stars > 0 ? "Next" : "Replay", { fontSize: '200px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);

        btnAction.on('pointerover', () => btnAction.setTexture('btnSmallHover'));
        btnAction.on('pointerout', () => btnAction.setTexture('btnSmall'));
        btnAction.on('pointerdown', () => { btnAction.setTexture('btnSmallClick'); if (typeof playSFX === 'function') playSFX(this, 'sndClick'); });
        btnAction.on('pointerup', () => {
            btnAction.setTexture('btnSmall');
            this.stopResultBGM();
            if (stars > 0) {
                const nextLevelNum = parseInt(this.levelId.split('_')[1]) + 1;
                this.scene.start('LevelSelectScene', { autoOpenLevel: `level_${nextLevelNum}` });
            } else {
                this.scene.restart(this.initialData);
            }
        });

        btnActionContainer.add([btnAction, txtAction]);
        popup.add([dimmer, panel, starImg, titleObj, rankObj, infoObj, btnHome, btnActionContainer]);

        // Animate Popup Elements
        this.tweens.add({ targets: panel, scale: 0.25, duration: 400, ease: 'Back.out' });
        this.tweens.add({ targets: titleObj, scale: 0.2, duration: 400, delay: 100, ease: 'Back.out' });
        this.tweens.add({ targets: starImg, scale: 0.25, duration: 400, delay: 200, ease: 'Back.out' });
        this.tweens.add({ targets: rankObj, scale: 0.2, duration: 500, delay: 300, ease: 'Elastic.out' });
        this.tweens.add({ targets: infoObj, scale: 0.2, duration: 400, delay: 400, ease: 'Back.out' });
        this.tweens.add({ targets: [btnHome, btnActionContainer], scale: 0.1, duration: 400, delay: 500, ease: 'Back.out' });
    }
}