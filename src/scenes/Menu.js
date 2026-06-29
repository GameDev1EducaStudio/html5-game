import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class Menu extends Phaser.Scene {

    constructor() {
        super('Menu');
    }

    preload() { 
        // Assets Background & Logo
        this.load.image('bg_menu', 'assets/bgStart.png'); 
        this.load.image('logo_game', 'assets/logo.png');  
        this.load.image('bgGame', 'assets/bgGame.png');  

        // Perbaikan: Menyamakan key 'btnPlay' agar sesuai dengan yang dipanggil di create()
        this.load.image('btnPlay', 'assets/btnPlay.png');
        this.load.image('btnPlayHover', 'assets/btnPlayHover.png'); 
        this.load.image('btnPlayClick', 'assets/btnPlayClick.png'); 

        // Assets untuk btnBack
        this.load.image('btnLeft', 'assets/btnLeft.png');           
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png'); 
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png'); 

        // Assets untuk Frame
        this.load.image('frameReg', 'assets/frameReg.png');         

        // Assets Tombol Kecil
        this.load.image('btnSmall', 'assets/btnSmall.png');
        this.load.image('btnSmallLock', 'assets/btnSmallLock.png');
        this.load.image('btnSmallClick', 'assets/btnSmallClick.png'); 
        this.load.image('btnSmallHover', 'assets/btnSmallHover.png'); 
        
        // Preload tekstur untuk partikel flare kursor (Gunakan 'flares' bawaan Phaser atau aset Anda)
        this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json');

        // Audio
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
        this.load.audio('bgm_menu', 'assets/Audio/bgm.mp3');
    }

    create() {
        // Menggunakan canvas width & height dinamis dari konfigurasi game aktif
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        const gapY = 50;
        const gapX = 300;
        const gapBtn = 120;
        
        const UiElements = [];
        
        // Manajemen Scene UI
        if (!this.scene.get('UIScene').scene.isActive()) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');

        // Background Setup (Responsive Scaling)
        const bg = this.add.image(currentW / 2, currentH / 2, 'bgGame').setDepth(-1);
        const scaleX = currentW / bg.width;
        const scaleY = currentH / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        // Tombol Kembali (Back)
        const btnBack = this.add.image(60, 60, 'btnLeft').setScale(0.1).setInteractive();
        
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { btnBack.setTexture('btnLeftClick'); playSFX(this, 'sndClick'); });
        btnBack.on('pointerup', () => {
            btnBack.setTexture('btnLeft');
            this.scene.start('Play');
        });
        
        // Struktur Menu Kiri: LATIHAN
        const frameScale = 0.2;
        const frameY = currentH / 2 - gapY;
        const titleY = frameY - 180;
        
        const frameReg = this.add.image(currentW / 2 - gapX, frameY, 'frameReg').setScale(frameScale);
        const txtLatihan = this.add.text(currentW / 2 - gapX, titleY, "LATIHAN", {
            fontSize: '36px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        
        const btnPlayReg = this.add.image(currentW / 2 - gapX, frameY + gapBtn, 'btnPlay').setScale(0.2).setInteractive();
        btnPlayReg.on('pointerover', () => btnPlayReg.setTexture('btnPlayHover'));
        btnPlayReg.on('pointerout', () => btnPlayReg.setTexture('btnPlay'));
        btnPlayReg.on('pointerdown', () => { btnPlayReg.setTexture('btnPlayClick'); playSFX(this, 'sndClick'); });
        btnPlayReg.on('pointerup', () => { 
            btnPlayReg.setTexture('btnPlay'); 
            this.scene.start('PracticeScene', { mode: 'practice' }); 
        });

        const smallBtnY = (currentH / 2 - gapY + gapBtn) - 150;
        const btnHis = this.createSmallButton(currentW / 2 - gapX, smallBtnY, 'History', () => {
            this.scene.start('HistoryScene');
        });
        
        // Struktur Menu Kanan: LEVEL SELECT
        const frameMap = this.add.image(currentW / 2 + gapX, frameY, 'frameReg').setScale(frameScale);
        const txtLvlSelect = this.add.text(currentW / 2 + gapX, titleY, "LEVEL SELECT", {
            fontSize: '36px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        
        const btnPlayMap = this.add.image(currentW / 2 + gapX, frameY + gapBtn, 'btnPlay').setScale(0.2).setInteractive();
        btnPlayMap.on('pointerover', () => btnPlayMap.setTexture('btnPlayHover'));
        btnPlayMap.on('pointerout', () => btnPlayMap.setTexture('btnPlay'));
        btnPlayMap.on('pointerdown', () => { btnPlayMap.setTexture('btnPlayClick'); playSFX(this, 'sndClick'); });
        btnPlayMap.on('pointerup', () => {
            btnPlayMap.setTexture('btnPlay'); 
            this.scene.start('LevelSelectScene', { mode: 'level' });
        });
        
        const btnAchieve = this.createSmallButton(currentW / 2 + gapX, smallBtnY, 'Achievement', () => {
            this.scene.start('AchievementScene');
        });
        
        // Koleksi Objek UI untuk Transisi Intro Animasi
        UiElements.push(btnBack, frameReg, frameMap, txtLvlSelect, txtLatihan, btnPlayMap, btnPlayReg, btnHis, btnAchieve);
        
        // Sembunyikan elemen sebelum animasi Back dijalankan
        UiElements.forEach(el => el.setScale(0));
        
        // Tween Intro (Elemen UI Pop Up Satu per Satu)
        this.tweens.add({
            targets: UiElements,
            scale: (target) => {
                if (target === btnBack) return 0.1;
                if (target === btnPlayMap || target === btnPlayReg || target === frameMap || target === frameReg) return 0.2;
                return 1; // Skala default untuk teks dan objek Container tombol kecil
            },
            duration: 600,
            ease: 'Back.easeOut',
            delay: this.tweens.stagger(50)
        });
         
        // Tween Idle Loop untuk Tombol Main (Efek Mengambang)
        this.tweens.add({
            targets: [btnPlayMap, btnPlayReg], 
            scale: '+=0.01', 
            y: '+=5', 
            duration: 2000, 
            ease: 'Sine.easeInOut', 
            yoyo: true, 
            repeat: -1, 
            delay: 1200
        });
          
        // Tween Idle Loop untuk Tombol Container Kecil (Efek Mengembang Elastis)
        this.tweens.add({
            targets: [btnHis, btnAchieve], 
            scaleX: 1.02, 
            scaleY: 0.98, 
            duration: 500, 
            repeat: -1, 
            yoyo: true, 
            delay: 1200
        });

        // --- MOUSE FLARE PARTICLE SYSTEM ---
        const mouseParticles = this.add.particles('flares').setDepth(10);
        
        mouseParticles.createEmitter({
            frame: 'blue', // Dipastikan data atlas ter-preload dengan benar
            speed: { min: -10, max: 10 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 400,
            blendMode: Phaser.BlendModes.ADD,
            quantity: 1,
            frequency: 25,
            follow: this.input.activePointer
        });
    }

    createSmallButton(x, y, text, onClick) {
        const container = this.add.container(x, y);
        const btn = this.add.image(0, 0, 'btnSmall').setScale(0.15).setInteractive();
        const txt = this.add.text(0, 0, text, {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        btn.on('pointerover', () => btn.setTexture('btnSmallHover'));
        btn.on('pointerout', () => btn.setTexture('btnSmall'));
        btn.on('pointerdown', () => { btn.setTexture('btnSmallClick'); playSFX(this, 'sndClick'); });
        btn.on('pointerup', () => {
            btn.setTexture('btnSmall'); 
            if (onClick) onClick();
        });
        
        container.add([btn, txt]);
        return container;
    }
}